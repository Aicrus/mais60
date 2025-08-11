import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Platform, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/inputs/Input';
import { Button } from '@/components/buttons/Button';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { getResponsiveValues, fontFamily as dsFontFamily } from '@/design-system/tokens/typography';
import { ChevronLeft, Upload } from 'lucide-react-native';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const titleType = getResponsiveValues('headline-lg');
  const descType = getResponsiveValues('body-md');
  const labelType = getResponsiveValues('label-md');

  const ui = useMemo(() => ({
    bgPrimary: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
    bgSecondary: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
    divider: isDark ? colors['divider-dark'] : colors['divider-light'],
    textPrimary: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    textSecondary: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
    primary: isDark ? colors['primary-dark'] : colors['primary-light'],
  }), [isDark]);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userId = session?.user?.id;
        const emailFromAuth = session?.user?.email || '';
        const nameFromAuth = ((session?.user?.user_metadata as any)?.name as string) || '';
        const avatarFromAuth = ((session?.user?.user_metadata as any)?.avatar_url as string) || '';

        if (!userId) return;

        const { data, error } = await supabase
          .from('usuarios')
          .select('nome, email, imagem_url, telefone')
          .eq('id', userId)
          .maybeSingle();

        if (!mounted) return;
        if (!error && data) {
          setNome(data.nome || nameFromAuth || '');
          setEmail(data.email || emailFromAuth || '');
          setAvatarUrl(data.imagem_url || avatarFromAuth || '');
          setTelefone(data.telefone || '');
        } else {
          setNome(nameFromAuth || '');
          setEmail(emailFromAuth || '');
          setAvatarUrl(avatarFromAuth || '');
          setTelefone('');
        }
      } catch (e) {
        // mantém estados padrão
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [session]);

  const validate = () => {
    let ok = true;
    if (!nome || nome.trim().length < 3) {
      setNomeError('Informe seu nome completo (mínimo 3 caracteres).');
      ok = false;
    } else {
      setNomeError('');
    }
    if (!email) {
      setEmailError('Email é obrigatório.');
      ok = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Digite um email válido.');
        ok = false;
      } else {
        setEmailError('');
      }
    }
    return ok;
  };

  const handlePickImageWeb = () => {
    if (Platform.OS !== 'web') return;
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = (input.files && input.files[0]) || null;
        if (!file) return;
        const url = await uploadToSupabaseStorage(file, file.type);
        if (url) setAvatarUrl(url);
      };
      fileInputRef.current = input;
    }
    fileInputRef.current!.click();
  };

  const handlePickImageNative = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      // iOS pode retornar 'limited' quando o usuário escolhe fotos específicas
      if (!(status === 'granted' || status === 'limited')) {
        alert('Permissão para acessar a galeria foi negada. Você pode permitir o acesso nas Configurações.');
        return;
      }
      const pickerOptions: any = { quality: 0.8 };
      // Compat: SDKs mais antigos usam MediaTypeOptions; SDKs recentes usam MediaType (e aceita array)
      if ((ImagePicker as any).MediaType) {
        pickerOptions.mediaTypes = [(ImagePicker as any).MediaType.Images];
      } else {
        pickerOptions.mediaTypes = (ImagePicker as any).MediaTypeOptions?.Images;
      }
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      // Normaliza formato para JPEG (corrige HEIC/HEIF e CMYK)
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      // Lê como base64 para garantir bytes válidos no RN e converte para Blob
      const base64 = await FileSystem.readAsStringAsync(manipulated.uri, { encoding: FileSystem.EncodingType.Base64 });
      const bytes = toByteArray(base64); // Uint8Array com bytes válidos
      const publicUrl = await uploadToSupabaseStorage(bytes as unknown as Blob, 'image/jpeg');
      if (publicUrl) setAvatarUrl(publicUrl);
    } catch (e) {
      console.error('Erro ao abrir seletor de imagens:', e);
      alert('Não foi possível abrir o seletor de imagens.');
    }
  };

  const uploadToSupabaseStorage = async (file: Blob | File | Uint8Array, contentType: string): Promise<string | null> => {
    try {
      const userId = session?.user?.id;
      if (!userId) return null;
      const fileExt = 'jpg';
      const filePath = `avatars/${userId}/${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('public').upload(filePath, file as any, {
        cacheControl: '3600',
        upsert: true,
        contentType,
      });
      if (error) {
        console.error('Erro no upload:', error);
        alert('Falha ao enviar a imagem. Tente novamente.');
        return null;
      }
      const { data: pub } = supabase.storage.from('public').getPublicUrl(filePath);
      return pub?.publicUrl || null;
    } catch (e) {
      console.error('Erro no upload:', e);
      return null;
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const userId = session?.user?.id;
      if (!userId) return;

      // Atualiza Auth (email e metadados)
      const currentEmail = session?.user?.email || '';
      const updatePayload: any = { data: { name: nome, display_name: nome, avatar_url: avatarUrl || null } };
      if (email && email !== currentEmail) {
        updatePayload.email = email.toLowerCase().trim();
      }
      const { error: authErr } = await supabase.auth.updateUser(updatePayload);
      if (authErr) {
        console.error('Erro ao atualizar usuário (auth):', authErr);
        alert('Não foi possível atualizar seus dados de acesso. Verifique o email ou tente novamente.');
        return;
      }

      // Upsert na tabela de usuários do app
      const emailValid = (() => { try { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); } catch { return false; } })();
      const nomeValid = !!nome && nome.trim().length >= 3;
      const telValid = !!telefone && telefone.replace(/\D/g, '').length >= 10;
      const perfilConcluido = !!(nomeValid && emailValid && telValid);

      const { error: dbErr } = await supabase
        .from('usuarios')
        .upsert({ id: userId, nome: nome.trim(), email: email.trim(), imagem_url: avatarUrl || null, telefone: telefone.trim() || null, perfil_concluido: perfilConcluido })
        .eq('id', userId);
      if (dbErr) {
        console.error('Erro ao salvar no banco:', dbErr);
        alert('Não foi possível salvar suas informações.');
        return;
      }

      alert('Perfil atualizado com sucesso!');
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const pickImage = () => {
    if (Platform.OS === 'web') return handlePickImageWeb();
    return handlePickImageNative();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: ui.bgPrimary }}>
        <ActivityIndicator color={ui.primary} />
      </View>
    );
  }

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.appBar} accessibilityRole="header">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={[
              styles.appBarBack,
              {
                backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF',
                borderColor: isDark ? colors['divider-dark'] : 'transparent',
              },
            ]}
            hitSlop={10}
          >
            <ChevronLeft size={22} color={isDark ? colors['text-primary-dark'] : colors['brand-purple']} />
          </Pressable>
          <Text
            style={[
              styles.appBarLabel,
              { color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'] },
            ]}
          >
            Voltar
          </Text>
        </View>

         <Text style={{ marginTop: 6, color: ui.textSecondary, fontFamily: dsFontFamily['jakarta-medium'], fontSize: descType.fontSize.default, lineHeight: descType.lineHeight.default }}>
           Atualize sua foto, nome completo e email. Essas informações ajudam a personalizar sua experiência.
         </Text>

        <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }]}>
          <Text style={{ color: ui.textPrimary, fontFamily: dsFontFamily['jakarta-semibold'], fontSize: labelType.fontSize.default, lineHeight: labelType.lineHeight.default, marginBottom: 12 }}>
            Foto do perfil
          </Text>

          <View style={styles.avatarRow}>
            <View style={styles.avatarOuter}>
              <Image source={{ uri: avatarUrl || 'https://i.pravatar.cc/160?img=12' }} style={styles.avatar} />
            </View>
            <Button variant="outline" onPress={pickImage} leftIcon={<Upload size={16} color={ui.textPrimary} />}>
              Trocar foto
            </Button>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: ui.bgSecondary, borderColor: ui.divider }]}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{
              color: ui.textPrimary,
              fontFamily: dsFontFamily['jakarta-semibold'],
              fontSize: getResponsiveValues('body-lg').fontSize.default,
              lineHeight: getResponsiveValues('body-lg').lineHeight.default,
              marginBottom: 6,
            }}>
              Nome completo
            </Text>
            <Input
              labelVariant="none"
              value={nome}
              onChangeText={(t) => { setNome(t); if (nomeError) setNomeError(''); }}
              placeholder="Seu nome e sobrenome"
              autoCapitalize="words"
              error={nomeError}
              returnKeyType="next"
            />
          </View>
          <View style={{ marginTop: 6 }}>
            <Text style={{
              color: ui.textPrimary,
              fontFamily: dsFontFamily['jakarta-semibold'],
              fontSize: getResponsiveValues('body-lg').fontSize.default,
              lineHeight: getResponsiveValues('body-lg').lineHeight.default,
              marginBottom: 6,
            }}>
              Email
            </Text>
            <Input
              labelVariant="none"
              value={email}
              onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(''); }}
              placeholder="seuemail@exemplo.com"
              type="email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={{
              color: ui.textPrimary,
              fontFamily: dsFontFamily['jakarta-semibold'],
              fontSize: getResponsiveValues('body-lg').fontSize.default,
              lineHeight: getResponsiveValues('body-lg').lineHeight.default,
              marginBottom: 6,
            }}>
              Telefone
            </Text>
            <Input
              labelVariant="none"
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(11) 91234-5678"
              mask="phone"
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Button variant="primary" onPress={handleSave} loading={saving} loadingText="Salvando..." fullWidth>
            Salvar alterações
          </Button>
          <Button variant="ghost" onPress={() => router.back()} fullWidth>
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 90,
    gap: 16,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 8,
    marginBottom: 6,
  },
  appBarBack: {
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  appBarLabel: {
    fontFamily: dsFontFamily['jakarta-medium'],
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  avatar: { width: '100%', height: '100%' },
});


