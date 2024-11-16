import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

interface LoadingProps {
  size?: number;
}

export function Loading({ size = 70 }: LoadingProps) {
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
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'contain',
  },
}); 