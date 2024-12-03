import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: number;
  user_id: number;
  actor_id: number;
  post_id?: number;
  type: 'like' | 'comment' | 'follow';
  created_at: string;
  read: boolean;
  actor: {
    username: string;
    avatar_url?: string;
  };
}

export function useNotifications() {
  const queryClient = useQueryClient();

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

      console.log(data);

      if (error) throw error;
      return data as Notification[];
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: number) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications,
    isLoading,
    markAsRead,
  };
} 