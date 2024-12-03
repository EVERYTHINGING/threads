import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View, Text, TouchableOpacity, Image, Linking } from 'react-native';

export interface User {
  id: number;
  username: string;
  email: string;
  is_approved_seller: boolean;
  avatar_url?: string;
  venmo_username?: string;
}

export interface PostImage {
  id: number;
  post_id: number;
  url: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  title?: string;
  content: string;
  created_at: string;
  saved_by?: string[];
  price: number;
  user?: User;
  images?: { url: string }[];
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user?: User;
}

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  CreatePost: undefined;
  Profile: undefined;
  User: { userId: number };
  SavedPosts: undefined;
  Notifications: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;