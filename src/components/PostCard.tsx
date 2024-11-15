import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '../types';
import { ImageGallery } from './ImageGallery';
import { useComments } from '../hooks/useComments';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { typography } from '../theme/typography';

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
      <View style={styles.header}>
        <View style={styles.userAvatar} />
        <TouchableOpacity 
          onPress={() => navigation.navigate('User', { userId: post.user_id })}
        >
          <Text style={styles.username}>
            {post.user?.username}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.meta}>
        {formatDistanceToNow(new Date(post.created_at))} ago
      </Text>
      <Text style={styles.content}>{post.content}</Text>
      
      {post.images && post.images.length > 0 && (
        <ImageGallery images={post.images} />
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.commentButton}
          onPress={() => onCommentPress(post.id)}
        >
          <Text style={styles.commentEmoji}>💅</Text>
          <Text style={styles.commentButtonText}>
            {commentCount} Comments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton}>
          <Image 
            source={require('../../assets/bear-hugging-heart.png')} 
            style={styles.saveButtonIcon}
          />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#efefef',
  },
  username: {
    fontFamily: typography.semiBold,
    fontSize: 24,
    color: '#262626',
    letterSpacing: 1,
  },
  title: {
    fontFamily: typography.medium,
    fontSize: 14,
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  content: {
    fontFamily: typography.regular,
    fontSize: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  meta: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: '#8e8e8e',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#efefef',
  },
  commentButtonText: {
    fontFamily: typography.medium,
    marginLeft: 8,
    color: '#8e8e8e',
    fontSize: 15,
  },
  commentEmoji: {
    fontSize: 30,
    marginRight: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  saveButtonIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  saveButtonText: {
    fontFamily: typography.medium,
    color: '#8e8e8e',
    fontSize: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#efefef',
    paddingRight: 12,
  },
}); 