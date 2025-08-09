import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [checked, setChecked] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('onboardingCompleted');
        setShouldShowOnboarding(flag !== 'true');
      } catch {
        setShouldShowOnboarding(true);
      } finally {
        setChecked(true);
      }
    })();
  }, []);

  if (!checked) return null;

  return (
    <Redirect href="/(auth)/onboarding/welcome" />
  );
}