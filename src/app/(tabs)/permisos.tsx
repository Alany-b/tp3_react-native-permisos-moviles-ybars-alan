import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePermiso, EstadoPermiso, TipoRecurso } from '../../hooks/usePermiso';
import { colores, radios, sombras } from '../../theme';

interface TarjetaPermisoProps {
  titulo: string;
  recurso: TipoRecurso;
  icono: string;
  descripcion: string;
}

function TarjetaPermiso({ titulo, recurso, icono, descripcion }: TarjetaPermisoProps) {
  const router = useRouter();
  const { estado, parcial, matiz, pedir, abrirAjustes, revisar } = usePermiso(recurso);

  const colorEstado = (est: EstadoPermiso) => {
    switch (est) {
      case 'concedido':
        return {
          bg: colores.exitoSuave,
          text: colores.exitoTexto,
          border: colores.exitoBorde,
          label: 'Concedido',
        };
      case 'preguntable':
        return {
          bg: colores.avisoSuave,
          text: colores.avisoTexto,
          border: colores.avisoBorde,
          label: 'Preguntable',
        };
      case 'bloqueado':
        return {
          bg: colores.peligroSuave,
          text: colores.peligroTexto,
          border: colores.peligroBorde,
          label: 'Bloqueado',
        };
      case 'cargando':
      default:
        return {
          bg: colores.neutroSuave,
          text: colores.textoSecundario,
          border: colores.borde,
          label: 'Cargando...',
        };
    }
  };

  const infoBadge = colorEstado(estado);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tituloRow}>
          <View style={styles.iconoCirculo}>
            <Ionicons name={icono as any} size={22} color={colores.primario} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitulo}>{titulo}</Text>
            <View style={styles.metaRow}>
              <View style={styles.badgePlataforma}>
                <Ionicons
                  name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-android'}
                  size={11}
                  color={colores.textoSecundario}
                />
                <Text style={styles.textoPlataforma}>
                  {Platform.OS === 'ios' ? 'iOS' : 'Android'}
                </Text>
              </View>
              {parcial && (
                <View style={styles.badgeParcial}>
                  <Text style={styles.textoParcial}>Parcial</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View
          style={[
            styles.badgeEstado,
            { backgroundColor: infoBadge.bg, borderColor: infoBadge.border },
          ]}
        >
          <Text style={[styles.textoEstado, { color: infoBadge.text }]}>{infoBadge.label}</Text>
        </View>
      </View>

      <Text style={styles.cardDescripcion}>{descripcion}</Text>

      {matiz && (
        <View style={styles.matizContainer}>
          <Ionicons name="information-circle" size={16} color={colores.infoTexto} />
          <Text style={styles.matizTexto}>{matiz}</Text>
        </View>
      )}

      {/* Acciones contextuales según estado */}
      <View style={styles.accionesRow}>
        {estado === 'cargando' ? (
          <ActivityIndicator size="small" color={colores.primario} />
        ) : estado === 'preguntable' ? (
          <TouchableOpacity
            style={styles.botonPrimario}
            activeOpacity={0.85}
            onPress={() => router.push(`/permisos/${recurso}`)}
          >
            <Ionicons name="hand-right-outline" size={16} color={colores.blanco} />
            <Text style={styles.botonTexto}>Ver pantalla previa</Text>
          </TouchableOpacity>
        ) : estado === 'bloqueado' ? (
          <TouchableOpacity style={styles.botonPeligro} activeOpacity={0.85} onPress={abrirAjustes}>
            <Ionicons name="settings-outline" size={16} color={colores.blanco} />
            <Text style={styles.botonTexto}>Abrir Ajustes</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.filaConcedido}>
            <Ionicons name="checkmark-circle" size={20} color={colores.exito} />
            <Text style={styles.textoConcedido}>Acceso autorizado</Text>
            <TouchableOpacity style={styles.linkAjustes} onPress={abrirAjustes}>
              <Text style={styles.linkAjustesTexto}>Gestionar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default function PantallaPermisos() {
  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bannerInfo}>
        <Ionicons name="sync-outline" size={20} color={colores.primario} />
        <Text style={styles.bannerTexto}>
          Este panel se sincroniza en tiempo real. Si modificás un permiso desde Ajustes del sistema y volvés a la app, los estados se actualizan automáticamente usando AppState.
        </Text>
      </View>

      <TarjetaPermiso
        titulo="Cámara"
        recurso="camera"
        icono="camera-outline"
        descripcion="Requerida para escanear el código QR del aula y para capturar fotos de desperfectos en el lugar."
      />

      <TarjetaPermiso
        titulo="Ubicación (Primer Plano)"
        recurso="location"
        icono="location-outline"
        descripcion="Permite asociar geográficamente el reporte al campus o sector del edificio. Se tolera precisión aproximada."
      />

      <TarjetaPermiso
        titulo="Notificaciones"
        recurso="notifications"
        icono="notifications-outline"
        descripcion="Canal de alerta para recibir un aviso en cuanto el personal de mantenimiento repare el desperfecto."
      />

      <TarjetaPermiso
        titulo="Selector de Fotos"
        recurso="mediaLibrary"
        icono="images-outline"
        descripcion="La app utiliza el selector nativo del sistema (Photo Picker), por lo que no requiere permisos globales sobre toda tu galería."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bannerInfo: {
    flexDirection: 'row',
    backgroundColor: colores.primarioSuave,
    borderWidth: 1,
    borderColor: colores.primarioBorde,
    padding: 14,
    borderRadius: radios.md,
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  bannerTexto: {
    flex: 1,
    fontSize: 12.5,
    color: colores.primarioTexto,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombras.suave,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconoCirculo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colores.primarioSuave,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  badgePlataforma: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.neutroSuave,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  textoPlataforma: {
    fontSize: 11,
    color: colores.textoSecundario,
    fontWeight: '600',
  },
  badgeParcial: {
    backgroundColor: colores.infoSuave,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  textoParcial: {
    fontSize: 11,
    color: colores.infoTexto,
    fontWeight: '600',
  },
  badgeEstado: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radios.pildora,
    borderWidth: 1,
  },
  textoEstado: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  cardDescripcion: {
    fontSize: 13.5,
    color: colores.textoSuave,
    lineHeight: 20,
    marginBottom: 12,
  },
  matizContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.infoSuave,
    padding: 10,
    borderRadius: radios.sm,
    gap: 8,
    marginBottom: 14,
  },
  matizTexto: {
    flex: 1,
    fontSize: 12,
    color: colores.infoTexto,
    fontWeight: '500',
  },
  accionesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colores.divisor,
    paddingTop: 12,
  },
  botonPrimario: {
    backgroundColor: colores.primario,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radios.sm,
    gap: 6,
  },
  botonPeligro: {
    backgroundColor: colores.peligro,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radios.sm,
    gap: 6,
  },
  botonTexto: {
    color: colores.blanco,
    fontSize: 13,
    fontWeight: '700',
  },
  filaConcedido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  textoConcedido: {
    fontSize: 13,
    color: colores.exitoTexto,
    fontWeight: '600',
    flex: 1,
  },
  linkAjustes: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radios.pildora,
    backgroundColor: colores.primarioSuave,
  },
  linkAjustesTexto: {
    fontSize: 12.5,
    color: colores.primarioTexto,
    fontWeight: '700',
  },
});
