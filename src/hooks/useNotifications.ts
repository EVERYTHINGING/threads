import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  post_id?: string;
  type: 'like' | 'comment' | 'follow';
  created_at: string;
  is_read: boolean;
  actor: {
    username: string;
    avatar_url?: string;
  };
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:users!actor_id(username, avatar_url)
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: isFocused ? 30000 : false, // Refetch every 30 seconds when screen is focused
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      console.log('Attempting to mark notification as read:', notificationId);

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      return { id: notificationId, is_read: true };
    },
    onSuccess: () => {
      console.log('Notification marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
    }
  });

  return {
    notifications,
    isLoading,
    markAsRead,
  };
} 