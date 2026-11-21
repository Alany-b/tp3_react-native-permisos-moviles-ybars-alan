import { ViewStyle } from 'react-native';
import type { EstadoReporte } from './lib/store';

export const colores = {
  fondo: '#FAF8F5',
  superficie: '#FFFFFF',
  superficieAlt: '#F5F2EE',
  borde: '#EBE5DE',
  bordeInput: '#D6CEC5',
  divisor: '#F1ECE6',

  texto: '#1C1917',
  textoSecundario: '#44403C',
  textoSuave: '#78716C',
  textoTenue: '#A8A29E',

  primario: '#EA580C',
  primarioTexto: '#C2410C',
  primarioSuave: '#FFF1E6',
  primarioBorde: '#FED7AA',
  noLeido: '#FFFAF5',
  escaner: '#FB923C',

  blanco: '#FFFFFF',
  sombra: '#1C1917',
  overlay: 'rgba(28, 25, 23, 0.55)',

  exito: '#16A34A',
  exitoSuave: '#DCFCE7',
  exitoTexto: '#166534',
  exitoBorde: '#BBF7D0',

  peligro: '#DC2626',
  peligroSuave: '#FEE2E2',
  peligroTexto: '#991B1B',
  peligroBorde: '#FECACA',

  avisoSuave: '#FEF3C7',
  avisoTexto: '#92400E',
  avisoBorde: '#FDE68A',

  infoSuave: '#E0F2FE',
  infoTexto: '#075985',
  infoBorde: '#BAE6FD',

  neutroSuave: '#F5F5F4',
};

export const radios = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pildora: 999,
};

export const espacio = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const sombras: Record<'suave' | 'media' | 'fuerte', ViewStyle> = {
  suave: {
    elevation: 2,
    shadowColor: colores.sombra,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  media: {
    elevation: 4,
    shadowColor: colores.sombra,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  fuerte: {
    elevation: 8,
    shadowColor: colores.primario,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
};

export const estadoReporte: Record<EstadoReporte, { bg: string; text: string; border: string }> = {
  pendiente: {
    bg: colores.avisoSuave,
    text: colores.avisoTexto,
    border: colores.avisoBorde,
  },
  'en curso': {
    bg: colores.infoSuave,
    text: colores.infoTexto,
    border: colores.infoBorde,
  },
  resuelto: {
    bg: colores.exitoSuave,
    text: colores.exitoTexto,
    border: colores.exitoBorde,
  },
};
