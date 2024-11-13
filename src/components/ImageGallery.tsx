import React from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Image, ActivityIndicator, Animated } from 'react-native';
import Gallery, { GalleryRef }from 'react-native-awesome-gallery';
import type { PostImage } from '../types';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface ImageGalleryProps {
  images: PostImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [containerWidth, setContainerWidth] = React.useState(WINDOW_WIDTH);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const galleryRef = React.useRef<GalleryRef>(null);
  if (!images?.length) return null;

  const formattedImages = images.map(image => image.url);

  return (
    <View 
      style={styles.container}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <Gallery
        renderItem={({ item }) => {
          const [loading, setLoading] = React.useState(true);
          const fadeAnim = React.useRef(new Animated.Value(0)).current;

          const handleLoadEnd = () => {
            setLoading(false);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }).start();
          };

          return (
            <View style={styles.imageContainer}>
              {loading && (
                <ActivityIndicator 
                  size="small" 
                  color="#0000ff" 
                  style={styles.spinner} 
                />
              )}
              <Animated.Image 
                source={{ uri: item }} 
                style={[styles.image, { opacity: fadeAnim }]}
                onLoadEnd={handleLoadEnd}
              />
            </View>
          );
        }}
        ref={galleryRef}
        data={formattedImages}
        initialIndex={0}
        containerDimensions={{
          width: containerWidth,
          height: containerWidth,
        }}
        emptySpaceWidth={0}
        disableVerticalSwipe={true}
        style={styles.gallery}
        onIndexChange={setActiveIndex}
      />
       <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
           {images.map((_, index) => (
             <TouchableOpacity
               key={index}
               onPress={() => setActiveIndex(index)}
               style={{
                 width: 10,
                 height: 10,
                 borderRadius: 5,
                 backgroundColor: index === activeIndex ? 'blue' : 'gray',
                 margin: 5,
               }}
             />
           ))}
         </View>
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
});
