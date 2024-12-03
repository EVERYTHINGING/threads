import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { typography } from '../theme/typography';

interface UserMention {
  id: number;
  username: string;
  avatar_url?: string;
}

interface UserMentionDropdownProps {
  searchText: string;
  onSelectUser: (user: UserMention) => void;
}

export function UserMentionDropdown({ searchText, onSelectUser }: UserMentionDropdownProps) {
  const [users, setUsers] = React.useState<UserMention[]>([]);

  React.useEffect(() => {
    if (searchText.length < 1) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .ilike('username', `${searchText}%`)
        .limit(5);

      if (error) {
        console.error('Error searching users:', error);
        return;
      }

      setUsers(data as UserMention[]);
    };

    searchUsers();
  }, [searchText]);

  if (users.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => onSelectUser(item)}
          >
            <Text style={styles.username}>@{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  username: {
    fontFamily: typography.medium,
    fontSize: 16,
  },
}); 