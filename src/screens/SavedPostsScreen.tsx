import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { RootStackScreenProps } from '../types';
import { Feed } from '../components/Feed';

export function SavedPostsScreen({ navigation }: RootStackScreenProps<'SavedPosts'>) {
  return (
    <View style={styles.container}>
      <Feed 
        navigation={navigation} 
        showSavedOnly={true}
        isProfileView={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 