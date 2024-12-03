import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Pressable } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { formatDistanceToNow } from 'date-fns';
import { useComments } from '../hooks/useComments';
import { Loading } from './Loading';
import { UserMentionDropdown } from './UserMentionDropdown';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import type { User } from '../types';

interface CommentBottomSheetProps {
  postId: number;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

interface UserMention {
  id: number;
  username: string;
  avatar_url?: string;
}

export function CommentBottomSheet({ postId, bottomSheetRef }: CommentBottomSheetProps) {
  const [newComment, setNewComment] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const { comments, isLoading, addComment } = useComments(postId);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const snapPoints = useMemo(() => ['90%'], []);

  const handleTextChange = (text: string) => {
    setNewComment(text);
    
    // Handle mention detection
    const lastAtSymbol = text.lastIndexOf('@');
    if (lastAtSymbol >= 0 && lastAtSymbol === text.length - 1) {
      setMentionStart(lastAtSymbol);
      setMentionSearch('');
    } else if (mentionStart !== null && lastAtSymbol === mentionStart) {
      const searchText = text.slice(mentionStart + 1);
      setMentionSearch(searchText);
    } else if (mentionStart !== null && !text.includes('@', mentionStart)) {
      setMentionStart(null);
      setMentionSearch('');
    }
  };

  const handleSelectUser = (user: UserMention) => {
    if (mentionStart === null) return;
    
    const beforeMention = newComment.slice(0, mentionStart);
    const afterMention = newComment.slice(mentionStart + mentionSearch.length + 1);
    setNewComment(`${beforeMention}@${user.username} ${afterMention}`);
    setMentionStart(null);
    setMentionSearch('');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment.mutateAsync({ content: newComment });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleUserPress = (userId: number) => {
    navigation.navigate('User', { userId });
  };

  const renderCommentText = (content: string) => {
    const words = content.split(' ');
    return words.map((word, index) => {
      if (word.startsWith('@')) {
        // Find the mentioned user in the comments
        const username = word.slice(1);
        const mentionedUser = comments?.find(
          comment => comment.user?.username === username
        )?.user;

        if (mentionedUser) {
          return (
            <React.Fragment key={index}>
              <Pressable onPress={() => handleUserPress(mentionedUser.id)}>
                <Text style={styles.mention}>{word}</Text>
              </Pressable>
              {' '}
            </React.Fragment>
          );
        }
      }
      return word + ' ';
    });
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setNewComment('');
      setMentionStart(null);
      setMentionSearch('');
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
        <Text style={styles.title}>Comments ({comments?.length || 0})</Text>
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <Loading />
        ) : (
          comments?.map(comment => (
            <View key={comment.id} style={styles.commentCard}>
              <Text style={styles.commentMeta}>
                {comment.user?.username} • {formatDistanceToNow(new Date(comment.created_at))} ago
              </Text>
              <Text style={styles.commentContent}>
                {renderCommentText(comment.content)}
              </Text>
            </View>
          ))
        )}
      </BottomSheetScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={newComment}
            onChangeText={handleTextChange}
            multiline
            placeholder="Add a comment..."
          />
          {mentionStart !== null && (
            <UserMentionDropdown
              searchText={mentionSearch}
              onSelectUser={handleSelectUser}
            />
          )}
        </View>
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
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 18,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
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
  mention: {
    fontWeight: 'bold',
  },
}); 