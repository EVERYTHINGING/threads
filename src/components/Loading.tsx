import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

interface LoadingProps {
  size?: number;
}

export function Loading({ size = 36 }: LoadingProps) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/snail.gif')}
        style={[styles.image, { width: size, height: size }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'contain',
  },
}); 