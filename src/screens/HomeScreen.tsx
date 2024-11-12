import React from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator } from 'react-native';
import type { RootStackScreenProps } from '../types';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { useInfiniteQuery } from '@tanstack/react-query';

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const { 
    posts, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePosts();

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <PostCard post={item} />
      )}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.container}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});