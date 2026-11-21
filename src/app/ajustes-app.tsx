import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../lib/store';
import { usePermiso } from '../hooks/usePermiso';
import { configurarCanalReportesAndroid } from '../lib/notificaciones';
import { colores, radios, sombras } from '../theme';

export default function PantallaAjustesApp() {
  const [activado, setActivado] = useState<boolean>(store.getAvisarResolucion());
  const { estado, pedir, abrirAjustes, revisar } = usePermiso('notifications');

  useEffect(() => {
    setActivado(store.getAvisarResolucion());
  }, []);

  const toggleSwitch = async (nuevoValor: boolean) => {
    if (nuevoValor) {
      // Requisito 5: En Android crear el canal "reportes" antes de pedir
      await configurarCanalReportesAndroid();

      if (estado === 'bloqueado') {
        Alert.alert(
          'Permiso Bloqueado',
          'Las notificaciones fueron bloqueadas en el sistema. Habilitalas desde los Ajustes del dispositivo para activar este aviso.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Ajustes', onPress: abrirAjustes },
          ]
        );
        setActivado(false);
        store.setAvisarResolucion(false);
        return;
      }

      if (estado !== 'concedido') {
        const resultado = await pedir();
        if (resultado === 'concedido') {
          setActivado(true);
          store.setAvisarResolucion(true);
        } else {
          setActivado(false);
          store.setAvisarResolucion(false);
          Alert.alert(
            'Permiso no concedido',
            'No se activaron los avisos del sistema. Si resolvés un reporte, el aviso quedará en tu bandeja de /avisos.'
          );
        }
      } else {
        setActivado(true);
        store.setAvisarResolucion(true);
      }
    } else {
      setActivado(false);
      store.setAvisarResolucion(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>Notificaciones y Alertas</Text>
        <Text style={styles.seccionSubtitulo}>
          Configurá cómo querés recibir novedades sobre tus reportes edilicios.
        </Text>
      </View>

      <View style={styles.cardAjuste}>
        <View style={styles.iconoCirculo}>
          <Ionicons name="notifications-outline" size={24} color={colores.primario} />
        </View>
        <View style={styles.infoContenedor}>
          <Text style={styles.ajusteTitulo}>Avisarme cuando se resuelva mi reporte</Text>
          <Text style={styles.ajusteDescripcion}>
            Recibirás una notificación en tu dispositivo cuando la cuadrilla solucione el desperfecto.
          </Text>
        </View>
        <Switch
          value={activado}
          onValueChange={toggleSwitch}
          trackColor={{ false: colores.bordeInput, true: colores.primarioBorde }}
          thumbColor={activado ? colores.primario : colores.superficie}
          ios_backgroundColor={colores.bordeInput}
        />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colores.primario} />
        <Text style={styles.infoBoxTexto}>
          <Text style={{ fontWeight: '700' }}>Solicitud en contexto:</Text> La aplicación no solicita permisos de notificación al instalarse ni al abrirse. El permiso solo se pide al activar este interruptor voluntariamente.
        </Text>
      </View>

      {estado === 'bloqueado' && (
        <TouchableOpacity style={styles.alertaBloqueo} activeOpacity={0.85} onPress={abrirAjustes}>
          <Ionicons name="warning-outline" size={22} color={colores.peligroTexto} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertaBloqueoTitulo}>Notificaciones bloqueadas</Text>
            <Text style={styles.alertaBloqueoTexto}>
              Tocá aquí para ir a los Ajustes del sistema y habilitarlas.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.peligroTexto} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 20,
  },
  seccionHeader: {
    marginBottom: 20,
  },
  seccionTitulo: {
    fontSize: 24,
    fontWeight: '800',
    color: colores.texto,
    letterSpacing: -0.4,
  },
  seccionSubtitulo: {
    fontSize: 14,
    color: colores.textoSuave,
    marginTop: 6,
    lineHeight: 20,
  },
  cardAjuste: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    padding: 18,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 16,
    ...sombras.suave,
  },
  iconoCirculo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colores.primarioSuave,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContenedor: {
    flex: 1,
    marginRight: 10,
  },
  ajusteTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 4,
  },
  ajusteDescripcion: {
    fontSize: 12.5,
    color: colores.textoSuave,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colores.primarioSuave,
    borderWidth: 1,
    borderColor: colores.primarioBorde,
    borderRadius: radios.md,
    padding: 14,
    gap: 12,
    alignItems: 'center',
  },
  infoBoxTexto: {
    flex: 1,
    fontSize: 12.5,
    color: colores.primarioTexto,
    lineHeight: 18,
  },
  alertaBloqueo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.peligroSuave,
    borderRadius: radios.md,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colores.peligroBorde,
    gap: 12,
  },
  alertaBloqueoTitulo: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colores.peligroTexto,
  },
  alertaBloqueoTexto: {
    fontSize: 12,
    color: colores.peligroTexto,
    marginTop: 2,
  },
});
