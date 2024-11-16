import React, { useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { Loading } from './Loading';

const ImageWithSpinner = ({ source, style }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      {isLoading && <Loading />}
      <Image
        source={source}
        style={[styles.image, style]}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    // Your image style
  },
});

export default ImageWithSpinner;