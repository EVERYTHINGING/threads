import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import type { RootStackScreenProps } from '../types';
import { usePosts } from '../hooks/usePosts';

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const { posts, isLoading } = usePosts();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.createButtonText}>Create Post</Text>
      </TouchableOpacity>
      
      <ScrollView>
        {posts?.map(post => (
          <TouchableOpacity
            key={post.id}
            style={styles.card}
            onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
          >
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.meta}>
              by {post.user?.username} • {formatDistanceToNow(new Date(post.created_at))} ago
            </Text>
            <Text style={styles.content}>{post.content}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
  },
});