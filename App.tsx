import React from 'react';
import { TouchableOpacity, StyleSheet, Image, View, Text } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreatePostScreen } from './src/screens/CreatePostScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SavedPostsScreen } from './src/screens/SavedPostsScreen';
import { RootStackParamList } from './src/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserScreen } from './src/screens/UserScreen';
import { useAuth } from './src/hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

export default function App() {
  const { user } = useAuth();
  const navigationRef = React.useRef<NavigationContainerRef<RootStackParamList>>(null);
  const routeNameRef = React.useRef<string>();

  const TabBar = () => {
    const [activeRoute, setActiveRoute] = React.useState('Home');

    React.useEffect(() => {
      const unsubscribe = navigationRef.current?.addListener('state', () => {
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
        setActiveRoute(currentRouteName || 'Home');
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }, []);

    const handleNavigation = (screenName: keyof RootStackParamList) => {
      if (navigationRef.current) {
        navigationRef.current.navigate(screenName as never);
      }
    };

    return (
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => handleNavigation('Home')}
        >
          <Icon 
            name="home" 
            size={28} 
            color={activeRoute === 'Home' ? "#007AFF" : "#666"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => handleNavigation('CreatePost')}
        >
          <Icon 
            name="add-circle" 
            size={32} 
            color={activeRoute === 'CreatePost' ? "#007AFF" : "#666"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => handleNavigation('SavedPosts')}
        >
          <Icon 
            name="bookmark" 
            size={28} 
            color={activeRoute === 'SavedPosts' ? "#007AFF" : "#666"} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer
          ref={navigationRef}
          onStateChange={() => {
            const currentRoute = navigationRef.current?.getCurrentRoute();
            routeNameRef.current = currentRoute?.name;
          }}
        >
          <Stack.Navigator 
            initialRouteName="Login"
            screenOptions={({ navigation, route }) => ({
              headerBackVisible: navigation.canGoBack() && navigation.getState().routes[navigation.getState().index - 1]?.name !== 'Login',
              gestureEnabled: navigation.canGoBack() && navigation.getState().routes[navigation.getState().index - 1]?.name !== 'Login',
              headerRight: route.name !== 'Login' ? () => (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Profile')}
                  style={styles.headerButton}
                >
                  {user?.avatar_url ? (
                    <Image 
                      source={{ uri: user.avatar_url }} 
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {user?.username?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : undefined,
            })}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ 
                headerRight: undefined,
                headerBackVisible: false 
              }}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'New Post' }} />
            <Stack.Screen name="SavedPosts" component={SavedPostsScreen} options={{ title: 'Saved Posts' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen 
              name="User" 
              component={UserScreen}
              options={{ title: 'User Profile' }}
            />
          </Stack.Navigator>
          {routeNameRef.current !== 'Login' && <TabBar />}
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  tabButton: {
    padding: 8,
  },
});