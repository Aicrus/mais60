import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthIndex() {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem('onboardingCompleted');
        setShowOnboarding(done !== 'true');
      } catch {
        setShowOnboarding(true);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <Redirect href={showOnboarding ? '/(auth)/onboarding/welcome' : '/(auth)/login'} />
  );
}


