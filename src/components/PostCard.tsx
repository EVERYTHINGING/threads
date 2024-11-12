import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '../types';
import { ImageGallery } from './ImageGallery';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        by {post.user?.username} • {formatDistanceToNow(new Date(post.created_at))} ago
      </Text>
      <Text style={styles.content}>{post.content}</Text>
      
      {post.images && post.images.length > 0 && (
        <ImageGallery images={post.images} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
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
    marginBottom: 16,
  },
}); 