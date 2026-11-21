import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook para detectar el regreso del usuario a la aplicación desde Ajustes u otra app externa.
 * Ejecuta el callback 'revisar' únicamente cuando el estado pasa de segundo plano o inactivo a activo.
 */
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (nuevo: AppStateStatus) => {
      const estabaAfuera = /inactive|background/.test(anterior.current);
      if (estabaAfuera && nuevo === 'active') {
        revisar();
      }
      anterior.current = nuevo;
    });

    return () => {
      suscripcion.remove();
    };
  }, [revisar]);
}
