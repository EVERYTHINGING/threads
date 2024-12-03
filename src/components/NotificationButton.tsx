import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationButtonProps {
  onPress: () => void;
}

export function NotificationButton({ onPress }: NotificationButtonProps) {
  const { notifications } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Icon name="notifications" size={24} color="#007AFF" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#34C759',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}); 