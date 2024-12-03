import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import type { RootStackScreenProps } from '../types';
import { PostCard } from '../components/PostCard';
import { CommentBottomSheet } from '../components/CommentBottomSheet';
import { Loading } from '../components/Loading';
import { usePosts } from '../hooks/usePosts';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export function PostScreen({ route, navigation }: RootStackScreenProps<'Post'>) {
  const { postId } = route.params;
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const { posts, isLoading } = usePosts({ postId });
  const post = posts?.[0];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ textAlign: 'center' }}>Post not found</Text>
      </View>
    );
  }

  const handleCommentPress = () => {
    bottomSheetRef.current?.expand();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <PostCard 
          post={post}
          onCommentPress={handleCommentPress}
        />
      </ScrollView>
      
      <CommentBottomSheet 
        postId={postId}
        bottomSheetRef={bottomSheetRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 