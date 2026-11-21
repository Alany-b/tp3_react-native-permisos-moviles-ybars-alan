import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { store, Reporte } from '../../lib/store';
import { colores, radios, sombras, estadoReporte } from '../../theme';

export default function PantallaInicio() {
  const router = useRouter();
  const [reportes, setReportes] = useState<Reporte[]>(store.getReportes());

  useEffect(() => {
    const desuscribir = store.suscribir(() => {
      setReportes(store.getReportes());
    });
    return desuscribir;
  }, []);

  const categoriaIcon = (cat: string) => {
    switch (cat) {
      case 'electricidad':
        return 'flash-outline';
      case 'agua':
        return 'water-outline';
      case 'mobiliario':
        return 'cube-outline';
      case 'equipos':
        return 'desktop-outline';
      default:
        return 'construct-outline';
    }
  };

  const renderItem = ({ item }: { item: Reporte }) => {
    const estiloBadge = estadoReporte[item.estado];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/reporte/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoriaContenedor}>
            <View style={styles.categoriaIcono}>
              <Ionicons
                name={categoriaIcon(item.categoria) as any}
                size={15}
                color={colores.primario}
              />
            </View>
            <Text style={styles.categoriaTexto}>{item.categoria.toUpperCase()}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: estiloBadge.bg, borderColor: estiloBadge.border },
            ]}
          >
            <Text style={[styles.badgeTexto, { color: estiloBadge.text }]}>
              {item.estado.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitulo}>{item.titulo}</Text>
        <Text style={styles.cardDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color={colores.textoSuave} />
            <Text style={styles.infoTexto}>{item.aula}</Text>
          </View>
          <Text style={styles.fechaTexto}>{item.fechaCreacion}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={reportes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerInfo}>
            <Text style={styles.saludo}>Reportes del Edificio</Text>
            <Text style={styles.subsaludo}>
              Reportá desperfectos edilicios y seguí el estado de reparación en tiempo real.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <View style={styles.vacioIcono}>
              <Ionicons name="folder-open-outline" size={36} color={colores.primario} />
            </View>
            <Text style={styles.vacioTexto}>No hay reportes cargados aún.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.botonFlotante}
        activeOpacity={0.9}
        onPress={() => router.push('/reporte/nuevo')}
      >
        <Ionicons name="add" size={24} color={colores.blanco} />
        <Text style={styles.botonFlotanteTexto}>Nuevo Reporte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  lista: {
    padding: 20,
    paddingBottom: 100,
  },
  headerInfo: {
    marginBottom: 20,
  },
  saludo: {
    fontSize: 26,
    fontWeight: '800',
    color: colores.texto,
    letterSpacing: -0.5,
  },
  subsaludo: {
    fontSize: 14,
    color: colores.textoSuave,
    marginTop: 6,
    lineHeight: 20,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriaContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoriaIcono: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriaTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: colores.primarioTexto,
    letterSpacing: 0.8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radios.pildora,
    borderWidth: 1,
  },
  badgeTexto: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cardTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 6,
  },
  cardDescripcion: {
    fontSize: 14,
    color: colores.textoSecundario,
    lineHeight: 21,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colores.divisor,
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  infoTexto: {
    fontSize: 13,
    color: colores.textoSuave,
    fontWeight: '500',
  },
  fechaTexto: {
    fontSize: 12,
    color: colores.textoTenue,
  },
  vacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  vacioIcono: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacioTexto: {
    marginTop: 14,
    fontSize: 15,
    color: colores.textoSuave,
  },
  botonFlotante: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: colores.primario,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: radios.pildora,
    gap: 6,
    ...sombras.fuerte,
  },
  botonFlotanteTexto: {
    color: colores.blanco,
    fontSize: 15,
    fontWeight: '700',
  },
});
