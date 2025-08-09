import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ModuleScreen } from '@/components/modules/ModuleScreen';

// Mapeia e valida o parâmetro para os módulos aceitos
const allowedModules = [
  'atividade-fisica',
  'habitos-alimentares',
  'seguranca-domiciliar',
  'estimulacao-cognitiva',
  'saude-mental',
] as const;

type AllowedModule = typeof allowedModules[number];

export default function GenericModuleScreen() {
  const params = useLocalSearchParams<{ module?: string }>();
  const raw = (params.module || '').toString();

  const moduleKey: AllowedModule = (allowedModules as readonly string[]).includes(raw)
    ? (raw as AllowedModule)
    : 'atividade-fisica';

  return <ModuleScreen moduleKey={moduleKey} />;
}


