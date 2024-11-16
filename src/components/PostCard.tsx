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
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';

interface PostCardProps {
  post: Post;
  onCommentPress: (postId: number) => void;
}

export function PostCard({ post, onCommentPress }: PostCardProps) {
  const { comments } = useComments(post.id);
  const { savePost } = usePosts();
  const { user } = useAuth();
  const commentCount = comments?.length || 0;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const isSaved = post.saved_by?.includes(user?.id.toString() || '');
  
  const handleSave = async () => {
    try {
      await savePost.mutateAsync({
        postId: post.id,
        savedBy: post.saved_by || []
      });
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

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

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={savePost.isPending}
        >
          <View style={styles.emojiContainer}>
            {isSaved ? (
              <View style={styles.saveIconContainer}>
                <Text style={styles.heartEmoji}>💖</Text>
              </View>
            ) : (
              <View style={styles.saveIconContainer}>
                <Text style={styles.heartEmoji}>🩷</Text>
                {savePost.isPending && (
                  <Image 
                    source={require('../../assets/sparkles.gif')} 
                    style={styles.sparklesOverlay}
                  />
                )}
              </View>
            )}
          </View>
          <Text style={styles.saveButtonText}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
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
    fontSize: 18,
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
    width: 35,
    height: 35,
    marginRight: 8,
  },
  heartEmoji: {
    fontSize: 25,
    marginRight: 0
  },
  saveButtonText: {
    fontFamily: typography.medium,
    color: '#8e8e8e',
    fontSize: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#efefef',
    paddingRight: 12,
  },
  emojiContainer: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  saveIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparklesOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
}); 