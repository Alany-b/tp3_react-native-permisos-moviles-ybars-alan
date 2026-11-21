import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colores } from '../theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colores.superficie,
          },
          headerShadowVisible: false,
          headerTintColor: colores.primario,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            color: colores.texto,
          },
          contentStyle: {
            backgroundColor: colores.fondo,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="reporte/nuevo"
          options={{
            title: 'Nuevo Reporte',
          }}
        />
        <Stack.Screen
          name="reporte/escanear"
          options={{
            title: 'Escanear QR de Aula',
          }}
        />
        <Stack.Screen
          name="reporte/foto"
          options={{
            title: 'Adjuntar Foto',
          }}
        />
        <Stack.Screen
          name="reporte/ubicacion"
          options={{
            title: 'Marcar Ubicación',
          }}
        />
        <Stack.Screen
          name="reporte/[id]"
          options={{
            title: 'Detalle de Reporte',
          }}
        />
        <Stack.Screen
          name="permisos/[recurso]"
          options={{
            presentation: 'modal',
            title: 'Permiso Requerido',
          }}
        />
        <Stack.Screen
          name="ajustes-app"
          options={{
            title: 'Ajustes de la App',
          }}
        />
      </Stack>
    </>
  );
}
