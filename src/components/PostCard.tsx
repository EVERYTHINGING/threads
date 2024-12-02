import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { Post } from '../types';
import { useComments } from '../hooks/useComments';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { typography } from '../theme/typography';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import ImageSlider from './ImageSlider';

interface PostCardProps {
  post: Post;
  onCommentPress: (postId: number) => void;
  isProfileView?: boolean;
}

export function PostCard({ post, onCommentPress, isProfileView = false }: PostCardProps) {
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

  const handleVenmoPress = () => {
    if (!post.user?.venmo_username || !post.price) return;
    
    const venmoUrl = `https://venmo.com/${post.user.venmo_username}?txn=pay&amount=${post.price}&note=${encodeURIComponent(post.title || '')}`;
    console.log('Venmo URL:', venmoUrl);
    Linking.openURL(venmoUrl);
  };

  return (
    <View style={[styles.container, isProfileView && styles.profileContainer]}>
      <View style={styles.topContainer}>
        <View style={styles.headerContainer}>
          {!isProfileView && (
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('User', { userId: post.user_id })}
              >
                {post.user?.avatar_url ? (
                  <Image 
                    source={{ uri: post.user.avatar_url }} 
                    style={styles.userAvatar}
                  />
                ) : (
                  <View style={styles.userAvatarPlaceholder}>
                    <Text style={styles.userAvatarText}>
                      {post.user?.username?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigation.navigate('User', { userId: post.user_id })}
              >
                <Text style={styles.username}>
                  {post.user?.username}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {post.price && post.user?.venmo_username && (
          <TouchableOpacity 
            onPress={handleVenmoPress}
            style={styles.venmoButton}
          >
            <View style={styles.priceWrapper}>
              <Text style={styles.dollarSign}>$</Text>
              <Text style={styles.priceText}>{post.price}</Text>
            </View>
            <Image 
              source={require('../../assets/venmo.png')} 
              style={styles.venmoLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={[
        styles.metaContainer, 
        isProfileView && styles.profileMetaContainer
      ]}>
        <Text style={styles.sparklesEmoji}>✨</Text>
        <Text style={[
          styles.meta, 
          isProfileView && styles.profileMeta
        ]}>
          {formatDistanceToNow(new Date(post.created_at))} ago
        </Text>
      </View>
      
      <Text style={[
        styles.content,
        isProfileView && styles.profileContent
      ]}>
        {post.content}
      </Text>
      
      {post.images && post.images.length > 0 && (
        <ImageSlider images={post.images.map(image => image.url)} />
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
              <Text style={styles.heartEmoji}>💖</Text>
            ) : (
              <Text style={styles.heartEmoji}>🩷</Text>
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
    paddingTop: 20,
    paddingBottom: 12,
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
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 4,
  },
  profileMetaContainer: {
    marginBottom: 12,
  },
  meta: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: '#8e8e8e',
  },
  profileMeta: {
    fontSize: 16,
    color: '#262626',
    fontFamily: typography.medium,
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
  profileContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 16,
  },
  profileContent: {
    fontSize: 16,
    marginBottom: 16,
  },
  sparklesEmoji: {
    fontSize: 16,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 12,
  },
  headerContainer: {
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  dollarSign: {
    fontSize: 14,
    fontFamily: typography.semiBold,
    marginRight: 1,
    marginTop: -5
  },
  priceText: {
    fontSize: 25,
    fontFamily: typography.semiBold,
  },
  venmoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingRight: 25,
    borderRadius: 20,
    justifyContent: 'space-between',
    minWidth: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginRight: -25,
  },
  venmoLogo: {
    display: 'none',
    width: 30,
    height: 30,
  },
}); 