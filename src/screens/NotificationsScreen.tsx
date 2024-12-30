import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { FlatList } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Loading } from '../components/Loading';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../hooks/useNotifications';
import { RootStackScreenProps } from '../types';
import { typography } from '../theme/typography';

export function NotificationsScreen({ navigation }: RootStackScreenProps<'Notifications'>) {
  const { notifications, isLoading, markAsRead } = useNotifications();

  const handleApprovePress = (notification: Notification) => {
    if (notification.post_id) {
      // Navigate to Post to approve
      navigation.navigate('Post', { postId: parseInt(notification.post_id) });
      // Optionally mark as read
      if (!notification.is_read) {
        markAsRead.mutate(notification.id);
      }
    }
  };

  const renderNotification = ({ item: notification }: { item: Notification }) => {
    const getNotificationText = () => {
      switch (notification.type) {
        case 'like':
          return 'liked your post';
        case 'comment':
          return 'commented on your post';
        case 'follow':
          return 'started following you';
        case 'post_pending':
          return 'A new post is pending approval';
        default:
          return '';
      }
    };

    const handlePress = () => {
      if (!notification.is_read) {
        console.log('Triggering markAsRead for notification:', notification.id);
        markAsRead.mutate(notification.id);
      }
      if (notification.post_id && notification.type === 'post_pending') {
        handleApprovePress(notification);
      } else if (notification.post_id) {
        navigation.navigate('Post', { postId: parseInt(notification.post_id) });
      } else if (notification.type === 'follow') {
        navigation.navigate('User', { userId: parseInt(notification.actor_id) });
      }
    };

    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem,
          notification.is_read && styles.readNotification
        ]}
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
          {notification.type === 'post_pending' && (
            <TouchableOpacity 
              style={styles.approveButton}
              onPress={() => handleApprovePress(notification)}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          )}
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
        keyExtractor={item => item.id}
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
    alignItems: 'flex-start',
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
  approveButton: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: typography.medium,
  },
  readNotification: {
    opacity: 0.5,
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