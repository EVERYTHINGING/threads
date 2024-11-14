import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.status}>
          {user.is_approved_seller ? "Approved Seller" : "Regular User"}
        </Text>
      </View>
      <Feed navigation={navigation} userId={userId} />
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
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  status: {
    fontSize: 16,
    color: '#666',
  },
}); 