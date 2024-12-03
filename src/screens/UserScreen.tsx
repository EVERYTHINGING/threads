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
      <Feed navigation={navigation} userId={userId} isProfileView={true} user={user} />
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
}); 