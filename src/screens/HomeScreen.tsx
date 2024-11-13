import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { RootStackScreenProps } from '../types';
import { Feed } from '../components/Feed';

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  return (
    <View style={styles.container}>
      <Feed navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});