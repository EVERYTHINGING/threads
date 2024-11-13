import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { RootStackScreenProps } from '../types';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { CommentBottomSheet } from '../components/CommentBottomSheet';

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const { 
    posts, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePosts();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedPostId, setSelectedPostId] = React.useState<number | null>(null);
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
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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