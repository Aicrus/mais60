# 🔒 REGRAS.md - Mais 60

## 🎯 Propósito e Escopo
Este documento é o guia mestre OBRIGATÓRIO que estabelece as regras invioláveis para TODAS as modificações no projeto. Toda interação deve seguir estas diretrizes RIGOROSAMENTE.

## 🚨 Regras Primárias (NUNCA IGNORAR)

1. **Princípio da Preservação**
   - NUNCA modifique código existente sem solicitação explícita
   - SEMPRE preserve toda a estrutura atual do projeto
   - MANTENHA todos os padrões e convenções existentes

2. **Princípio da Consistência**
   - SEMPRE siga o Design System estabelecido em `tailwind.config.js`
   - NUNCA introduza novos padrões sem autorização
   - MANTENHA a coerência com o código existente

3. **Princípio da Mínima Interferência**
   - FAÇA apenas o que foi especificamente solicitado
   - EVITE alterações além do escopo definido
   - CONSULTE antes de fazer alterações adicionais

## ⚡ Diretrizes de Modificação

### 🚫 Proibições Absolutas
1. NÃO altere:
   - Cores não mencionadas
   - Estrutura de arquivos
   - Nomes de variáveis/funções
   - Dependências/versões
   - Configurações existentes
   - Padrões de código

2. NÃO adicione:
   - Novas dependências sem autorização
   - Funcionalidades não solicitadas
   - Novos arquivos sem pedido explícito

### ✅ Ações Obrigatórias
1. SEMPRE:
   - Siga o Design System (tailwind.config.js)
   - Use as classes de tema do NativeWind/Tailwind
   - Mantenha a responsividade (hooks/useResponsive)
   - Preserve a tipagem TypeScript
   - Respeite os breakpoints definidos

2. ANTES de cada modificação:
   - Confirme o escopo exato da mudança
   - Verifique impactos em outras partes
   - Valide a necessidade real da alteração

## 🎨 Design System e Responsividade

### 📚 Consultando Configurações do Design System (OBRIGATÓRIO)
```typescript
// SEMPRE consulte o arquivo tailwind.config.js para obter as configurações atualizadas:
// 1. CORES - Consulte a seção colors em tailwind.config.js
//    Importante: Use sempre o prefixo correto (bg-, text-, border-) e o sufixo do tema (-light ou -dark)
//    NÃO use cores genéricas do Tailwind

// 2. ESPAÇAMENTOS - Consulte a seção spacing em tailwind.config.js 
//    Prefira usar os aliases semânticos: xs, sm, md, lg, xl, etc.

// 3. TIPOGRAFIA - Consulte as seções fontFamily e fontSize em tailwind.config.js
//    Use os nomes de classes definidos, como: text-body-md, font-jakarta-regular, etc.
//    ATENÇÃO: O projeto suporta duas abordagens para fontes:
//    1. Fontes do Google (@expo-google-fonts) - Preferencial, via NPM
//    2. Fontes personalizadas (assets/fonts) - Para fontes não disponíveis no Google Fonts

// 4. SOMBRAS - Consulte a seção boxShadow em tailwind.config.js

// 5. BORDAS - Consulte a seção borderRadius em tailwind.config.js

// Aplicação correta baseada no tema atual:
const isDark = currentTheme === 'dark';

// ✅ CORRETO: Uso condicional para temas - SEM DEFINIR VALORES ESPECÍFICOS
<View className={`${isDark ? '...-dark' : '...-light'}`}>
  <Text>Consulte tailwind.config.js para valores corretos</Text>
</View>
```

### 📱 Breakpoints e Responsividade
```typescript
// SEMPRE consulte as definições oficiais de breakpoints:
// 1. BREAKPOINTS - Veja os valores atualizados em hooks/useResponsive.ts ou constants/Breakpoints.ts
// 2. MEDIA QUERIES - Consulte o código-fonte para media queries específicas

// ✅ CORRETO - Usando o hook useResponsive do projeto
import { useResponsive } from '../hooks/useResponsive';

// No componente - obtenha as informações de responsividade:
const { responsive, isMobile, isTablet, isDesktop } = useResponsive();

// Aplique estilos responsivos usando o helper responsive:
const responsiveStyle = {
  // Use valores adaptados a cada breakpoint
  someProperty: responsive({
    mobile: 'valorMobile',    // Para dispositivos móveis
    tablet: 'valorTablet',    // Para tablets
    desktop: 'valorDesktop',  // Para desktops
    default: 'valorPadrão'    // Valor padrão
  })
}
```

## 📱 Regras Específicas do Expo

1. **Configurações do Expo**
   - NUNCA altere o app.json sem autorização
   - MANTENHA as configurações de plugins inalteradas
   - RESPEITE as configurações específicas de plataforma

## 🔍 Checklist de Verificação (USAR EM TODA MODIFICAÇÃO)

1. [ ] A modificação foi EXPLICITAMENTE solicitada?
2. [ ] Está usando APENAS os imports corretos?
3. [ ] Mantém suporte a tema claro/escuro?
4. [ ] Respeita TODOS os breakpoints?
5. [ ] Preserva TODA a estrutura existente?
6. [ ] Mantém TODA a tipagem TypeScript?
7. [ ] Respeita a configuração da StatusBar para ambos os temas?

## 📋 Exemplo Prático

Se receber: "Mude a cor do botão para azul"

```typescript
// ✅ CORRETO - Apenas o solicitado, consultando o arquivo de configuração
// Consulte as cores em tailwind.config.js
style={{ 
  backgroundColor: COLORS[currentTheme].primary // Obtenha a cor do sistema de design
}}

// ✅ CORRETO - Usando classes Tailwind com valores do sistema
// Consulte as cores em tailwind.config.js
<Button className={isDark ? 'bg-primary-dark' : 'bg-primary-light'}>
  Botão
</Button>

// ❌ ERRADO - Alterações não solicitadas
style={{ 
  backgroundColor: COLORS[currentTheme].primary,
  margin: 20,        // NÃO SOLICITADO
  padding: 10,       // NÃO SOLICITADO
  borderRadius: 8    // NÃO SOLICITADO
}}

// ❌ ERRADO - Valores codificados diretamente
style={{ 
  backgroundColor: '#4A6FA5', // ERRADO: uso direto de código de cor
  color: 'blue'               // ERRADO: cores genéricas
}}
```

## 🎯 Conclusão

Este documento é a BASE de todas as modificações. NUNCA ignore estas regras. Em caso de dúvida, SEMPRE pergunte antes de modificar.


