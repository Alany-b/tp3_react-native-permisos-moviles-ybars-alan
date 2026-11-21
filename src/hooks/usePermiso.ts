import { useState, useEffect, useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { useRevisarAlVolver } from './useRevisarAlVolver';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export type TipoRecurso =
  | 'camera'
  | 'location'
  | 'notifications'
  | 'mediaLibrary'
  | 'camara'
  | 'ubicacion'
  | 'notificaciones'
  | 'fotos';

export interface RetornoUsePermiso {
  estado: EstadoPermiso;
  parcial: boolean;
  matiz?: string;
  rawResponse: any;
  pedir: () => Promise<EstadoPermiso>;
  abrirAjustes: () => Promise<void>;
  revisar: () => Promise<void>;
}

// Normalizar nombres en español e inglés
function normalizarRecurso(recurso: TipoRecurso): 'camera' | 'location' | 'notifications' | 'mediaLibrary' {
  if (recurso === 'camara') return 'camera';
  if (recurso === 'ubicacion') return 'location';
  if (recurso === 'notificaciones') return 'notifications';
  if (recurso === 'fotos') return 'mediaLibrary';
  return recurso;
}

export function usePermiso(recurso: TipoRecurso): RetornoUsePermiso {
  const recursoNorm = normalizarRecurso(recurso);
  const [estado, setEstado] = useState<EstadoPermiso>('cargando');
  const [parcial, setParcial] = useState<boolean>(false);
  const [matiz, setMatiz] = useState<string | undefined>(undefined);
  const [rawResponse, setRawResponse] = useState<any>(null);

  // Procesa una respuesta nativa de Expo y calcula el estado unificado
  const procesarRespuesta = useCallback((resp: any) => {
    setRawResponse(resp);
    if (!resp) {
      setEstado('cargando');
      setParcial(false);
      setMatiz(undefined);
      return 'cargando';
    }

    let esParcial = false;
    let descMatiz: string | undefined = undefined;

    // Evaluación de matices por recurso y plataforma
    if (recursoNorm === 'location') {
      if (Platform.OS === 'android' && resp.android?.accuracy === 'coarse') {
        esParcial = true;
        descMatiz = 'Ubicación aproximada (coarse)';
      } else if (Platform.OS === 'ios' && (resp.scope === 'reduced' || resp.accuracy === 'reduced')) {
        esParcial = true;
        descMatiz = 'Ubicación aproximada (reducida)';
      }
    } else if (recursoNorm === 'mediaLibrary') {
      if (resp.accessPrivileges === 'limited') {
        esParcial = true;
        descMatiz = 'Acceso limitado a fotos seleccionadas';
      }
    } else if (recursoNorm === 'notifications') {
      if (Platform.OS === 'ios' && resp.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
        esParcial = true;
        descMatiz = 'Notificaciones provisionales (silenciosas)';
      }
    }

    setParcial(esParcial);
    setMatiz(descMatiz);

    if (resp.status === 'granted') {
      setEstado('concedido');
      return 'concedido';
    }

    if (resp.status === 'undetermined') {
      setEstado('preguntable');
      return 'preguntable';
    }

    // Si status es 'denied'
    if (resp.canAskAgain) {
      setEstado('preguntable');
      return 'preguntable';
    } else {
      setEstado('bloqueado');
      return 'bloqueado';
    }
  }, [recursoNorm]);

  // Consulta silenciosa sin mostrar diálogo
  const revisar = useCallback(async () => {
    try {
      let resp: any = null;
      switch (recursoNorm) {
        case 'camera':
          resp = await Camera.getCameraPermissionsAsync();
          break;
        case 'location':
          resp = await Location.getForegroundPermissionsAsync();
          break;
        case 'notifications':
          resp = await Notifications.getPermissionsAsync();
          break;
        case 'mediaLibrary':
          resp = await ImagePicker.getMediaLibraryPermissionsAsync();
          break;
      }
      procesarRespuesta(resp);
    } catch (e) {
      console.warn(`Error consultando permiso para ${recursoNorm}:`, e);
      setEstado('bloqueado');
    }
  }, [recursoNorm, procesarRespuesta]);

  // Solicitar permiso activamente mediante diálogo del sistema
  const pedir = useCallback(async (): Promise<EstadoPermiso> => {
    try {
      let resp: any = null;
      switch (recursoNorm) {
        case 'camera':
          resp = await Camera.requestCameraPermissionsAsync();
          break;
        case 'location':
          resp = await Location.requestForegroundPermissionsAsync();
          break;
        case 'notifications':
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('reportes', {
              name: 'Reportes Edilicios',
              importance: Notifications.AndroidImportance.HIGH,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#004085',
            });
          }
          resp = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowProvisional: true, // Desafío opcional: notificaciones provisionales
            },
          });
          break;
        case 'mediaLibrary':
          resp = await ImagePicker.requestMediaLibraryPermissionsAsync();
          break;
      }
      return procesarRespuesta(resp);
    } catch (e) {
      console.warn(`Error solicitando permiso para ${recursoNorm}:`, e);
      setEstado('bloqueado');
      return 'bloqueado';
    }
  }, [recursoNorm, procesarRespuesta]);

  // Redirigir a los Ajustes del sistema operativo
  const abrirAjustes = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  // Consultar en el montaje inicial
  useEffect(() => {
    revisar();
  }, [revisar]);

  // Escuchar cuando el usuario regresa a la app desde Ajustes
  useRevisarAlVolver(revisar);

  return {
    estado,
    parcial,
    matiz,
    rawResponse,
    pedir,
    abrirAjustes,
    revisar,
  };
}
