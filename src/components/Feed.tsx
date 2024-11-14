import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { PostCard } from './PostCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { CommentBottomSheet } from './CommentBottomSheet';
import { usePosts } from '../hooks/usePosts';
import type { Post } from '../types';

interface FeedProps {
  navigation: any;
  userId?: number;
}

export function Feed({ navigation, userId }: FeedProps) {
  const { 
    posts, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePosts({ userId });

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

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onCommentPress={handleCommentPress}
          />
        )}
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

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>

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
    padding: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
}); 