import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { store, Reporte } from '../../lib/store';
import { simularResolucionReporte } from '../../lib/notificaciones';
import { colores, radios, sombras, estadoReporte } from '../../theme';

export default function PantallaDetalleReporte() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reporte, setReporte] = useState<Reporte | undefined>(undefined);
  const [cargandoSimulacion, setCargandoSimulacion] = useState(false);

  useEffect(() => {
    if (id) {
      setReporte(store.getReportePorId(id));
    }
  }, [id]);

  useEffect(() => {
    const desuscribir = store.suscribir(() => {
      if (id) {
        setReporte(store.getReportePorId(id));
      }
    });
    return desuscribir;
  }, [id]);

  // Validar el ID: si no existe en el store, mostrar mensaje correspondiente
  if (!id || !reporte) {
    return (
      <View style={styles.centerError}>
        <View style={styles.errorIcono}>
          <Ionicons name="alert-circle-outline" size={44} color={colores.peligro} />
        </View>
        <Text style={styles.errorTitulo}>Reporte no encontrado</Text>
        <Text style={styles.errorTexto}>
          El identificador "{id}" no corresponde a ningún reporte activo en el sistema.
        </Text>
        <TouchableOpacity
          style={styles.btnVolver}
          activeOpacity={0.9}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.btnVolverTexto}>Volver a la lista de reportes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const estiloBadge = estadoReporte[reporte.estado];

  // Requisito 5: Simular resolución
  const manejarSimularResolucion = async () => {
    setCargandoSimulacion(true);
    try {
      const resultado = await simularResolucionReporte(reporte);
      Alert.alert(
        resultado.tipo === 'notificacion' ? 'Notificación Programada' : 'Aviso Registrado',
        resultado.mensaje,
        [
          {
            text: resultado.tipo === 'aviso_interno' ? 'Ir a Bandeja de Avisos' : 'Entendido',
            onPress: () => {
              if (resultado.tipo === 'aviso_interno') {
                router.push('/avisos');
              }
            },
          },
        ]
      );
    } catch (e) {
      console.warn('Error en simulación:', e);
    } finally {
      setCargandoSimulacion(false);
    }
  };

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Encabezado con estado y fecha */}
      <View style={styles.headerCard}>
        <View style={styles.filaEstado}>
          <View
            style={[
              styles.badge,
              { backgroundColor: estiloBadge.bg, borderColor: estiloBadge.border },
            ]}
          >
            <Text style={[styles.badgeTexto, { color: estiloBadge.text }]}>
              {reporte.estado.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.fechaTexto}>{reporte.fechaCreacion}</Text>
        </View>

        <Text style={styles.titulo}>{reporte.titulo}</Text>
        <View style={styles.categoriaRow}>
          <Ionicons name="pricetag" size={14} color={colores.primario} />
          <Text style={styles.categoriaTexto}>
            Categoría: {reporte.categoria.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Ubicación y Espacio */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardInfoTitulo}>Ubicación y Aula</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoIcono}>
            <Ionicons name="location" size={18} color={colores.primario} />
          </View>
          <Text style={styles.infoTextoPrincipal}>{reporte.aula}</Text>
        </View>

        {reporte.ubicacion && (
          <View style={styles.detalleUbicacionBox}>
            {reporte.ubicacion.sector && (
              <Text style={styles.detalleUbicacionTexto}>
                <Text style={{ fontWeight: '700' }}>Sector:</Text> {reporte.ubicacion.sector}
              </Text>
            )}
            {reporte.ubicacion.esAproximada && (
              <Text style={[styles.detalleUbicacionTexto, { color: colores.avisoTexto }]}>
                (Precisión aproximada: radio del campus)
              </Text>
            )}
            {reporte.ubicacion.coordenadas && (
              <Text style={styles.detalleUbicacionTexto}>
                <Text style={{ fontWeight: '700' }}>Coordenadas:</Text>{' '}
                {reporte.ubicacion.coordenadas.latitud.toFixed(4)},{' '}
                {reporte.ubicacion.coordenadas.longitud.toFixed(4)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Descripción */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardInfoTitulo}>Descripción del Problema</Text>
        <Text style={styles.descripcionTexto}>{reporte.descripcion}</Text>
      </View>

      {/* Foto adjunta */}
      {reporte.fotoUri && (
        <View style={styles.cardInfo}>
          <Text style={styles.cardInfoTitulo}>Evidencia Fotográfica</Text>
          <Image source={{ uri: reporte.fotoUri }} style={styles.fotoAdjunta} />
        </View>
      )}

      {/* Botón de prueba: Simular Resolución */}
      <View style={styles.simulacionContainer}>
        <View style={styles.simulacionHeader}>
          <Ionicons name="flask-outline" size={18} color={colores.primarioTexto} />
          <Text style={styles.simulacionTitulo}>Prueba de Permisos y Notificaciones</Text>
        </View>
        <Text style={styles.simulacionDesc}>
          Tocá el botón para simular que la cuadrilla reparó el desperfecto. Si tenés las notificaciones habilitadas, se disparará una alerta del sistema a los 10 segundos. Si están denegadas, se enviará el aviso a la bandeja interna /avisos.
        </Text>

        <TouchableOpacity
          style={styles.botonSimular}
          activeOpacity={0.9}
          onPress={manejarSimularResolucion}
          disabled={cargandoSimulacion}
        >
          {cargandoSimulacion ? (
            <ActivityIndicator size="small" color={colores.blanco} />
          ) : (
            <>
              <Ionicons name="checkmark-done-circle" size={20} color={colores.blanco} />
              <Text style={styles.botonSimularTexto}>Simular Resolución</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 48,
  },
  centerError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    backgroundColor: colores.fondo,
  },
  errorIcono: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colores.peligroSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: colores.peligroTexto,
    marginTop: 16,
    marginBottom: 8,
  },
  errorTexto: {
    fontSize: 14,
    color: colores.textoSuave,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 21,
  },
  btnVolver: {
    backgroundColor: colores.primario,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radios.md,
    ...sombras.fuerte,
  },
  btnVolverTexto: {
    color: colores.blanco,
    fontSize: 14,
    fontWeight: '700',
  },
  headerCard: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombras.suave,
  },
  filaEstado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: radios.pildora,
    borderWidth: 1,
  },
  badgeTexto: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  fechaTexto: {
    fontSize: 12,
    color: colores.textoTenue,
  },
  titulo: {
    fontSize: 21,
    fontWeight: '800',
    color: colores.texto,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  categoriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoriaTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.primarioTexto,
    letterSpacing: 0.4,
  },
  cardInfo: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombras.suave,
  },
  cardInfoTitulo: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colores.textoSuave,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcono: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextoPrincipal: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
    flex: 1,
  },
  detalleUbicacionBox: {
    backgroundColor: colores.superficieAlt,
    padding: 12,
    borderRadius: radios.sm,
    marginTop: 12,
    gap: 2,
  },
  detalleUbicacionTexto: {
    fontSize: 13,
    color: colores.textoSecundario,
    lineHeight: 19,
  },
  descripcionTexto: {
    fontSize: 15,
    color: colores.textoSecundario,
    lineHeight: 23,
  },
  fotoAdjunta: {
    width: '100%',
    height: 230,
    borderRadius: radios.md,
  },
  simulacionContainer: {
    backgroundColor: colores.primarioSuave,
    borderRadius: radios.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colores.primarioBorde,
    marginTop: 6,
  },
  simulacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  simulacionTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: colores.primarioTexto,
    flex: 1,
  },
  simulacionDesc: {
    fontSize: 12.5,
    color: colores.primarioTexto,
    lineHeight: 19,
    marginBottom: 16,
  },
  botonSimular: {
    backgroundColor: colores.primario,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: radios.md,
    gap: 8,
    ...sombras.fuerte,
  },
  botonSimularTexto: {
    color: colores.blanco,
    fontSize: 15,
    fontWeight: '700',
  },
});
