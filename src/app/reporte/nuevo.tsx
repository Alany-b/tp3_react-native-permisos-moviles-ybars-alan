import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { store, CategoriaReporte } from '../../lib/store';
import { colores, radios, sombras } from '../../theme';

const CATEGORIAS: Array<{ key: CategoriaReporte; label: string; icon: string }> = [
  { key: 'electricidad', label: 'Electricidad', icon: 'flash-outline' },
  { key: 'agua', label: 'Agua', icon: 'water-outline' },
  { key: 'mobiliario', label: 'Mobiliario', icon: 'cube-outline' },
  { key: 'equipos', label: 'Equipos', icon: 'desktop-outline' },
];

export default function PantallaNuevoReporte() {
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [aula, setAula] = useState('');
  const [categoria, setCategoria] = useState<CategoriaReporte>('electricidad');
  const [fotoUri, setFotoUri] = useState<string | undefined>(undefined);
  const [ubicacionTexto, setUbicacionTexto] = useState<string | undefined>(undefined);
  const [ubicacionObj, setUbicacionObj] = useState<any>(undefined);

  // Sincronizar con el borrador global por si volvemos de escanear, foto o ubicación
  useEffect(() => {
    const sincronizarBorrador = () => {
      const borrador = store.getBorrador();
      if (borrador.aula) setAula(borrador.aula);
      if (borrador.fotoUri) setFotoUri(borrador.fotoUri);
      if (borrador.ubicacion) {
        setUbicacionObj(borrador.ubicacion);
        if (borrador.ubicacion.sector) {
          setUbicacionTexto(borrador.ubicacion.sector);
        } else if (borrador.ubicacion.esAproximada) {
          setUbicacionTexto('Ubicación aproximada del campus');
        } else if (borrador.ubicacion.coordenadas) {
          setUbicacionTexto(
            `Coord: ${borrador.ubicacion.coordenadas.latitud.toFixed(4)}, ${borrador.ubicacion.coordenadas.longitud.toFixed(4)}`
          );
        }
      }
    };

    sincronizarBorrador();
    const desuscribir = store.suscribir(sincronizarBorrador);
    return desuscribir;
  }, []);

  const guardarReporte = () => {
    if (!titulo.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresá un título descriptivo para el reporte.');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Campo requerido', 'Por favor describí el desperfecto.');
      return;
    }
    if (!aula.trim()) {
      Alert.alert('Campo requerido', 'Por favor indicá el aula o sector del desperfecto.');
      return;
    }

    const nuevoReporte = store.agregarReporte({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      aula: aula.trim(),
      categoria,
      fotoUri,
      ubicacion: ubicacionObj,
    });

    // Limpiar borrador temporal
    store.limpiarBorrador();

    Alert.alert(
      '¡Reporte Creado!',
      'El reporte fue registrado exitosamente y pasará a revisión de la cuadrilla técnica.',
      [
        {
          text: 'Ver Detalle',
          onPress: () => router.replace(`/reporte/${nuevoReporte.id}`),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.seccionTitulo}>Datos del Desperfecto</Text>

      <Text style={styles.label}>Título del problema *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Canilla perdiendo en baño PB"
        placeholderTextColor={colores.textoTenue}
        selectionColor={colores.primario}
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Categoría *</Text>
      <View style={styles.categoriasGrid}>
        {CATEGORIAS.map((cat) => {
          const seleccionada = categoria === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoriaBtn, seleccionada && styles.categoriaBtnActiva]}
              activeOpacity={0.85}
              onPress={() => setCategoria(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={seleccionada ? colores.blanco : colores.primario}
              />
              <Text
                style={[styles.categoriaBtnTexto, seleccionada && styles.categoriaBtnTextoActiva]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Aula o Espacio Edilicio *</Text>
      <View style={styles.inputConBoton}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Ej: Aula 102 o escanear QR"
          placeholderTextColor={colores.textoTenue}
          selectionColor={colores.primario}
          value={aula}
          onChangeText={setAula}
        />
        <TouchableOpacity
          style={styles.botonAccionInput}
          activeOpacity={0.85}
          onPress={() => router.push('/reporte/escanear')}
        >
          <Ionicons name="qr-code-outline" size={20} color={colores.primarioTexto} />
          <Text style={styles.botonAccionTexto}>Escanear</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Descripción detallada *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describí con el mayor detalle posible qué ocurre, si hay peligro eléctrico, etc."
        placeholderTextColor={colores.textoTenue}
        selectionColor={colores.primario}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
      />

      <Text style={[styles.seccionTitulo, { marginTop: 14 }]}>Adjuntos y Ubicación</Text>

      {/* Botón y estado de Foto */}
      <View style={styles.adjuntoCard}>
        <View style={styles.adjuntoHeader}>
          <View style={styles.adjuntoIcono}>
            <Ionicons name="camera-outline" size={20} color={colores.primario} />
          </View>
          <Text style={styles.adjuntoTitulo}>Fotografía del desperfecto</Text>
        </View>

        {fotoUri ? (
          <View style={styles.previewFotoContenedor}>
            <Image source={{ uri: fotoUri }} style={styles.previewFoto} />
            <TouchableOpacity
              style={styles.eliminarFotoBtn}
              onPress={() => {
                setFotoUri(undefined);
                store.actualizarBorrador({ fotoUri: undefined });
              }}
            >
              <Ionicons name="trash-outline" size={16} color={colores.peligro} />
              <Text style={styles.eliminarFotoTexto}>Quitar foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.botonSecundario}
            activeOpacity={0.85}
            onPress={() => router.push('/reporte/foto')}
          >
            <Ionicons name="add-circle-outline" size={18} color={colores.primarioTexto} />
            <Text style={styles.botonSecundarioTexto}>Sacar o Elegir Foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Botón y estado de Ubicación */}
      <View style={styles.adjuntoCard}>
        <View style={styles.adjuntoHeader}>
          <View style={styles.adjuntoIcono}>
            <Ionicons name="location-outline" size={20} color={colores.primario} />
          </View>
          <Text style={styles.adjuntoTitulo}>Ubicación física en el predio</Text>
        </View>

        {ubicacionTexto ? (
          <View style={styles.infoUbicacionActiva}>
            <Ionicons name="pin" size={18} color={colores.exito} />
            <Text style={styles.textoUbicacionActiva}>{ubicacionTexto}</Text>
            <TouchableOpacity
              style={{ marginLeft: 'auto' }}
              onPress={() => router.push('/reporte/ubicacion')}
            >
              <Text style={styles.cambiarLink}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.botonSecundario}
            activeOpacity={0.85}
            onPress={() => router.push('/reporte/ubicacion')}
          >
            <Ionicons name="navigate-outline" size={18} color={colores.primarioTexto} />
            <Text style={styles.botonSecundarioTexto}>Marcar Ubicación o Sector</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.botonGuardar}
        activeOpacity={0.9}
        onPress={guardarReporte}
      >
        <Ionicons name="send" size={20} color={colores.blanco} />
        <Text style={styles.botonGuardarTexto}>Enviar Reporte a Mantenimiento</Text>
      </TouchableOpacity>
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
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: colores.texto,
    letterSpacing: -0.3,
    marginTop: 4,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colores.textoSecundario,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.bordeInput,
    borderRadius: radios.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colores.texto,
    marginBottom: 16,
  },
  inputConBoton: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    marginBottom: 16,
  },
  botonAccionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.primarioSuave,
    paddingHorizontal: 14,
    borderRadius: radios.sm,
    borderWidth: 1,
    borderColor: colores.primarioBorde,
    gap: 6,
  },
  botonAccionTexto: {
    fontSize: 13,
    color: colores.primarioTexto,
    fontWeight: '700',
  },
  textArea: {
    height: 104,
    textAlignVertical: 'top',
  },
  categoriasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoriaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.bordeInput,
    borderRadius: radios.pildora,
    paddingVertical: 9,
    paddingHorizontal: 14,
    gap: 6,
  },
  categoriaBtnActiva: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  categoriaBtnTexto: {
    fontSize: 13,
    color: colores.textoSecundario,
    fontWeight: '600',
  },
  categoriaBtnTextoActiva: {
    color: colores.blanco,
    fontWeight: '700',
  },
  adjuntoCard: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 14,
    ...sombras.suave,
  },
  adjuntoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  adjuntoIcono: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjuntoTitulo: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colores.texto,
    flex: 1,
  },
  botonSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.primarioSuave,
    borderWidth: 1,
    borderColor: colores.primarioBorde,
    borderStyle: 'dashed',
    paddingVertical: 13,
    borderRadius: radios.sm,
    gap: 6,
  },
  botonSecundarioTexto: {
    color: colores.primarioTexto,
    fontSize: 14,
    fontWeight: '700',
  },
  previewFotoContenedor: {
    alignItems: 'center',
    marginTop: 2,
  },
  previewFoto: {
    width: '100%',
    height: 180,
    borderRadius: radios.md,
  },
  eliminarFotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  eliminarFotoTexto: {
    color: colores.peligro,
    fontSize: 13,
    fontWeight: '600',
  },
  infoUbicacionActiva: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.exitoSuave,
    padding: 12,
    borderRadius: radios.sm,
    gap: 8,
  },
  textoUbicacionActiva: {
    fontSize: 13,
    color: colores.exitoTexto,
    fontWeight: '600',
    flex: 1,
  },
  cambiarLink: {
    fontSize: 13,
    color: colores.primarioTexto,
    fontWeight: '700',
  },
  botonGuardar: {
    backgroundColor: colores.primario,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: radios.md,
    marginTop: 14,
    gap: 8,
    ...sombras.fuerte,
  },
  botonGuardarTexto: {
    color: colores.blanco,
    fontSize: 16,
    fontWeight: '700',
  },
});
