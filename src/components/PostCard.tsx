import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { CommentBottomSheet } from './CommentBottomSheet';
import { ImageGallery } from './ImageGallery';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleCommentPress = () => {
    bottomSheetRef.current?.expand();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        by {post.user?.username} • {formatDistanceToNow(new Date(post.created_at))} ago
      </Text>
      <Text style={styles.content}>{post.content}</Text>
      
      {post.images && post.images.length > 0 && (
        <ImageGallery images={post.images} />
      )}

      <TouchableOpacity 
        style={styles.commentButton}
        onPress={handleCommentPress}
      >
        <Icon name="comment" size={20} color="#666" />
        <Text style={styles.commentButtonText}>Comments</Text>
      </TouchableOpacity>

      <CommentBottomSheet
        postId={post.id}
        bottomSheetRef={bottomSheetRef}
      />
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
}); 