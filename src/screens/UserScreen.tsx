import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import type { RootStackScreenProps } from '../types';
import { Feed } from '../components/Feed';
import { useUser } from '../hooks/useUser';
import { Loading } from '../components/Loading';

export function UserScreen({ route, navigation }: RootStackScreenProps<'User'>) {
  const { userId } = route.params;
  const { user, isLoading } = useUser(userId);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading  />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.avatar_url ? (
              <Image 
                source={{ uri: user.avatar_url }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.status}>
              {user.is_approved_seller ? "Approved Seller" : "Regular User"}
            </Text>
          </View>
        </View>
      </View>
      <Feed navigation={navigation} userId={userId} isProfileView={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    color: '#262626',
  },
  status: {
    fontSize: 16,
    color: '#666',
  },
}); 