import { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface User {
  id: number;
  username: string;
  email: string;
  is_approved_seller: boolean;
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
  title: string;
  content: string;
  created_at: string;
  user?: User;
  images?: PostImage[];
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
  PostDetail: { postId: number };
  CreatePost: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;