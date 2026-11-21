import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../../lib/store';
import { usePermiso } from '../../hooks/usePermiso';
import { colores, radios, sombras } from '../../theme';

export default function PantallaFoto() {
  const router = useRouter();
  const { estado: estadoCamara, pedir: pedirCamara, abrirAjustes } = usePermiso('camera');

  // Opción 1: Sacar foto con la cámara (requiere permiso de cámara)
  const tomarFotoConCamara = async () => {
    if (estadoCamara === 'bloqueado') {
      Alert.alert(
        'Cámara Bloqueada',
        'El permiso de cámara fue bloqueado. Habilitalo en Ajustes o seleccioná una foto desde la galería.',
        [
          { text: 'Elegir de galería', onPress: elegirDeGaleria },
          { text: 'Abrir Ajustes', onPress: abrirAjustes },
        ]
      );
      return;
    }

    if (estadoCamara !== 'concedido') {
      const resp = await pedirCamara();
      if (resp !== 'concedido') {
        Alert.alert(
          'Permiso no concedido',
          'No se pudo abrir la cámara. Podés usar la opción de elegir una imagen de la galería sin ningún permiso.'
        );
        return;
      }
    }

    try {
      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        store.actualizarBorrador({ fotoUri: resultado.assets[0].uri });
        router.back();
      }
    } catch (error) {
      console.warn('Error al capturar foto:', error);
      Alert.alert('Error', 'No se pudo capturar la foto. Podés intentar eligiendo desde la galería.');
    }
  };

  // Opción 2: Elegir de la galería usando el Photo Picker del sistema
  // Requisito 3: NO pide acceso a la galería ni declara READ_MEDIA_IMAGES
  const elegirDeGaleria = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        store.actualizarBorrador({ fotoUri: resultado.assets[0].uri });
        router.back();
      }
    } catch (error) {
      console.warn('Error al seleccionar foto:', error);
      Alert.alert('Error', 'No se pudo abrir el selector de fotos del sistema.');
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Adjuntar Evidencia Fotográfica</Text>
      <Text style={styles.subtitulo}>
        Seleccioná cómo querés incorporar la imagen del desperfecto a tu reporte:
      </Text>

      {/* Botón: Sacar foto en el momento */}
      <TouchableOpacity
        style={styles.opcionCard}
        activeOpacity={0.8}
        onPress={tomarFotoConCamara}
      >
        <View style={styles.iconoCirculoAzul}>
          <Ionicons name="camera" size={28} color={colores.primario} />
        </View>
        <View style={styles.opcionInfo}>
          <Text style={styles.opcionTitulo}>Sacar foto en el momento</Text>
          <Text style={styles.opcionDescripcion}>
            Abre la cámara del teléfono para capturar el problema en el aula.
          </Text>
          <View style={styles.badgePermiso}>
            <Text style={styles.badgePermisoTexto}>Requiere permiso de cámara</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colores.textoTenue} />
      </TouchableOpacity>

      {/* Botón: Elegir de la galería (sin permisos) */}
      <TouchableOpacity
        style={styles.opcionCard}
        activeOpacity={0.8}
        onPress={elegirDeGaleria}
      >
        <View style={styles.iconoCirculoVerde}>
          <Ionicons name="images" size={28} color={colores.exito} />
        </View>
        <View style={styles.opcionInfo}>
          <Text style={styles.opcionTitulo}>Elegir de la galería</Text>
          <Text style={styles.opcionDescripcion}>
            Abre el selector seguro del sistema operativo (Photo Picker).
          </Text>
          <View style={styles.badgeSinPermiso}>
            <Ionicons name="shield-checkmark" size={12} color={colores.exitoTexto} />
            <Text style={styles.badgeSinPermisoTexto}>Sin permisos requeridos</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colores.textoTenue} />
      </TouchableOpacity>

      {/* Banner educativo sobre el principio de mínimo privilegio */}
      <View style={styles.infoBanner}>
        <Ionicons name="bulb-outline" size={22} color={colores.primario} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoBannerTitulo}>El mejor permiso es el que no se pide</Text>
          <Text style={styles.infoBannerTexto}>
            Al elegir desde la galería, se utiliza el Photo Picker nativo de {Platform.OS === 'ios' ? 'iOS' : 'Android'}. La app solo recibe la foto que seleccionás voluntariamente, sin pedir permisos globales sobre todas tus fotos privadas.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 18,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    color: colores.textoSuave,
    lineHeight: 20,
    marginBottom: 20,
  },
  opcionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombras.suave,
  },
  iconoCirculoAzul: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colores.primarioSuave,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconoCirculoVerde: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colores.exitoSuave,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  opcionInfo: {
    flex: 1,
  },
  opcionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 4,
  },
  opcionDescripcion: {
    fontSize: 13,
    color: colores.textoSuave,
    lineHeight: 18,
    marginBottom: 6,
  },
  badgePermiso: {
    alignSelf: 'flex-start',
    backgroundColor: colores.neutroSuave,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePermisoTexto: {
    fontSize: 11,
    color: colores.textoSecundario,
    fontWeight: '600',
  },
  badgeSinPermiso: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colores.exitoSuave,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeSinPermisoTexto: {
    fontSize: 11,
    color: colores.exitoTexto,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: colores.primarioSuave,
    borderLeftWidth: 4,
    borderLeftColor: colores.primario,
    borderRadius: radios.sm,
    padding: 14,
    marginTop: 14,
    gap: 12,
  },
  infoBannerTitulo: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colores.primarioTexto,
    marginBottom: 4,
  },
  infoBannerTexto: {
    fontSize: 12.5,
    color: colores.primarioTexto,
    lineHeight: 18,
  },
});
