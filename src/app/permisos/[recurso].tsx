import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePermiso, TipoRecurso } from '../../hooks/usePermiso';
import { colores, radios, sombras } from '../../theme';

interface InfoRecurso {
  titulo: string;
  icono: string;
  beneficio: string;
  pasosAndroid: string;
  pasosIos: string;
}

const INFO_RECURSOS: Record<string, InfoRecurso> = {
  camera: {
    titulo: 'Acceso a la Cámara',
    icono: 'camera-outline',
    beneficio: 'Usamos tu cámara para escanear el código QR del aula y registrar fotos claras de los desperfectos.',
    pasosAndroid: 'Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Cámara > Permitir.',
    pasosIos: 'Configuración > Mantenimiento IPF > Activar el interruptor de Cámara.',
  },
  camara: {
    titulo: 'Acceso a la Cámara',
    icono: 'camera-outline',
    beneficio: 'Usamos tu cámara para escanear el código QR del aula y registrar fotos claras de los desperfectos.',
    pasosAndroid: 'Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Cámara > Permitir.',
    pasosIos: 'Configuración > Mantenimiento IPF > Activar el interruptor de Cámara.',
  },
  location: {
    titulo: 'Acceso a la Ubicación',
    icono: 'location-outline',
    beneficio: 'Usamos tu ubicación para sugerirte automáticamente el sector del edificio donde reportás el desperfecto.',
    pasosAndroid: 'Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Ubicación > Permitir mientras la app está en uso.',
    pasosIos: 'Configuración > Mantenimiento IPF > Localización > Seleccionar "Al usar la app".',
  },
  ubicacion: {
    titulo: 'Acceso a la Ubicación',
    icono: 'location-outline',
    beneficio: 'Usamos tu ubicación para sugerirte automáticamente el sector del edificio donde reportás el desperfecto.',
    pasosAndroid: 'Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Ubicación > Permitir mientras la app está en uso.',
    pasosIos: 'Configuración > Mantenimiento IPF > Localización > Seleccionar "Al usar la app".',
  },
  notifications: {
    titulo: 'Permiso de Notificaciones',
    icono: 'notifications-outline',
    beneficio: 'Usamos tus notificaciones para avisarte en tiempo real en cuanto el equipo de mantenimiento repare tu reporte.',
    pasosAndroid: 'Ajustes > Aplicaciones > Mantenimiento IPF > Notificaciones > Activar "Permitir notificaciones".',
    pasosIos: 'Configuración > Mantenimiento IPF > Notificaciones > Activar "Permitir notificaciones".',
  },
  notificaciones: {
    titulo: 'Permiso de Notificaciones',
    icono: 'notifications-outline',
    beneficio: 'Usamos tus notificaciones para avisarte en tiempo real en cuanto el equipo de mantenimiento repare tu reporte.',
    pasosAndroid: 'Ajustes > Aplicaciones > Mantenimiento IPF > Notificaciones > Activar "Permitir notificaciones".',
    pasosIos: 'Configuración > Mantenimiento IPF > Notificaciones > Activar "Permitir notificaciones".',
  },
  mediaLibrary: {
    titulo: 'Selector de Fotos',
    icono: 'images-outline',
    beneficio: 'Usamos el selector nativo para que elijas fotos del desperfecto sin acceder a toda tu galería privada.',
    pasosAndroid: 'No requiere permisos globales en Android 13+ gracias al Photo Picker del sistema.',
    pasosIos: 'Configuración > Mantenimiento IPF > Fotos > Permitir acceso seleccionado.',
  },
  fotos: {
    titulo: 'Selector de Fotos',
    icono: 'images-outline',
    beneficio: 'Usamos el selector nativo para que elijas fotos del desperfecto sin acceder a toda tu galería privada.',
    pasosAndroid: 'No requiere permisos globales en Android 13+ gracias al Photo Picker del sistema.',
    pasosIos: 'Configuración > Mantenimiento IPF > Fotos > Permitir acceso seleccionado.',
  },
};

