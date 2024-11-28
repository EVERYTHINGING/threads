import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreatePostScreen } from './src/screens/CreatePostScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RootStackParamList } from './src/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserScreen } from './src/screens/UserScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ 
                headerRight: undefined,
                headerBackVisible: false 
              }}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={({ navigation }) => ({
                headerLeft: () => (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Profile')}
                    style={styles.headerButton}
                  >
                    <Icon name="account-circle" size={32} color="#666" />
                  </TouchableOpacity>
                ),
                headerRight: () => (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('CreatePost')}
                    style={styles.headerButton}
                  >
                    <Icon name="add" size={32} color="#007AFF" />
                  </TouchableOpacity>
                ),
                headerBackVisible: false,
              })}
            />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                headerRight: undefined
              }}
            />
            <Stack.Screen 
              name="User" 
              component={UserScreen}
              options={{
                title: 'User Profile'
              }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginHorizontal: 8,
    padding: 4,
  },
});