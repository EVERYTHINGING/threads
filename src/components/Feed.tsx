import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Text, Image } from 'react-native';
import { PostCard } from './PostCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { CommentBottomSheet } from './CommentBottomSheet';
import { usePosts } from '../hooks/usePosts';
import type { Post } from '../types';
import { Loading } from './Loading';

interface FeedProps {
  navigation: any;
  userId?: number;
  isProfileView?: boolean;
  showSavedOnly?: boolean;
  user?: {
    username: string;
    avatar_url?: string;
    is_approved_seller?: boolean;
  };
}

export function Feed({ navigation, userId, isProfileView = false, showSavedOnly = false, user }: FeedProps) {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const { 
    posts, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage
  } = usePosts({ userId, sortOrder, showSavedOnly });

  useEffect(() => {
  }, [sortOrder]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [shouldExpand, setShouldExpand] = useState(false);

  const handleCommentPress = (postId: number) => {
    setSelectedPostId(postId);
    setShouldExpand(true);
  };

  useEffect(() => {
    if (shouldExpand && bottomSheetRef.current) {
      bottomSheetRef.current.expand();
      setShouldExpand(false);
    }
  }, [shouldExpand, selectedPostId]);

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'desc' ? 'asc' : 'desc');
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <Loading  />
      </View>
    );
  };

  const renderHeader = () => {
    if (!isProfileView || !user) return null;
    return (
      <View style={styles.userInfo}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.avatar_url ? (
              <Image 
                source={{ uri: user.avatar_url }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.status}>
              {user.is_approved_seller ? "Approved Seller" : "Regular User"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading  />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.sortButton} 
        onPress={toggleSortOrder}
      >
        <Icon 
          name={sortOrder === 'desc' ? 'arrow-downward' : 'arrow-upward'} 
          size={24} 
          color="#007AFF" 
        />
        <Text style={styles.sortButtonText}>
          {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onCommentPress={handleCommentPress}
            isProfileView={isProfileView}
          />
        )}
        ListHeaderComponent={renderHeader}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />

      <CommentBottomSheet
        postId={selectedPostId || 0}
        bottomSheetRef={bottomSheetRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    rowGap: 0,
    columnGap: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: { 
    //padding: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  sortButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  userInfo: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    color: '#262626',
  },
  status: {
    fontSize: 16,
    color: '#666',
  },
}); 