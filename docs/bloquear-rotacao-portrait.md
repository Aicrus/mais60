## Bloquear rotação (somente retrato) no Expo/React Native

Guia rápido e reutilizável para manter o app apenas em modo retrato (vertical) no Expo/React Native.

### TL;DR (ordem recomendada)
- Adicione no `app.json`: `"orientation": "portrait"`.
- Para builds nativos, reforce também: iOS `UISupportedInterfaceOrientations` e Android `screenOrientation: "portrait"`.
- No Expo Go, use obrigatoriamente `expo-screen-orientation` para travar em tempo de execução.
- Para validar 100%, rode um development build: `npx expo run:android` ou `npx expo run:ios`.

---

### 1) Configuração estática (app.json)
Funciona em builds nativos (dev/prod). No Expo Go pode não ser respeitado totalmente, mas é importante manter.

```json
{
  "expo": {
    "orientation": "portrait",
    "ios": {
      "infoPlist": {
        "UISupportedInterfaceOrientations": [
          "UIInterfaceOrientationPortrait"
        ],
        "UISupportedInterfaceOrientations~ipad": [
          "UIInterfaceOrientationPortrait"
        ]
      }
    },
    "android": {
      "screenOrientation": "portrait"
    }
  }
}
```

Observações:
- Em iOS, você pode incluir também as variantes landscape se desejar suportá-las no iPad; aqui está limitado a retrato.
- Em Android, `screenOrientation: "portrait"` vale para builds; no Expo Go, use o lock dinâmico abaixo.

---

### 2) Bloqueio dinâmico com `expo-screen-orientation` (necessário no Expo Go)

Instale o pacote:

```bash
npx expo install expo-screen-orientation
```

Exemplo mínimo (App.js/tsx):

```tsx
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function App() {
  useEffect(() => {
    const lock = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch {}
    };
    lock();
  }, []);
  return null;
}
```

Exemplo com reforço (re-lock) e `expo-router` no layout raiz:

```tsx
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const relock = () => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      relock();
      const sub = ScreenOrientation.addOrientationChangeListener(relock);
      return () => ScreenOrientation.removeOrientationChangeListener(sub);
    }
  }, []);
  return null;
}
```

No `expo-router`, você pode ainda definir por tela:

```tsx
// Em uma tela específica
import { Stack } from 'expo-router';

export default function MinhaTela() {
  return (
    <>
      <Stack.Screen options={{ orientation: 'portrait' }} />
      {/* ...conteúdo... */}
    </>
  );
}
```

---

### 3) Limitações do Expo Go
- O Expo Go pode não bloquear 100% a rotação em todos os dispositivos/modelos.
- Por isso, use o lock dinâmico e, quando possível, valide em um build nativo.

---

### 4) Teste completo (build nativo)
Para testar de forma definitiva (respeita `app.json` + runtime lock):

```bash
npx expo run:android
# ou
npx expo run:ios
```

Alternativas:
- EAS Build (APK/IPA): `eas build --platform android` / `eas build --platform ios`.

---

### 5) Dicas e armadilhas comuns
- Após alterar o `app.json`, reinicie com cache limpo: `npx expo start -c`.
- Evite qualquer `unlockAsync` ou orientação landscape em telas específicas.
- Se usar `Modal` do React Native, defina: `supportedOrientations={["portrait"]}`.
- Players de vídeo/WebView: desabilite fullscreen que possa forçar landscape, ou mantenha o lock ativo.

---

### 6) Checklist rápido
- [ ] `app.json` com `"orientation": "portrait"`.
- [ ] iOS com `UISupportedInterfaceOrientations` limitado a retrato.
- [ ] Android com `screenOrientation: "portrait"` para builds.
- [ ] `expo-screen-orientation` instalado e lock no bootstrap (e opcionalmente re-lock no listener).
- [ ] Testado em development build (`npx expo run:*`).


