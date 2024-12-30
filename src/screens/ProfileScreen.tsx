import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import type { RootStackScreenProps } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Loading';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';

export function ProfileScreen({ navigation }: RootStackScreenProps<'Profile'>) {
  const { user, loading, signOut } = useAuth();
  const [venmoUsername, setVenmoUsername] = useState(user?.venmo_username || '');
  const [paypalUsername, setPaypalUsername] = useState(user?.paypal_username || '');
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = venmoUsername !== user?.venmo_username || paypalUsername !== user?.paypal_username;

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setIsSaving(true);
      
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `avatar-${user?.id}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(base64, 'base64');

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filename, buffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename, {
          transform: {
            width: 150,
            height: 150,
            resize: 'cover'
          }
        });

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', authUser.id)
        .select();

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          venmo_username: venmoUsername,
          paypal_username: paypalUsername
        })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Your information has been updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update your information');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={handlePickAvatar}
        >
          {user.avatar_url ? (
            <Image 
              source={{ uri: user.avatar_url }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.changeAvatarText}>Change Avatar</Text>
        </TouchableOpacity>

        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.status}>
          Status: {user.is_approved_seller ? "Approved Seller" : "Regular User"}
        </Text>
        
        <View style={styles.venmoContainer}>
          <Text style={styles.venmoLabel}>Venmo Username:</Text>
          <TextInput
            style={styles.venmoInput}
            value={venmoUsername}
            onChangeText={setVenmoUsername}
            placeholder="Enter your Venmo username"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.paypalContainer}>
          <Text style={styles.paypalLabel}>PayPal Username:</Text>
          <TextInput
            style={styles.paypalInput}
            value={paypalUsername}
            onChangeText={setPaypalUsername}
            placeholder="Enter your PayPal username"
            autoCapitalize="none"
          />
        </View>

        {hasChanges && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  venmoContainer: {
    marginTop: 16,
  },
  venmoLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  venmoInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  paypalContainer: {
    marginTop: 16,
  },
  paypalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  paypalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: '600',
  },
  changeAvatarText: {
    color: '#007AFF',
    fontSize: 16,
    marginTop: 8,
  },
});