import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../../lib/store';
import { useRevisarAlVolver } from '../../hooks/useRevisarAlVolver';
import { colores, radios, sombras } from '../../theme';

export default function PantallaEscanear() {
  const router = useRouter();
  const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
  const [codigoManual, setCodigoManual] = useState('');
  const [escaneado, setEscaneado] = useState(false);

  // Re-consultar estado al regresar de Ajustes
  useRevisarAlVolver(() => {
    consultarPermiso();
  });

  const guardarAulaYVolver = (aulaTexto: string) => {
    if (!aulaTexto.trim()) {
      Alert.alert('Código vacío', 'Por favor ingresá el nombre o código del aula.');
      return;
    }
    store.actualizarBorrador({ aula: aulaTexto.trim() });
    router.back();
  };

  const manejarBarcodeScanned = ({ data }: { data: string }) => {
    if (escaneado) return;
    setEscaneado(true);
    // Asumir que el QR contiene el identificador de aula
    guardarAulaYVolver(data);
  };

  // 1. ESTADO: CARGANDO
  if (!permiso) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={styles.textoCargando}>Consultando permisos de la cámara...</Text>
      </View>
    );
  }

  // 2. ESTADO: CONCEDIDO (Muestra el visor de la cámara nativo)
  if (permiso.status === 'granted') {
    return (
      <View style={styles.flex}>
        <CameraView
          style={styles.flex}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={escaneado ? undefined : manejarBarcodeScanned}
        >
          <View style={styles.overlayCamara}>
            <View style={styles.marcadorQR}>
              <View style={[styles.esquina, styles.esquinaTL]} />
              <View style={[styles.esquina, styles.esquinaTR]} />
              <View style={[styles.esquina, styles.esquinaBL]} />
              <View style={[styles.esquina, styles.esquinaBR]} />
            </View>
            <Text style={styles.instruccionCamara}>
              Apuntá al código QR pegado en la puerta del aula
            </Text>

            {/* Alternativa si el QR está dañado o no se puede leer */}
            <View style={styles.cajaAlternativaFlotante}>
              <Text style={styles.cajaAlternativaTitulo}>¿No podés escanear?</Text>
              <View style={styles.filaInputManual}>
                <TextInput
                  style={styles.inputManualBlanco}
                  placeholder="Ej: Aula 104"
                  placeholderTextColor={colores.textoSuave}
                  value={codigoManual}
                  onChangeText={setCodigoManual}
                />
                <TouchableOpacity
                  style={styles.btnManualOk}
                  onPress={() => guardarAulaYVolver(codigoManual)}
                >
                  <Text style={styles.btnManualOkTexto}>Listo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // 3. ESTADO: BLOQUEADO (canAskAgain === false)
  if (!permiso.canAskAgain) {
    return (
      <View style={styles.containerBloqueado}>
        <View style={styles.iconoAlerta}>
          <Ionicons name="lock-closed" size={40} color={colores.peligro} />
        </View>
        <Text style={styles.tituloBloqueado}>Cámara Bloqueada en el Sistema</Text>
        <Text style={styles.textoBloqueado}>
          El acceso a la cámara fue bloqueado permanentemente. Para poder escanear el QR necesitás habilitarlo manualmente desde los Ajustes del dispositivo.
        </Text>

        <TouchableOpacity
          style={styles.botonAjustes}
          activeOpacity={0.8}
          onPress={() => Linking.openSettings()}
        >
          <Ionicons name="settings-outline" size={18} color={colores.blanco} />
          <Text style={styles.botonAjustesTexto}>Abrir Ajustes</Text>
        </TouchableOpacity>

        {/* Requisito 7: Alternativa manual inmediata cuando la cámara se deniega */}
        <View style={styles.divisor} />
        <View style={styles.cardAlternativa}>
          <Text style={styles.tituloAlternativa}>Camino Alternativo: Escribir aula a mano</Text>
          <Text style={styles.subtituloAlternativa}>
            No te preocupes, podés continuar con tu reporte ingresando el código o nombre del aula:
          </Text>
          <TextInput
            style={styles.inputManual}
            placeholder="Ej: Laboratorio 2, Taller 1, Aula 201"
            value={codigoManual}
            onChangeText={setCodigoManual}
          />
          <TouchableOpacity
            style={styles.botonGuardarManual}
            onPress={() => guardarAulaYVolver(codigoManual)}
          >
            <Ionicons name="checkmark" size={18} color={colores.blanco} />
            <Text style={styles.botonGuardarManualTexto}>Guardar Aula</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 4. ESTADO: PREGUNTABLE (undetermined o denied con canAskAgain === true)
  return (
    <View style={styles.containerPreguntable}>
      <View style={styles.iconoCirculo}>
        <Ionicons name="qr-code-outline" size={48} color={colores.primario} />
      </View>
      <Text style={styles.tituloPreguntable}>Escanear QR de Aula</Text>
      <View style={styles.beneficioBox}>
        <Text style={styles.beneficioTexto}>
          Usamos la cámara para leer el código QR de la puerta del aula y completar su ubicación automáticamente.
        </Text>
      </View>

      {/* Botón único "Continuar" para disparar el diálogo del sistema */}
      <TouchableOpacity
        style={styles.botonContinuar}
        activeOpacity={0.8}
        onPress={() => pedirPermiso()}
      >
        <Text style={styles.botonContinuarTexto}>Continuar</Text>
        <Ionicons name="arrow-forward" size={18} color={colores.blanco} />
      </TouchableOpacity>

      {/* Alternativa disponible en todo momento */}
      <View style={styles.cardAlternativaAbajo}>
        <Text style={styles.tituloAlternativa}>O escribí el aula a mano:</Text>
        <View style={styles.filaInputManual}>
          <TextInput
            style={[styles.inputManual, { flex: 1, marginBottom: 0 }]}
            placeholder="Ej: Aula 302"
            value={codigoManual}
            onChangeText={setCodigoManual}
          />
          <TouchableOpacity
            style={styles.btnManualOk}
            onPress={() => guardarAulaYVolver(codigoManual)}
          >
            <Text style={styles.btnManualOkTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colores.fondo,
    padding: 20,
  },
  textoCargando: {
    marginTop: 12,
    fontSize: 15,
    color: colores.primarioTexto,
    fontWeight: '500',
  },
  overlayCamara: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  marcadorQR: {
    width: 240,
    height: 240,
    position: 'relative',
    marginBottom: 20,
  },
  esquina: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colores.escaner,
  },
  esquinaTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  esquinaTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  esquinaBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  esquinaBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  instruccionCamara: {
    color: colores.blanco,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cajaAlternativaFlotante: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: colores.superficie,
    borderRadius: radios.md,
    padding: 14,
    ...sombras.media,
  },
  cajaAlternativaTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 8,
  },
  filaInputManual: {
    flexDirection: 'row',
    gap: 8,
  },
  inputManualBlanco: {
    flex: 1,
    borderWidth: 1,
    borderColor: colores.bordeInput,
    borderRadius: radios.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: colores.texto,
  },
  btnManualOk: {
    backgroundColor: colores.primario,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: radios.sm,
  },
  btnManualOkTexto: {
    color: colores.blanco,
    fontSize: 13,
    fontWeight: '700',
  },
  containerBloqueado: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoAlerta: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colores.peligroSuave,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tituloBloqueado: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.peligroTexto,
    textAlign: 'center',
    marginBottom: 8,
  },
  textoBloqueado: {
    fontSize: 14,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  botonAjustes: {
    backgroundColor: colores.peligro,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radios.sm,
    gap: 8,
  },
  botonAjustesTexto: {
    color: colores.blanco,
    fontSize: 15,
    fontWeight: '700',
  },
  divisor: {
    width: '100%',
    height: 1,
    backgroundColor: colores.borde,
    marginVertical: 24,
  },
  cardAlternativa: {
    backgroundColor: colores.superficie,
    width: '100%',
    borderRadius: radios.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.bordeInput,
  },
  tituloAlternativa: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.primarioTexto,
    marginBottom: 6,
  },
  subtituloAlternativa: {
    fontSize: 13,
    color: colores.textoSuave,
    marginBottom: 12,
    lineHeight: 18,
  },
  inputManual: {
    backgroundColor: colores.superficieAlt,
    borderWidth: 1,
    borderColor: colores.bordeInput,
    borderRadius: radios.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colores.texto,
    marginBottom: 12,
  },
  botonGuardarManual: {
    backgroundColor: colores.primario,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radios.sm,
    gap: 6,
  },
  botonGuardarManualTexto: {
    color: colores.blanco,
    fontSize: 14,
    fontWeight: '700',
  },
  containerPreguntable: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoCirculo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colores.primarioSuave,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tituloPreguntable: {
    fontSize: 20,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 12,
  },
  beneficioBox: {
    backgroundColor: colores.superficie,
    padding: 14,
    borderRadius: radios.sm,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 20,
    width: '100%',
  },
  beneficioTexto: {
    fontSize: 14,
    color: colores.textoSecundario,
    lineHeight: 20,
    textAlign: 'center',
  },
  botonContinuar: {
    backgroundColor: colores.primario,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radios.sm,
    gap: 8,
    marginBottom: 20,
  },
  botonContinuarTexto: {
    color: colores.blanco,
    fontSize: 16,
    fontWeight: '700',
  },
  cardAlternativaAbajo: {
    backgroundColor: colores.superficie,
    width: '100%',
    padding: 14,
    borderRadius: radios.sm,
    borderWidth: 1,
    borderColor: colores.borde,
  },
});
