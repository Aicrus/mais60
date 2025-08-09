import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingReset() {
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.removeItem('onboardingCompleted');
      } catch {}
    })();
  }, []);

  return <Redirect href="/(auth)/onboarding/welcome" />;
}


