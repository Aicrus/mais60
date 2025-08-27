# 📞 Sistema de Ligação de Emergência

## Como Funciona a Ligação

O sistema de detecção de queda utiliza múltiplas abordagens para fazer ligações telefônicas, garantindo compatibilidade máxima entre plataformas.

### Ordem de Tentativas

1. **Communications API** (react-native-communications)
   - **Vantagens**: Mais rápida, cross-platform
   - **Limitações**: Requer instalação da biblioteca

2. **Linking API** (React Native built-in)
   - **Vantagens**: Sempre disponível, cross-platform
   - **Limitações**: Abre app nativo do telefone

## Implementação Técnica

### Android Nativo
```javascript
// 1. Communications API (preferida)
if (Communications?.phonecall) {
  Communications.phonecall(phoneNumber, false);
}

// 2. Linking (sempre funciona)
await Linking.openURL(`tel:${phoneNumber}`);
```

### iOS Nativo
```javascript
// iOS sempre usa Linking (mais confiável)
const supported = await Linking.canOpenURL(`tel:${phoneNumber}`);
if (supported) {
  await Linking.openURL(`tel:${phoneNumber}`);
}
```

## Permissões Necessárias

### Android Manifest
```xml
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
```

### iOS Info.plist
```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>tel</string>
</array>
```

## Limitações e Considerações

### Expo Go
- Apenas `Linking` funciona
- Não permite ligações diretas nativas
- Requer build de desenvolvimento

### Build de Desenvolvimento
- Todas as APIs nativas funcionam
- Melhor experiência do usuário
- Ligação mais rápida e confiável

### Build de Produção
- Melhor performance
- Integração completa com sistema
- Menos restrições de segurança

## Melhorias Futuras Possíveis

### 1. Ligações Diretas sem Confirmação
```javascript
// Requer permissões especiais
Telephony.call(phoneNumber, {
  skipCallConfirmation: true
});
```

### 2. Detecção de Atendimento
```javascript
// Monitorar se ligação foi atendida
Telephony.addCallStateListener((state) => {
  if (state === 'CONNECTED') {
    // Ligação atendida
  }
});
```

### 3. Ligações de Vídeo
```javascript
// Suporte a FaceTime/WhatsApp
Linking.openURL(`facetime://${phoneNumber}`);
```

## Testes Recomendados

### Cenários de Teste
1. **Expo Go**: Apenas Linking funciona
2. **Build Dev**: Todas APIs disponíveis
3. **Build Prod**: Performance otimizada
4. **Permissões negadas**: Tratamento de erro adequado
5. **Números inválidos**: Validação de entrada

### Dispositivos de Teste
- Android 8.0+ (Telephony API)
- iOS 11.0+ (Linking otimizado)
- Diferentes operadoras
- Áreas com sinal fraco

## Conclusão

O sistema atual oferece:
- ✅ Compatibilidade máxima
- ✅ Múltiplas camadas de fallback
- ✅ Feedback visual completo
- ✅ Tratamento robusto de erros
- ✅ Validação de permissões

Para melhor experiência, recomenda-se build de desenvolvimento ou produção com as bibliotecas nativas instaladas.</contents>
</xai:function_call">Read file successfully created at /Users/paulomorales/mais60saude/docs/ligacao-emergencia.md
