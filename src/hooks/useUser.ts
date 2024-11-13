import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export function useUser(userId: number) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as User;
    },
  });

  return {
    user,
    isLoading,
  };
} 