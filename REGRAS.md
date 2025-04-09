# 🔒 REGRAS.md - Projeto Origem

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
   - Siga o Design System
   - Use as classes de tema do NativeWind/Tailwind
   - Mantenha a responsividade
   - Preserve a tipagem TypeScript
   - Respeite os breakpoints definidos

2. ANTES de cada modificação:
   - Confirme o escopo exato da mudança
   - Verifique impactos em outras partes
   - Valide a necessidade real da alteração

## 🎨 Sistema de Design (NUNCA IGNORAR)

### 📱 Breakpoints (SEMPRE RESPEITAR)
```typescript
// Os breakpoints reais do projeto são:
export const BREAKPOINTS = {
  // Celulares pequenos (até iPhone SE)
  SMALL_MOBILE: 320, 
  
  // Celulares maiores (até iPhone Pro Max)
  MOBILE: 480,
  
  // Tablets pequenos e celulares em landscape
  SMALL_TABLET: 640,
  
  // Tablets (iPad, etc)
  TABLET: 768,
  
  // Tablets grandes e pequenos laptops
  LARGE_TABLET: 900,
  
  // Laptops e desktops
  DESKTOP: 1024,
  
  // Telas grandes
  LARGE_DESKTOP: 1280,
};

// ✅ CORRETO - Usando o hook useResponsive
import { useResponsive } from '../hooks/useResponsive';

// No componente
const { responsive, isMobile, isTablet, isDesktop } = useResponsive();

// Usar valores diferentes por breakpoint:
const styles = {
  maxWidth: responsive({
    mobile: '95%',    // Para mobile (até 480px)
    tablet: '70%',    // Para tablet (481-1023px)
    desktop: '50%',   // Para desktop (1024px+)
    default: '95%'    // Valor padrão se nenhum caso acima se aplicar
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
5. [ ] Usa APENAS constantes do Design System?
6. [ ] Preserva TODA a estrutura existente?
7. [ ] Mantém TODA a tipagem TypeScript?
8. [ ] Respeita a configuração da StatusBar para ambos os temas?

## ⚠️ Processo de Modificação

1. **ANTES de modificar:**
   - Confirme o escopo EXATO
   - Verifique dependências
   - Identifique impactos

2. **DURANTE a modificação:**
   - Siga o checklist RIGOROSAMENTE
   - Mantenha o escopo limitado
   - Documente alterações

3. **APÓS a modificação:**
   - Verifique em todos os temas
   - Teste em todos os breakpoints
   - Confirme tipagem TypeScript

## 📋 Exemplo Prático

Se receber: "Mude a cor do botão para azul"

```typescript
// ✅ CORRETO - Apenas o solicitado
style={{ 
  backgroundColor: COLORS[currentTheme].primary 
}}

// ❌ ERRADO - Alterações não solicitadas
style={{ 
  backgroundColor: COLORS[currentTheme].primary,
  margin: 20,        // NÃO SOLICITADO
  padding: 10,       // NÃO SOLICITADO
  borderRadius: 8    // NÃO SOLICITADO
}}
```

## 🎯 Conclusão

Este documento é a BASE de todas as modificações. NUNCA ignore estas regras. Em caso de dúvida, SEMPRE pergunte antes de modificar.
