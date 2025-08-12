import React from 'react';
import { ImageBackground } from 'react-native';

export default function OnboardingWelcome() {
  return (
    <ImageBackground
      source={require('@/assets/images/Homem Idoso Hidratando-se.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
  );
}


