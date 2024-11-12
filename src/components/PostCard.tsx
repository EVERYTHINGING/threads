import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  onPress: () => void;
}

export function PostCard({ post, onPress }: PostCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        by {post.user?.username} • {formatDistanceToNow(new Date(post.created_at))} ago
      </Text>
      <Text numberOfLines={2} style={styles.content}>
        {post.content}
      </Text>
    </TouchableOpacity>
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
    color: '#444',
  },
}); 