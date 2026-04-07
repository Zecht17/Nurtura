
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const EmergencyAlertPage = () => {
  const router = useRouter();
  return (
    <LinearGradient
      colors={["#F0FDF4", "#ECFDF5"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <View style={styles.container}>
        <Feather name="check-circle" size={80} color="#22C55E" style={{ marginBottom: 24 }} />
        <Text style={styles.title}>Alert Sent!</Text>
        <Text style={styles.description}>
          Your emergency contacts have been notified and help is on the way.
        </Text>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Send Another Alert</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/') }>
          <Text style={styles.secondaryButtonText}>←  Back to Dashboard</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#222',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 320,
  },
  primaryButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: "80%",
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: "80%",
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmergencyAlertPage;