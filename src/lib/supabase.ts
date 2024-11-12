import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://czunzjqqtgvanhvicucs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dW56anFxdGd2YW5odmljdWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyNTczNTgsImV4cCI6MjA0NTgzMzM1OH0.QgUgKjTlMAVsb8jrlCKdbricDWg3Pj0Vvp5Jp2bV2gg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});