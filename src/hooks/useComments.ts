import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Comment } from '../types';

export function useComments(postId: number) {
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      const { data, error } = await supabase
        .from('comments')
        .insert([{ 
          post_id: postId, 
          content,
          user_id: userData.user.id
        }])
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;

      // Extract mentioned usernames from content
      const mentions = content.match(/@(\w+)/g) || [];
      
      // Create notifications for mentioned users
      if (mentions.length > 0) {
        const usernames = mentions.map(mention => mention.slice(1));
        
        // Get user IDs for the mentioned usernames
        const { data: mentionedUsers, error: mentionError } = await supabase
          .from('users')
          .select('id')
          .in('username', usernames);

        if (mentionError) throw mentionError;

        // Create notifications for each mentioned user
        const notifications = mentionedUsers
          .filter(user => user.id !== userData.user.id) // Don't notify self
          .map(user => ({
            user_id: user.id,
            actor_id: userData.user.id,
            post_id: postId,
            type: 'comment'
          }));

        if (notifications.length > 0) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notifications);

          if (notificationError) throw notificationError;
        }
      }

      // Create notification for post owner (if different from commenter)
      if (postData.user_id !== userData.user.id) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: postData.user_id,
            actor_id: userData.user.id,
            post_id: postId,
            type: 'comment'
          }]);

        if (notificationError) throw notificationError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  return {
    comments,
    isLoading,
    addComment,
  };
}