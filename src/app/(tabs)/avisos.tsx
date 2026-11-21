import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { store, Aviso } from '../../lib/store';
import { colores, radios, sombras } from '../../theme';

export default function PantallaAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>(store.getAvisos());

  useEffect(() => {
    const desuscribir = store.suscribir(() => {
      setAvisos(store.getAvisos());
    });
    return desuscribir;
  }, []);

  const marcarTodosLeidos = () => {
    store.marcarAvisosLeidos();
  };

  const renderAviso = ({ item }: { item: Aviso }) => (
    <View style={[styles.avisoCard, !item.leido && styles.avisoNoLeido]}>
      <View style={styles.avisoHeader}>
        <View style={styles.avisoTituloRow}>
          {!item.leido && <View style={styles.puntoAcento} />}
          <Text style={[styles.avisoTitulo, !item.leido && styles.textoNegrita]}>
            {item.titulo}
          </Text>
        </View>
        <Text style={styles.avisoFecha}>{item.fecha}</Text>
      </View>
      <Text style={styles.avisoMensaje}>{item.mensaje}</Text>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      {/* Banner de alternativa resiliente */}
      <View style={styles.bannerExplicativo}>
        <Ionicons name="information-circle" size={22} color={colores.primario} />
        <Text style={styles.bannerTexto}>
          Esta bandeja interna funciona como alternativa resiliente: si las notificaciones del sistema están desactivadas, todos tus avisos quedan registrados aquí.
        </Text>
      </View>

      <View style={styles.barraAcciones}>
        <Text style={styles.conteoAvisos}>
          {avisos.length} {avisos.length === 1 ? 'aviso registrado' : 'avisos registrados'}
        </Text>
        {avisos.some((a) => !a.leido) && (
          <TouchableOpacity style={styles.botonLeidosContenedor} onPress={marcarTodosLeidos}>
            <Text style={styles.botonLeidos}>Marcar todos leídos</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={avisos}
        keyExtractor={(item) => item.id}
        renderItem={renderAviso}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <View style={styles.vacioIcono}>
              <Ionicons name="mail-unread-outline" size={34} color={colores.primario} />
            </View>
            <Text style={styles.vacioTexto}>No tenés avisos pendientes.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 20,
  },
  bannerExplicativo: {
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
    fontSize: 13,
    color: colores.primarioTexto,
    lineHeight: 19,
  },
  barraAcciones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  conteoAvisos: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.textoSecundario,
  },
  botonLeidosContenedor: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radios.pildora,
    backgroundColor: colores.primarioSuave,
  },
  botonLeidos: {
    fontSize: 12.5,
    color: colores.primarioTexto,
    fontWeight: '700',
  },
  lista: {
    paddingBottom: 20,
  },
  avisoCard: {
    backgroundColor: colores.superficie,
    borderRadius: radios.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombras.suave,
  },
  avisoNoLeido: {
    borderColor: colores.primarioBorde,
    backgroundColor: colores.noLeido,
  },
  avisoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avisoTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  puntoAcento: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colores.primario,
    marginRight: 8,
  },
  avisoTitulo: {
    fontSize: 15,
    color: colores.texto,
    flexShrink: 1,
  },
  textoNegrita: {
    fontWeight: '700',
  },
  avisoFecha: {
    fontSize: 11,
    color: colores.textoTenue,
  },
  avisoMensaje: {
    fontSize: 13.5,
    color: colores.textoSecundario,
    lineHeight: 20,
  },
  vacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    fontSize: 14,
    color: colores.textoSuave,
  },
});