export default function PantallaPreviaModal() {
  const router = useRouter();
  const { recurso } = useLocalSearchParams<{ recurso: string }>();
  const idRecurso = (recurso || 'camera').toString();
  const info = INFO_RECURSOS[idRecurso] || INFO_RECURSOS.camera;

  const { estado, pedir, abrirAjustes } = usePermiso(idRecurso as TipoRecurso);

  const manejarContinuar = async () => {
    await pedir();
    router.back();
  };

  const estaBloqueado = estado === 'bloqueado';

  return (
    <View style={styles.contenedor}>
      <View style={styles.card}>
        <View style={styles.iconoContenedor}>
          <Ionicons name={info.icono as any} size={48} color={colores.primario} />
        </View>

        <Text style={styles.titulo}>{info.titulo}</Text>

        <View style={styles.beneficioBox}>
          <Text style={styles.beneficioTexto}>{info.beneficio}</Text>
        </View>

        {estaBloqueado ? (
          <View style={styles.bloqueadoBox}>
            <View style={styles.bloqueadoHeader}>
              <Ionicons name="alert-circle" size={20} color={colores.peligroTexto} />
              <Text style={styles.bloqueadoTitulo}>Permiso bloqueado en el sistema</Text>
            </View>
            <Text style={styles.bloqueadoInstrucciones}>
              Para poder utilizar esta función debés habilitar el permiso manualmente desde la configuración del dispositivo:
            </Text>
            <View style={styles.pasosContenedor}>
              <Text style={styles.pasosTexto}>
                {Platform.OS === 'ios' ? info.pasosIos : info.pasosAndroid}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.aclaracionAjustes}>
            En el siguiente paso el sistema operativo te consultará formalmente. Podés cambiar o revocar esta decisión en cualquier momento desde los Ajustes de tu dispositivo.
          </Text>
        )}
        {/* Único botón: "Continuar" si es preguntable, o "Abrir Ajustes" si está bloqueado.
            Sin botones engañosos ni distractivos como "Ahora no" o "Cerrar" (Pauta 5.1.1(iv) de Apple) */}
        {estado === 'cargando' ? (
          <ActivityIndicator size="large" color={colores.primario} style={{ marginVertical: 20 }} />
        ) : estaBloqueado ? (
          <TouchableOpacity style={styles.botonAjustes} activeOpacity={0.8} onPress={abrirAjustes}>
            <Ionicons name="settings-outline" size={20} color={colores.blanco} />
            <Text style={styles.botonTexto}>Abrir Ajustes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.botonContinuar} activeOpacity={0.8} onPress={manejarContinuar}>
            <Text style={styles.botonTexto}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color={colores.blanco} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colores.superficie,
    borderRadius: radios.xl,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombras.media,
  },
  iconoContenedor: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colores.primarioSuave,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: colores.texto,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 16,
  },
  beneficioBox: {
    backgroundColor: colores.primarioSuave,
    padding: 16,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.primarioBorde,
    marginBottom: 18,
    width: '100%',
  },
  beneficioTexto: {
    fontSize: 15,
    color: colores.primarioTexto,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  aclaracionAjustes: {
    fontSize: 13,
    color: colores.textoSuave,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  bloqueadoBox: {
    backgroundColor: colores.peligroSuave,
    borderRadius: radios.md,
    padding: 14,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colores.peligroBorde,
  },
  bloqueadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  bloqueadoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.peligroTexto,
  },
  bloqueadoInstrucciones: {
    fontSize: 12.5,
    color: colores.peligroTexto,
    lineHeight: 18,
    marginBottom: 8,
  },
  pasosContenedor: {
    backgroundColor: colores.superficie,
    padding: 10,
    borderRadius: radios.sm,
    borderWidth: 1,
    borderColor: colores.peligroBorde,
  },
  pasosTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: colores.textoSecundario,
    lineHeight: 17,
  },
  botonContinuar: {
    backgroundColor: colores.primario,
    width: '100%',
    paddingVertical: 15,
    borderRadius: radios.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...sombras.fuerte,
  },
  botonAjustes: {
    backgroundColor: colores.peligro,
    width: '100%',
    paddingVertical: 15,
    borderRadius: radios.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  botonTexto: {
    color: colores.blanco,
    fontSize: 16,
    fontWeight: '700',
  },
});
