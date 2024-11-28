import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import type { RootStackScreenProps } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Loading';
import { supabase } from '../lib/supabase';

export function ProfileScreen({ navigation }: RootStackScreenProps<'Profile'>) {
  const { user, loading, signOut } = useAuth();
  const [venmoUsername, setVenmoUsername] = useState(user?.venmo_username || '');
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = venmoUsername !== user?.venmo_username;

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
        .update({ venmo_username: venmoUsername })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Venmo username updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update Venmo username');
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
  venmoText: {
    fontSize: 16,
    color: '#262626',
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
});