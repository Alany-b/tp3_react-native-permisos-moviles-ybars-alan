import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { store, UbicacionReporte } from '../../lib/store';
import { usePermiso } from '../../hooks/usePermiso';
import { colores, radios, sombras } from '../../theme';

const SECTORES_PREDEFINIDOS = [
  'Patio Central',
  'Estacionamiento de Vehículos',
  'Pasillo Principal Planta Baja',
  'Pasillo Pabellón A - 1er Piso',
  'Pasillo Pabellón B - 2do Piso',
  'Biblioteca y Sala de Estudio',
  'Cantina / Buffet',
  'Polideportivo / Canchas',
  'Acceso Peatonal Principal',
];

export default function PantallaUbicacion() {
  const router = useRouter();
  const { estado, pedir, abrirAjustes } = usePermiso('location');

  const [cargandoGPS, setCargandoGPS] = useState(false);
  const [ubicacionGPS, setUbicacionGPS] = useState<UbicacionReporte | null>(null);
  const [sectorElegido, setSectorElegido] = useState<string>('');
  const [sectorManual, setSectorManual] = useState<string>('');

  const obtenerUbicacionGPS = async () => {
    setCargandoGPS(true);
    try {
      let permisoActual = await Location.getForegroundPermissionsAsync();

      if (permisoActual.status !== 'granted') {
        if (permisoActual.canAskAgain) {
          permisoActual = await Location.requestForegroundPermissionsAsync();
        } else {
          Alert.alert(
            'Ubicación Bloqueada',
            'El acceso a la ubicación está bloqueado. Podés habilitarlo desde Ajustes o elegir el sector a mano.',
            [
              { text: 'Elegir a mano', style: 'cancel' },
              { text: 'Abrir Ajustes', onPress: abrirAjustes },
            ]
          );
          setCargandoGPS(false);
          return;
        }
      }

      if (permisoActual.status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'No se pudo obtener la ubicación GPS. Podés seleccionar el sector edilicio manualmente en la lista de abajo.'
        );
        setCargandoGPS(false);
        return;
      }

      // Requisito 4: Detección estricta de precisión reducida / aproximada
      let esAproximada = false;
      if (Platform.OS === 'android') {
        esAproximada = permisoActual.android?.accuracy === 'coarse';
      } else if (Platform.OS === 'ios') {
        esAproximada =
          (permisoActual as any).scope === 'reduced' ||
          (permisoActual as any).accuracy === 'reduced';
      }

      if (esAproximada) {
        // En ubicación aproximada NO se muestran coordenadas milimétricas sino "Ubicación aproximada"
        const ubicacionAprox: UbicacionReporte = {
          sector: 'Campus IPF (Ubicación aproximada)',
          esAproximada: true,
        };
        setUbicacionGPS(ubicacionAprox);
      } else {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const ubicacionPrecisa: UbicacionReporte = {
          coordenadas: {
            latitud: pos.coords.latitude,
            longitud: pos.coords.longitude,
          },
          esAproximada: false,
          sector: 'Campus IPF (Ubicación GPS)',
        };
        setUbicacionGPS(ubicacionPrecisa);
      }
    } catch (error) {
      console.warn('Error obteniendo ubicación:', error);
      Alert.alert(
        'Error de localización',
        'No fue posible obtener tu señal satelital. Seleccioná el sector a mano a continuación.'
      );
    } finally {
      setCargandoGPS(false);
    }
  };

  const confirmarUbicacion = (ubicacionAConfirmar: UbicacionReporte) => {
    store.actualizarBorrador({ ubicacion: ubicacionAConfirmar });
    router.back();
  };

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.titulo}>Marcar Ubicación del Problema</Text>
      <Text style={styles.subtitulo}>
        Podés usar el sensor GPS en primer plano o seleccionar el sector edilicio a mano.
      </Text>

      {/* Opción 1: Obtención por sensor (primer plano respetuoso) */}
      <View style={styles.cardGPS}>
        <View style={styles.cardGPSHeader}>
          <Ionicons name="navigate-circle-outline" size={26} color={colores.primario} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardGPSTitulo}>Ubicación Actual (Primer Plano)</Text>
            <Text style={styles.cardGPSDesc}>
              Solo se utiliza mientras tenés la pantalla abierta. Si la precisión es aproximada, no exponemos tus coordenadas exactas.
            </Text>
          </View>
        </View>

        {ubicacionGPS ? (
          <View style={styles.gpsResultadoBox}>
            <Ionicons
              name={ubicacionGPS.esAproximada ? 'radio-button-on' : 'checkmark-circle'}
              size={20}
              color={ubicacionGPS.esAproximada ? colores.avisoTexto : colores.exitoTexto}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.gpsResultadoTitulo,
                  { color: ubicacionGPS.esAproximada ? colores.avisoTexto : colores.exitoTexto },
                ]}
              >
                {ubicacionGPS.esAproximada
                  ? 'Ubicación aproximada detectada'
                  : 'Ubicación precisa fijada'}
              </Text>
              {ubicacionGPS.esAproximada ? (
                <Text style={styles.gpsResultadoDetalle}>
                  Área estimada: Campus Instituto Politécnico Formosa
                </Text>
              ) : (
                <Text style={styles.gpsResultadoDetalle}>
                  Lat: {ubicacionGPS.coordenadas?.latitud.toFixed(5)} | Lng:{' '}
                  {ubicacionGPS.coordenadas?.longitud.toFixed(5)}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.btnConfirmarGPS}
              onPress={() => confirmarUbicacion(ubicacionGPS)}
            >
              <Text style={styles.btnConfirmarGPSTexto}>Usar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.botonObtenerGPS}
            activeOpacity={0.8}
            onPress={obtenerUbicacionGPS}
            disabled={cargandoGPS}
          >
            {cargandoGPS ? (
              <ActivityIndicator size="small" color={colores.blanco} />
            ) : (
              <>
                <Ionicons name="locate-outline" size={18} color={colores.blanco} />
                <Text style={styles.botonObtenerGPSTexto}>Detectar Ubicación Actual</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Opción 2: Camino alternativo obligatorio - Selección de sector a mano */}
      <View style={styles.cardSector}>
        <View style={styles.cardSectorHeader}>
          <Ionicons name="business-outline" size={24} color={colores.primario} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardSectorTitulo}>Camino Alternativo: Elegir sector a mano</Text>
            <Text style={styles.cardSectorDesc}>
              Si denegaste el permiso o estás sin señal, elegí el espacio del instituto:
            </Text>
          </View>
        </View>

        <View style={styles.chipsContainer}>
          {SECTORES_PREDEFINIDOS.map((sector) => {
            const activo = sectorElegido === sector;
            return (
              <TouchableOpacity
                key={sector}
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => {
                  setSectorElegido(sector);
                  setSectorManual('');
                }}
              >
                <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{sector}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.otroSectorLabel}>O escribí otro sector específico:</Text>
        <TextInput
          style={styles.inputOtroSector}
          placeholder="Ej: Sala de profesores, Tablero principal"
          value={sectorManual}
          onChangeText={(texto) => {
            setSectorManual(texto);
            setSectorElegido('');
          }}
        />

        <TouchableOpacity
          style={styles.botonConfirmarSector}
          activeOpacity={0.8}
          onPress={() => {
            const sectorFinal = sectorManual.trim() || sectorElegido;
            if (!sectorFinal) {
              Alert.alert('Selección requerida', 'Por favor seleccioná o escribí un sector.');
              return;
            }
            confirmarUbicacion({
              sector: sectorFinal,
              esAproximada: false,
            });
          }}
        >
          <Ionicons name="checkmark" size={18} color={colores.blanco} />
          <Text style={styles.botonConfirmarSectorTexto}>Confirmar Sector Seleccionado</Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 13.5,
    color: colores.textoSuave,
    lineHeight: 18,
    marginBottom: 16,
  },
  cardGPS: {
    backgroundColor: colores.superficie,
    borderRadius: radios.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 16,
    ...sombras.suave,
  },
  cardGPSHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  cardGPSTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  cardGPSDesc: {
    fontSize: 12.5,
    color: colores.textoSuave,
    lineHeight: 16,
    marginTop: 2,
  },
  botonObtenerGPS: {
    backgroundColor: colores.primario,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radios.sm,
    gap: 8,
  },
  botonObtenerGPSTexto: {
    color: colores.blanco,
    fontSize: 14,
    fontWeight: '700',
  },
  gpsResultadoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    padding: 12,
    borderRadius: radios.sm,
    borderWidth: 1,
    borderColor: colores.bordeInput,
    gap: 10,
  },
  gpsResultadoTitulo: {
    fontSize: 13,
    fontWeight: '700',
  },
  gpsResultadoDetalle: {
    fontSize: 12,
    color: colores.textoSuave,
    marginTop: 2,
  },
  btnConfirmarGPS: {
    backgroundColor: colores.exito,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnConfirmarGPSTexto: {
    color: colores.blanco,
    fontSize: 13,
    fontWeight: '700',
  },
  cardSector: {
    backgroundColor: colores.superficie,
    borderRadius: radios.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombras.suave,
  },
  cardSectorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  cardSectorTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.primarioTexto,
  },
  cardSectorDesc: {
    fontSize: 12.5,
    color: colores.textoSuave,
    lineHeight: 16,
    marginTop: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: colores.superficieAlt,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipActivo: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  chipTexto: {
    fontSize: 12,
    color: colores.textoSecundario,
  },
  chipTextoActivo: {
    color: colores.blanco,
    fontWeight: '700',
  },
  otroSectorLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colores.textoSecundario,
    marginBottom: 6,
  },
  inputOtroSector: {
    borderWidth: 1,
    borderColor: colores.bordeInput,
    borderRadius: radios.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colores.texto,
    marginBottom: 14,
  },
  botonConfirmarSector: {
    backgroundColor: colores.primario,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radios.sm,
    gap: 6,
  },
  botonConfirmarSectorTexto: {
    color: colores.blanco,
    fontSize: 14,
    fontWeight: '700',
  },
});
