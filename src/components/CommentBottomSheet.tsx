import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { formatDistanceToNow } from 'date-fns';
import { useComments } from '../hooks/useComments';
import { Loading } from './Loading';

interface CommentBottomSheetProps {
  postId: number;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

export function CommentBottomSheet({ postId, bottomSheetRef }: CommentBottomSheetProps) {
  const [newComment, setNewComment] = React.useState('');
  const { comments, isLoading, addComment } = useComments(postId);
  
  // variables
  const snapPoints = useMemo(() => ['90%'], []);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment.mutateAsync({ content: newComment });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Add this callback to clear input when sheet closes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setNewComment('');
    }
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Comments ({comments?.length || 0})
        </Text>
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <Loading  />
        ) : (
          comments?.map(comment => (
            <View key={comment.id} style={styles.commentCard}>
              <Text style={styles.commentMeta}>
                {comment.user?.username} • {formatDistanceToNow(new Date(comment.created_at))} ago
              </Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))
        )}
      </BottomSheetScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
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
            <Loading />
          ) : (
            <Image 
              source={require('../../assets/up-arrow.png')} 
              style={styles.buttonIcon}
            />
          )}
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  commentCard: {
    backgroundColor: '#f8f8f8',
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
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
    backgroundColor: '#f8f8f8',
    lineHeight: 24,
  },
  button: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 30,
    height: 30,
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
}); 