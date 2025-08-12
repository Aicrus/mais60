import React from 'react';
import { View, Image } from 'react-native';
import LoginTelefone from './login-telefone';

export default function RegisterTelefone() {
  // Insere a mesma logo no topo e reutiliza a tela de login por telefone para manter consistência visual
  return (
    <View style={{ flex: 1 }}>
      {/* O LoginTelefone já renderiza a logo e o formulário no centro.
          Mantemos este wrapper apenas para garantir possíveis extensões futuras específicas do cadastro. */}
      <LoginTelefone />
    </View>
  );
}


