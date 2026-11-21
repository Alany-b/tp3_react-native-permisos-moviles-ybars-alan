import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { store, Reporte } from './store';

// Configuración global del comportamiento de notificaciones en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Crea el canal de notificación requerido para Android 8.0+ / 13+ antes de emitir notificaciones
 */
export async function configurarCanalReportesAndroid(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reportes', {
      name: 'Reportes Edilicios IPF',
      description: 'Avisos sobre la resolución de desperfectos reportados',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#004085',
      sound: 'default',
    });
  }
}

export interface ResultadoSimulacion {
  tipo: 'notificacion' | 'aviso_interno';
  mensaje: string;
}

/**
 * Simula la resolución de un reporte:
 * Si el permiso de notificaciones está concedido, programa una notificación local a 10 segundos.
 * Si el permiso está denegado o no otorgado, añade un aviso en la bandeja interna /avisos.
 */
export async function simularResolucionReporte(reporte: Reporte): Promise<ResultadoSimulacion> {
  // Asegurar canal en Android
  await configurarCanalReportesAndroid();

  // Marcar estado del reporte como 'resuelto'
  store.actualizarEstadoReporte(reporte.id, 'resuelto');

  const permisos = await Notifications.getPermissionsAsync();

  if (permisos.status === 'granted') {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `¡Reporte Resuelto!`,
          body: `El desperfecto "${reporte.titulo}" en ${reporte.aula} fue solucionado por Mantenimiento.`,
          data: { reporteId: reporte.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
        },
      });

      return {
        tipo: 'notificacion',
        mensaje: 'Notificación del sistema programada con éxito para dentro de 10 segundos.',
      };
    } catch (error) {
      console.warn('Error programando notificación local:', error);
    }
  }

  // Alternativa resiliente: si el permiso está denegado, se guarda en la bandeja interna /avisos
  store.agregarAviso(
    reporte.id,
    `Resuelto: ${reporte.titulo}`,
    `El reclamo en ${reporte.aula} ha sido marcado como solucionado por la cuadrilla de mantenimiento del IPF.`
  );

  return {
    tipo: 'aviso_interno',
    mensaje: 'Notificaciones del sistema no disponibles. El aviso se agregó automáticamente a tu bandeja interna de /avisos.',
  };
}
