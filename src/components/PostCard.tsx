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
  const [isExpanded, setIsExpanded] = useState(false);
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

  const shouldTruncate = post.content.length > 200;
  const displayContent = shouldTruncate && !isExpanded 
    ? `${post.content.slice(0, 200)}...` 
    : post.content;

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
      
      <View style={styles.contentContainer}>
        <Text 
          style={[
            styles.content,
            isProfileView && styles.profileContent,
            shouldTruncate && !isExpanded && styles.truncatedContent
          ]}
        >
          {displayContent}
        </Text>
        
        {shouldTruncate && (
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Show Less' : 'Show More'}
            </Text>
          </TouchableOpacity>
        )}

        {post.price && post.user?.venmo_username && (
          <View style={styles.venmoContainer}>
            <TouchableOpacity 
              onPress={handleVenmoPress}
              style={styles.venmoButton}
            >
              <View style={styles.priceWrapper}>
                <Text style={styles.dollarSign}>$</Text>
                <Text style={styles.priceText}>{post.price}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.imageContainer}>
          {post.images && post.images.length > 0 && (
            <>
              <ImageSlider images={post.images.map(image => image.url)} />
            </>
          )}
        </View>
      </View>

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
    width: 30,
    height: 30,
    borderRadius: 30,
    marginRight: 8,
  },
  userAvatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 30,
    marginRight: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  username: {
    fontFamily: typography.semiBold,
    fontSize: 20,
    color: '#262626',
    letterSpacing: 0.5,
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
    marginBottom: 0,
    paddingHorizontal: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
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
    marginBottom: 12,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#efefef',
  },
  commentButtonText: {
    fontFamily: typography.medium,
    marginLeft: 4,
    color: '#8e8e8e',
    fontSize: 16,
  },
  commentEmoji: {
    fontSize: 24,
    marginRight: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  heartEmoji: {
    fontSize: 20,
  },
  saveButtonText: {
    fontFamily: typography.medium,
    color: '#8e8e8e',
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#efefef',
    paddingRight: 8,
  },
  emojiContainer: {
    width: 24,
    height: 24,
    marginRight: 4,
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
  },
  dollarSign: {
    fontSize: 14,
    fontFamily: typography.semiBold,
    marginRight: 1,
    marginTop: -5,
    color: '#262626',
  },
  priceText: {
    fontSize: 25,
    fontFamily: typography.semiBold,
    color: '#262626',
  },
  venmoLogo: {
    display: 'none',
    width: 30,
    height: 30,
  },
  contentContainer: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },
  venmoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    justifyContent: 'space-between',
    borderWidth: 0,
    borderColor: '#ddd',
    boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2)',
  },
  venmoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
  },
  truncatedContent: {
    maxHeight: 200,
  },
  expandButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  expandButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontFamily: typography.medium,
  },
}); 