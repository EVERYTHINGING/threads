import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Post, User } from '../types';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { useAuth } from './useAuth';

interface UsePostsOptions {
  userId?: number;
  limit?: number;
  sortOrder?: 'desc' | 'asc';
  showSavedOnly?: boolean;
  postId?: number;
}

interface CreatePostData {
  title: string;
  content: string;
  price: number;
  images?: string[];
}

export function usePosts(options: UsePostsOptions = {}) {
  const { 
    userId, 
    limit = 5, 
    sortOrder = 'desc', 
    showSavedOnly, 
    postId 
  } = options;
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = user?.is_admin || false;

  const { data: posts, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts', { userId, sortOrder, showSavedOnly, postId, isAdmin }],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:users(*),
          images:post_images(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: sortOrder === 'asc' })
        .range(pageParam, pageParam + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (!isAdmin) {
        query = query.eq('is_approved', true);
      }

      if (showSavedOnly && user) {
        query = query.contains('saved_by', [user.id.toString()]);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return {
        posts: data as Post[],
        nextPage: data.length === limit ? pageParam + limit : undefined,
        totalCount: count || 0
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0
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
          upsert: false,
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path, {
          transform: {
            width: 400,
            height: 400,
            resize: 'contain', // 'cover' | 'fill'
          },
        });

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
      price, 
      images 
    }: { 
      title: string; 
      content: string;
      price: number;
      images?: string[];
    }) => {
      console.log('Creating post with images:', images?.length);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Create post; is_approved defaults to false
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([{ 
          title, 
          content,
          price,
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

      // If post is not approved, send notifications to admins
      if (!post.is_approved) {
        const { data: admins, error: adminError } = await supabase
          .from('users')
          .select('id')
          .eq('is_admin', true);

        if (adminError) {
          console.error('Error fetching admins:', adminError);
          // Optionally, handle error or throw
        } else if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            user_id: admin.id,
            actor_id: userData.user.id,
            post_id: post.id,
            type: 'post_pending'
          }));

          const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notifications);

          if (notificationError) {
            console.error('Error inserting notifications:', notificationError);
            // Optionally, handle error or throw
          }
        }
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const toggleApproval = useMutation({
    mutationFn: async (post: Post) => {
      const newApprovalStatus = !post.is_approved;

      const { data, error } = await supabase
        .from('posts')
        .update({ is_approved: newApprovalStatus })
        .eq('id', post.id)
        .select()
        .single();

      if (error) throw error;

      // Optionally, notify the post owner about approval status change.
      return data;
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

  const savePost = useMutation({
    mutationFn: async ({ postId, savedBy }: { postId: number; savedBy: string[] }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data: post, error } = await supabase
        .from('posts')
        .update({ 
          saved_by: savedBy.length
            ? savedBy.filter(id => id !== userData.user.id.toString())
            : [userData.user.id]
        })
        .eq('id', postId)
        .select();

      if (error) throw error;
      console.log('Post saved:', post);
      return post;
    },
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    posts: posts?.pages.flatMap(page => page.posts) ?? [],
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createPost,
    savePost,
    pickImages,
    toggleApproval,
  };
}