import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import type { RootStackScreenProps } from '../types';
import { usePosts } from '../hooks/usePosts';

export function CreatePostScreen({ navigation }: RootStackScreenProps<'CreatePost'>) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { createPost, pickImages } = usePosts();

  const handleImagePick = async () => {
    try {
      const images = await pickImages();
      setSelectedImages(images);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      await createPost.mutateAsync({ 
        title, 
        content,
        price: numericPrice,
        images: selectedImages
      });
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={styles.priceInput}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.contentInput}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity 
        style={styles.imageButton} 
        onPress={handleImagePick}
      >
        <Text style={styles.imageButtonText}>Add Images</Text>
      </TouchableOpacity>

      {selectedImages.length > 0 && (
        <ScrollView 
          horizontal 
          style={styles.imagePreviewContainer}
          showsHorizontalScrollIndicator={false}
        >
          {selectedImages.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.imagePreview}
            />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleCreatePost}
        disabled={createPost.isPending}
      >
        {createPost.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Create Post</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  titleInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  priceInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  contentInput: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#E3E3E3',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    height: 100,
    marginBottom: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});