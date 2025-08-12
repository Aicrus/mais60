import React from 'react';
import { View } from 'react-native';
import LoginTelefone from './login-telefone';

export default function RegisterTelefone() {
  // Reutiliza a mesma tela de telefone ajustando o modo de cópia
  return (
    <View style={{ flex: 1 }}>
      <LoginTelefone mode="register" />
    </View>
  );
}


