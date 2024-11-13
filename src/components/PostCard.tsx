import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { Post } from '../types';
import { ImageGallery } from './ImageGallery';
import { useComments } from '../hooks/useComments';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

interface PostCardProps {
  post: Post;
  onCommentPress: (postId: number) => void;
}

export function PostCard({ post, onCommentPress }: PostCardProps) {
  const { comments } = useComments(post.id);
  const commentCount = comments?.length || 0;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <TouchableOpacity 
        onPress={() => navigation.navigate('User', { userId: post.user_id  })}
      >
        <Text style={[styles.meta, styles.username]}>
          {post.user?.username}
        </Text>
      </TouchableOpacity>
      <Text style={styles.meta}>
        • {formatDistanceToNow(new Date(post.created_at))} ago
      </Text>
      <Text style={styles.content}>{post.content}</Text>
      
      {post.images && post.images.length > 0 && (
        <ImageGallery images={post.images} />
      )}

      <TouchableOpacity 
        style={styles.commentButton}
        onPress={() => onCommentPress(post.id)}
      >
        <Icon name="comment" size={20} color="#666" />
        <Text style={styles.commentButtonText}>
          {commentCount} Comments
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
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
    marginBottom: 16,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  username: {
    color: '#007AFF',
  },
}); 