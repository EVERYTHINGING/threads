import React from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Image, ActivityIndicator, Animated } from 'react-native';
import Gallery, { GalleryRef }from 'react-native-awesome-gallery';
import type { PostImage } from '../types';
import { Loading } from './Loading';
import ImageSlider from './ImageSlider';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface ImageGalleryProps {
  images: PostImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  if (!images?.length) return null;
  const formattedImages = images.map(image => image.url);

  return (
    <View style={styles.container}>
      <ImageSlider images={formattedImages}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    overflow: 'hidden',
  },
  gallery: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  spinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -70 }],
  },
});
