import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import type { RootStackScreenProps } from '../types';
import { useNotifications } from '../hooks/useNotifications';
import { Loading } from '../components/Loading';

export function NotificationsScreen({ navigation }: RootStackScreenProps<'Notifications'>) {
  const { notifications, isLoading, markAsRead } = useNotifications();

  const renderNotification = ({ item: notification }) => {
    const getNotificationText = () => {
      switch (notification.type) {
        case 'like':
          return 'liked your post';
        case 'comment':
          return 'commented on your post';
        case 'follow':
          return 'started following you';
        default:
          return '';
      }
    };

    const handlePress = () => {
      if (!notification.is_read) {
        console.log('Triggering markAsRead for notification:', notification.id);
        markAsRead.mutate(notification.id);
      }
      if (notification.post_id) {
        navigation.navigate('Post', { postId: notification.post_id });
      } else if (notification.type === 'follow') {
        navigation.navigate('User', { userId: notification.actor_id });
      }
    };

    return (
      <TouchableOpacity 
        style={styles.notificationItem}
        onPress={handlePress}
      >
        {notification.actor.avatar_url ? (
          <Image 
            source={{ uri: notification.actor.avatar_url }} 
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {notification.actor.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.actor.username}</Text>
            {' '}{getNotificationText()}
          </Text>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(notification.created_at))} ago
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#262626',
  },
  username: {
    fontWeight: '600',
    color: '#262626',
  },
  timestamp: {
    fontSize: 13,
    color: '#8e8e8e',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e8e',
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
}); 