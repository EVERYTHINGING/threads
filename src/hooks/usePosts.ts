import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

export function usePosts() {
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(*),
          images:post_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
  });

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      console.log('Starting image upload for URI:', uri);
      
      // Read the file content
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get file extension and generate filename
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `${Date.now()}.${ext}`;
      
      console.log('Uploading file:', filename);
      
      // Convert base64 to Buffer
      const buffer = Buffer.from(base64, 'base64');
      
      // Upload to Supabase Storage using buffer
      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(filename, buffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const createPost = useMutation({
    mutationFn: async ({ 
      title, 
      content, 
      images 
    }: { 
      title: string; 
      content: string;
      images?: string[];
    }) => {
      console.log('Creating post with images:', images?.length);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([{ 
          title, 
          content,
          user_id: userData.user.id 
        }])
        .select()
        .single();

      if (postError) throw postError;

      // Upload images if any
      if (images?.length) {
        console.log('Starting image uploads...');
        const imageUrls = await Promise.all(
          images.map(uri => uploadImage(uri))
        );
        console.log('Image URLs:', imageUrls);

        const { error: imagesError } = await supabase
          .from('post_images')
          .insert(
            imageUrls.map(url => ({
              post_id: post.id,
              url
            }))
          );

        if (imagesError) throw imagesError;
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const pickImages = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      return result.assets.map(asset => asset.uri);
    }
    
    return [];
  };

  return {
    posts,
    isLoading,
    createPost,
    pickImages,
  };
}