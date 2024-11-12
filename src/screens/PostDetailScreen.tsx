import React from 'react';
import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import type { RootStackScreenProps } from '../types/index'
import { useComments } from '../hooks/useComments';
import { usePosts } from '../hooks/usePosts';
import { ImageGallery } from '../components/ImageGallery';

export function PostDetailScreen({ route }: RootStackScreenProps<'PostDetail'>) {
  const [newComment, setNewComment] = React.useState('');
  const { posts } = usePosts();
  const post = posts?.find(p => p.id === route.params.postId);
  const { comments, isLoading, addComment } = useComments(route.params.postId);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment.mutateAsync({ content: newComment });
      setNewComment('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  if (!post || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.postCard}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.meta}>
            by {post.user?.username} • {formatDistanceToNow(new Date(post.created_at))} ago
          </Text>
          <Text style={styles.content}>{post.content}</Text>
          
          {post.images && post.images.length > 0 && (
            <ImageGallery images={post.images} />
          )}
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <View style={styles.commentInput}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleAddComment}
              disabled={addComment.isPending}
            >
              {addComment.isPending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {comments?.map(comment => (
            <View key={comment.id} style={styles.commentCard}>
              <Text style={styles.commentMeta}>
                {comment.user?.username} • {formatDistanceToNow(new Date(comment.created_at))} ago
              </Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
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
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  commentInput: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    zIndex: 1
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  commentCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
  },
});