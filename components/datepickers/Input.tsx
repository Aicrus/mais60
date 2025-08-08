import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  Easing
} from 'react-native-reanimated';
import { Calendar, Clock, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../hooks/DesignSystemContext';
import { colors, ColorType } from '../../design-system/tokens/colors';
import { spacing } from '../../design-system/tokens/spacing';
import { borderRadius, getBorderRadius } from '../../design-system/tokens/borders';
import { fontSize, fontFamily } from '../../design-system/tokens/typography';
import { getShadowColor } from '../../design-system/tokens/effects';

/**
 * @component DateTimeInput
 * @description Componente de entrada simplificado apenas para data e hora que suporta:
 * - Tipos: data e hora
 * - Máscara automática para data (dd/mm/aaaa) e hora (HH:MM)
 * - Seletores nativos personalizados para web
 * - Tema claro/escuro automático
 * 
 * Exemplos de uso:
 * 
 * ```tsx
 * // Input de data
 * <DateTimeInput 
 *   value={data} 
 *   onChangeText={setData} 
 *   type="date" 
 *   label="Data de nascimento"
 *   placeholder="dd/mm/aaaa"
 * />
 * 
 * // Input de hora
 * <DateTimeInput 
 *   value={hora} 
 *   onChangeText={setHora} 
 *   type="time" 
 *   label="Horário"
 *   placeholder="HH:MM"
 * />
 * ```
 */

export interface DateTimeInputProps {
  /** Valor atual do input */
  value: string;
  /** Função chamada quando o valor muda */
  onChangeText: (text: string) => void;
  /** Tipo de input - apenas data ou hora */
  type: 'date' | 'time';
  /** Texto exibido quando o input está vazio */
  placeholder?: string;
  /** Rótulo exibido acima do input */
  label?: string;
  /** Mensagem de erro exibida abaixo do input */
  error?: string;
  /** Se o input está desabilitado */
  disabled?: boolean;
  /** Função chamada quando o ícone de calendário/relógio é pressionado */
  onPress?: () => void;
  /** ID para testes automatizados */
  testID?: string;
  /** Estilo personalizado para o container do input */
  style?: any;
}

export const DateTimeInput = ({
  value,
  onChangeText,
  type,
  placeholder = type === 'date' ? 'dd/mm/aaaa' : 'HH:MM',
  label,
  error,
  disabled = false,
  onPress,
  testID,
  style,
}: DateTimeInputProps) => {
  // Estado para controlar foco
  const [isFocused, setIsFocused] = useState(false);
  
  // Referência ao input nativo
  const inputRef = useRef<TextInput>(null);
  
  // Tema atual
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  // Obter cores do design system
  const getThemeColor = (baseColor: string): string => {
    const darkKey = `${baseColor}-dark` as ColorType;
    const lightKey = `${baseColor}-light` as ColorType;
    return isDark ? colors[darkKey] : colors[lightKey];
  };
  
  // Verificar se estamos na plataforma web
  const isWeb = Platform.OS === 'web';
  
  // Estados para calendário personalizado (web)
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Estados para seletor de hora personalizado (web)
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  
  // Estilo do container do input
  const containerStyle = StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: error ? Number(spacing['1'].replace('px', '')) : 0,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: Number(getBorderRadius('md').replace('px', '')),
      backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
      borderColor: error 
        ? isDark ? colors['error-border-dark'] : colors['error-border-light']
        : isFocused
          ? isDark ? colors['primary-dark'] : colors['primary-light']
          : isDark ? colors['divider-dark'] : colors['divider-light'],
      minHeight: Platform.OS === 'web'
        ? ((require('react-native').Dimensions.get('window').width < 740) 
            ? Number(spacing['13'].replace('px', ''))
            : Number(spacing['10'].replace('px', '')))
        : Number(spacing['13'].replace('px', '')),
      paddingHorizontal: Number(spacing['3'].replace('px', '')),
      shadowColor: getShadowColor('input'),
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    inputStyle: {
      flex: 1,
      color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
      fontSize: Platform.OS === 'web' ? 13 : 16,
      fontFamily: fontFamily['jakarta-medium'],
      paddingVertical: Platform.OS === 'web' 
        ? Number(spacing['2.5'].replace('px', ''))
        : Number(spacing['4'].replace('px', '')),
      height: Platform.OS === 'web'
        ? ((require('react-native').Dimensions.get('window').width < 740)
            ? Number(spacing['13'].replace('px', ''))
            : Number(spacing['10'].replace('px', '')))
        : Number(spacing['13'].replace('px', '')),
      textAlignVertical: 'center',
    },
    labelStyle: {
      fontSize: Number(fontSize['label-sm'].size.replace('px', '')),
      lineHeight: Number(fontSize['label-sm'].lineHeight.replace('px', '')),
      fontFamily: fontFamily['jakarta-semibold'],
      marginBottom: Number(spacing['1.5'].replace('px', '')),
      color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
    },
    iconContainer: {
      padding: Number(spacing['1.5'].replace('px', '')),
      borderRadius: Number(getBorderRadius('sm').replace('px', '')),
    },
    errorText: {
      fontSize: Number(fontSize['body-sm'].size.replace('px', '')),
      lineHeight: Number(fontSize['body-sm'].lineHeight.replace('px', '')),
      fontFamily: fontFamily['jakarta-regular'],
      color: isDark ? colors['error-text-dark'] : colors['error-text-light'],
      marginTop: Number(spacing['1'].replace('px', '')),
    },
  });
  
  // Função para aplicar máscara
  const applyMask = (text: string): string => {
    if (!text) return '';
    
    if (type === 'date') {
      // Remove caracteres não numéricos
      text = text.replace(/\D/g, '');
      // Aplica máscara de data: dd/mm/aaaa
      text = text.replace(/(\d{2})(\d)/, '$1/$2');
      text = text.replace(/(\d{2})(\d)/, '$1/$2');
      return text.substring(0, 10);
    }
    
    if (type === 'time') {
      // Remove caracteres não numéricos
      text = text.replace(/\D/g, '');
      // Aplica máscara de hora: HH:MM
      text = text.replace(/(\d{2})(\d{0,2})/, '$1:$2');
      return text.substring(0, 5);
    }
    
    return text;
  };
  
  // Função para lidar com mudança de texto
  const handleChangeText = (text: string) => {
    const maskedText = applyMask(text);
    onChangeText(maskedText);
  };
  
  // Lidar com foco
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  // Lidar com perda de foco
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  // Função para abrir o seletor de data/hora
  const handleIconPress = () => {
    if (onPress) {
      onPress();
    } else if (isWeb && type === 'date') {
      setShowCalendar(true);
      if (value) {
        const dateParts = value.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1;
          const year = parseInt(dateParts[2]);
          setCalendarDate(new Date(year, month, day));
        }
      }
    } else if (isWeb && type === 'time') {
      setShowTimePicker(true);
      if (value) {
        const timeParts = value.split(':');
        if (timeParts.length === 2) {
          setSelectedHour(parseInt(timeParts[0]));
          setSelectedMinute(parseInt(timeParts[1]));
        }
      } else {
        const now = new Date();
        setSelectedHour(now.getHours());
        setSelectedMinute(now.getMinutes());
      }
    }
  };
  
  // Funções auxiliares para o calendário
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const formatDateValue = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const formatTimeValue = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <View style={[containerStyle.container, style]}>
      {/* Label */}
      {label && (
        <Text style={containerStyle.labelStyle}>{label}</Text>
      )}
      
      {/* Container do input */}
      <View 
        style={[
          containerStyle.inputContainer,
          disabled ? { 
            opacity: 0.6, 
            backgroundColor: isDark ? colors['bg-tertiary-dark'] : colors['bg-tertiary-light']
          } : {},
        ]}
      >
        <TextInput
          ref={inputRef}
          style={containerStyle.inputStyle}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? colors['text-tertiary-dark'] : colors['text-tertiary-light']}
          editable={!disabled}
          keyboardType="numeric"
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={type === 'date' ? 10 : 5}
          testID={testID}
          selectionColor={isDark ? colors['primary-dark'] + '60' : colors['primary-light'] + '60'}
        />
        
        {/* Ícone de calendário/relógio */}
        <TouchableOpacity 
          onPress={handleIconPress}
          style={containerStyle.iconContainer}
          disabled={disabled}
        >
          {type === 'date' ? (
            <Calendar 
              size={16} 
              color={getThemeColor('text-secondary')} 
            />
          ) : (
            <Clock 
              size={16} 
              color={getThemeColor('text-secondary')} 
            />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Mensagem de erro */}
      {error && (
        <Text style={containerStyle.errorText}>{error}</Text>
      )}
      
      {/* Calendário personalizado para web */}
      {isWeb && showCalendar && type === 'date' && (
        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          >
            <TouchableOpacity 
              style={{
                backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
                borderRadius: Number(getBorderRadius('lg').replace('px', '')),
                padding: Number(spacing['4'].replace('px', '')),
                width: 320,
                maxWidth: '90%',
                shadowColor: getShadowColor('modal'),
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.4 : 0.1,
                shadowRadius: 8,
                elevation: 8,
              }}
              activeOpacity={1}
            >
              {/* Header do calendário */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: Number(spacing['4'].replace('px', '')),
              }}>
                <TouchableOpacity
                  onPress={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                  style={{
                    padding: Number(spacing['2'].replace('px', '')),
                    borderRadius: Number(getBorderRadius('md').replace('px', '')),
                  }}
                >
                  <ChevronLeft size={20} color={getThemeColor('text-primary')} />
                </TouchableOpacity>
                
                <Text style={{
                  fontSize: Number(fontSize['subtitle-md'].size.replace('px', '')),
                  fontFamily: fontFamily['jakarta-bold'],
                  color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                }}>
                  {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                </Text>
                
                <TouchableOpacity
                  onPress={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                  style={{
                    padding: Number(spacing['2'].replace('px', '')),
                    borderRadius: Number(getBorderRadius('md').replace('px', '')),
                  }}
                >
                  <ChevronRight size={20} color={getThemeColor('text-primary')} />
                </TouchableOpacity>
              </View>
              
              {/* Dias da semana */}
              <View style={{
                flexDirection: 'row',
                marginBottom: Number(spacing['2'].replace('px', '')),
              }}>
                {dayNames.map((day) => (
                  <View key={day} style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: Number(spacing['2'].replace('px', '')),
                  }}>
                    <Text style={{
                      fontSize: Number(fontSize['body-sm'].size.replace('px', '')),
                      fontFamily: fontFamily['jakarta-medium'],
                      color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
                    }}>
                      {day}
                    </Text>
                  </View>
                ))}
              </View>
              
              {/* Grid de dias */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {Array.from({ length: getFirstDayOfMonth(calendarDate) }, (_, i) => (
                  <View key={`empty-${i}`} style={{ width: '14.28%', height: 40 }} />
                ))}
                
                {Array.from({ length: getDaysInMonth(calendarDate) }, (_, i) => {
                  const day = i + 1;
                  const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                  const isToday = new Date().toDateString() === currentDate.toDateString();
                  const isSelected = value === formatDateValue(currentDate);
                  
                  return (
                    <TouchableOpacity
                      key={day}
                      style={{
                        width: '14.28%',
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: Number(getBorderRadius('md').replace('px', '')),
                        backgroundColor: isSelected 
                          ? (isDark ? colors['primary-dark'] : colors['primary-light'])
                          : isToday
                          ? (isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'])
                          : 'transparent',
                      }}
                      onPress={() => {
                        const selectedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                        onChangeText(formatDateValue(selectedDate));
                        setShowCalendar(false);
                      }}
                    >
                      <Text style={{
                        fontSize: Number(fontSize['body-md'].size.replace('px', '')),
                        fontFamily: fontFamily['jakarta-regular'],
                        color: isSelected
                          ? colors['text-primary-dark']
                          : isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                      }}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* Botões de ação */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: Number(spacing['4'].replace('px', '')),
                gap: Number(spacing['2'].replace('px', '')),
              }}>
                <TouchableOpacity
                  onPress={() => setShowCalendar(false)}
                  style={{
                    paddingHorizontal: Number(spacing['4'].replace('px', '')),
                    paddingVertical: Number(spacing['2'].replace('px', '')),
                    borderRadius: Number(getBorderRadius('md').replace('px', '')),
                  }}
                >
                  <Text style={{
                    fontSize: Number(fontSize['body-md'].size.replace('px', '')),
                    fontFamily: fontFamily['jakarta-medium'],
                    color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
                  }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    onChangeText(formatDateValue(new Date()));
                    setShowCalendar(false);
                  }}
                  style={{
                    paddingHorizontal: Number(spacing['4'].replace('px', '')),
                    paddingVertical: Number(spacing['2'].replace('px', '')),
                    borderRadius: Number(getBorderRadius('md').replace('px', '')),
                    backgroundColor: isDark ? colors['primary-dark'] : colors['primary-light'],
                  }}
                >
                  <Text style={{
                    fontSize: Number(fontSize['body-md'].size.replace('px', '')),
                    fontFamily: fontFamily['jakarta-medium'],
                    color: colors['text-primary-dark'],
                  }}>
                    Hoje
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
      
      {/* Seletor de hora personalizado para web */}
      {isWeb && showTimePicker && type === 'time' && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <TouchableOpacity 
              style={{
                backgroundColor: isDark ? colors['bg-primary-dark'] : colors['bg-primary-light'],
                borderRadius: Number(getBorderRadius('lg').replace('px', '')),
                padding: Number(spacing['6'].replace('px', '')),
                width: 280,
                maxWidth: '90%',
                shadowColor: getShadowColor('modal'),
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.4 : 0.1,
                shadowRadius: 8,
                elevation: 8,
              }}
              activeOpacity={1}
            >
              {/* Header */}
              <Text style={{
                fontSize: Number(fontSize['subtitle-md'].size.replace('px', '')),
                fontFamily: fontFamily['jakarta-bold'],
                color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                textAlign: 'center',
                marginBottom: Number(spacing['6'].replace('px', '')),
              }}>
                Selecionar Hora
              </Text>
              
              {/* Display da hora */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Number(spacing['6'].replace('px', '')),
              }}>
                <Text style={{
                  fontSize: 48,
                  fontFamily: fontFamily['jakarta-bold'],
                  color: isDark ? colors['primary-dark'] : colors['primary-light'],
                  textAlign: 'center',
                }}>
                  {formatTimeValue(selectedHour, selectedMinute)}
                </Text>
              </View>
              
              {/* Controles de hora e minuto */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: Number(spacing['6'].replace('px', '')),
              }}>
                {/* Controle de hora */}
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{
                    fontSize: Number(fontSize['body-sm'].size.replace('px', '')),
                    fontFamily: fontFamily['jakarta-medium'],
                    color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
                    marginBottom: Number(spacing['2'].replace('px', '')),
                  }}>
                    Hora
                  </Text>
                  
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => setSelectedHour(selectedHour === 23 ? 0 : selectedHour + 1)}
                      style={{
                        padding: Number(spacing['2'].replace('px', '')),
                        borderRadius: Number(getBorderRadius('md').replace('px', '')),
                        backgroundColor: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
                        marginBottom: Number(spacing['2'].replace('px', '')),
                      }}
                    >
                      <ChevronUp size={20} color={getThemeColor('text-primary')} />
                    </TouchableOpacity>
                    
                    <Text style={{
                      fontSize: Number(fontSize['headline-sm'].size.replace('px', '')),
                      fontFamily: fontFamily['jakarta-bold'],
                      color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                      minWidth: 40,
                      textAlign: 'center',
                    }}>
                      {selectedHour.toString().padStart(2, '0')}
                    </Text>
                    
                    <TouchableOpacity
                      onPress={() => setSelectedHour(selectedHour === 0 ? 23 : selectedHour - 1)}
                      style={{
                        padding: Number(spacing['2'].replace('px', '')),
                        borderRadius: Number(getBorderRadius('md').replace('px', '')),
                        backgroundColor: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
                        marginTop: Number(spacing['2'].replace('px', '')),
                      }}
                    >
                      <ChevronDown size={20} color={getThemeColor('text-primary')} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Separador */}
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: Number(spacing['4'].replace('px', '')),
                }}>
                  <Text style={{
                    fontSize: Number(fontSize['headline-md'].size.replace('px', '')),
                    fontFamily: fontFamily['jakarta-bold'],
                    color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                  }}>
                    :
                  </Text>
                </View>
                
                {/* Controle de minuto */}
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{
                    fontSize: Number(fontSize['body-sm'].size.replace('px', '')),
                    fontFamily: fontFamily['jakarta-medium'],
                    color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'],
                    marginBottom: Number(spacing['2'].replace('px', '')),
                  }}>
                    Minuto
                  </Text>
                  
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => setSelectedMinute(selectedMinute === 59 ? 0 : selectedMinute + 1)}
                      style={{
                        padding: Number(spacing['2'].replace('px', '')),
                        borderRadius: Number(getBorderRadius('md').replace('px', '')),
                        backgroundColor: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
                        marginBottom: Number(spacing['2'].replace('px', '')),
                      }}
                    >
                      <ChevronUp size={20} color={getThemeColor('text-primary')} />
                    </TouchableOpacity>
                    
                    <Text style={{
                      fontSize: Number(fontSize['headline-sm'].size.replace('px', '')),
                      fontFamily: fontFamily['jakarta-bold'],
                      color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                      minWidth: 40,
                      textAlign: 'center',
                    }}>
                      {selectedMinute.toString().padStart(2, '0')}
                    </Text>
                    
                    <TouchableOpacity
                      onPress={() => setSelectedMinute(selectedMinute === 0 ? 59 : selectedMinute - 1)}
                      style={{
                        padding: Number(spacing['2'].replace('px', '')),
                        borderRadius: Number(getBorderRadius('md').replace('px', '')),
                        backgroundColor: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
                        marginTop: Number(spacing['2'].replace('px', '')),
                      }}
                    >
                      <ChevronDown size={20} color={getThemeColor('text-primary')} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Botões de ação */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: Number(spacing['3'].replace('px', '')),
              }}>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={{
                    flex: 1,
                    paddingVertical: Number(spacing['3'].replace('px', '')),
                    borderRadius: Number(getBorderRadius('md').replace('px', '')),
                    backgroundColor: isDark ? colors['bg-secondary-dark'] : colors['bg-secondary-light'],
                  }}
                >
                  <Text style={{
                    fontSize: Number(fontSize['body-md'].size.replace('px', '')),
                    fontFamily: fontFamily['jakarta-medium'],
                    color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'],
                    textAlign: 'center',
                  }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    onChangeText(formatTimeValue(selectedHour, selectedMinute));
                    setShowTimePicker(false);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: Number(spacing['3'].replace('px', '')),
                    borderRadius: Number(getBorderRadius('md').replace('px', '')),
                    backgroundColor: isDark ? colors['primary-dark'] : colors['primary-light'],
                  }}
                >
                  <Text style={{
                    fontSize: Number(fontSize['body-md'].size.replace('px', '')),
                    fontFamily: fontFamily['jakarta-medium'],
                    color: colors['text-primary-dark'],
                    textAlign: 'center',
                  }}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};
