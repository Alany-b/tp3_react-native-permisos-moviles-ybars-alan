# Mantenimiento IPF — Sistema de Reportes Edilicios
## Trabajo Práctico N° 3 — Permisos móviles: Android, iOS y Expo
**Tecnicatura Superior en Desarrollo de Software Multiplataforma · Instituto Politécnico Formosa**  
**Taller Complementario – React Native II**

---

## 1. Descripción del Proyecto

**Mantenimiento IPF** es una aplicación móvil desarrollada con **React Native**, **Expo SDK 52+** y **Expo Router**, diseñada para que la comunidad educativa (docentes y alumnos) reporte desperfectos edilicios del instituto (problemas eléctricos, pérdidas de agua, roturas de mobiliario o fallas en proyectores/equipos) y reciba notificaciones en tiempo real cuando sean solucionados.

La arquitectura de la aplicación está construida sobre las mejores prácticas de permisos móviles:
- **Mínimo privilegio:** No se solicitan permisos innecesarios ni intrusivos.
- **Solicitud en contexto:** Ningún permiso se pide al abrir la aplicación; se solicitan únicamente cuando el usuario presiona la acción correspondiente.
- **La app nunca se bloquea:** Para cada función existe un camino alternativo funcional si el permiso es denegado o bloqueado.
- **No insistir:** Si la persona deniega un permiso, la pantalla previa no vuelve a aparecer sola; solo cuando el usuario vuelve a tocar la función.
- **Sincronización reactiva:** El panel de permisos y la app se actualizan automáticamente al regresar desde los Ajustes del sistema utilizando `AppState`.

---

## 2. Árbol de Carpetas (`src/app`)

El enrutamiento de la aplicación utiliza **Expo Router (File-based Routing)** respetando de forma estricta las URLs requeridas por la consigna:

```text
src/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Layout de pestañas inferiores (Tabs)
│   │   ├── index.tsx             # URL: / -> Tab "Reportes" (Inicio: lista y botón "Nuevo reporte")
│   │   ├── avisos.tsx            # URL: /avisos -> Tab "Avisos" (Bandeja interna de avisos)
│   │   └── permisos.tsx          # URL: /permisos -> Tab "Permisos" (Panel con estados y matices)
│   ├── reporte/
│   │   ├── nuevo.tsx             # URL: /reporte/nuevo -> Formulario sin permisos al inicio
│   │   ├── escanear.tsx          # URL: /reporte/escanear -> Escáner QR de aula (4 estados)
│   │   ├── foto.tsx              # URL: /reporte/foto -> Sacar foto (cámara) o PhotoPicker (sin permiso)
│   │   ├── ubicacion.tsx         # URL: /reporte/ubicacion -> GPS primer plano o sector manual
│   │   └── [id].tsx              # URL: /reporte/[id] -> Detalle de reporte y botón "Simular resolución"
│   ├── permisos/
│   │   └── [recurso].tsx         # URL: /permisos/[recurso] -> Pantalla previa modal (presentation: "modal")
│   ├── ajustes-app.tsx           # URL: /ajustes-app -> Switch de notificaciones en contexto
│   └── _layout.tsx               # Root Stack Layout con registro de rutas y modales
├── hooks/
│   ├── usePermiso.ts             # Hook unificado con los 4 estados, matiz parcial y AppState
│   └── useRevisarAlVolver.ts     # Hook detector de cambio de AppState (background -> active)
├── lib/
│   ├── store.ts                  # Store reactivo en memoria para reportes, avisos y borrador
│   └── notificaciones.ts         # Canal Android 'reportes' y programación local a 10s
└── components/                   # Componentes visuales reutilizables
```

---

## 3. Configuración de `app.json` comentada

El archivo `app.json` implementa el principio de **mínimo privilegio**, declara textos de propósito que siguen la regla *"Usamos tu [dato] para [beneficio concreto]"* y bloquea permisos residuales:

```json
{
  "expo": {
    "name": "Mantenimiento IPF",
    "slug": "mantenimiento-ipf",
    "version": "1.0.0",
    "scheme": "mantenimiento-ipf",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ipf.mantenimiento",
      "infoPlist": {
        // Texto de propósito en iOS: claro, transparente y con beneficio concreto
        "NSCameraUsageDescription": "Usamos tu cámara para escanear el código QR del aula y registrar fotos de los desperfectos.",
        "NSLocationWhenInUseUsageDescription": "Usamos tu ubicación para sugerirte automáticamente el sector del edificio donde reportás un desperfecto."
      }
    },
    "android": {
      "package": "com.ipf.mantenimiento",
      // Permisos estrictamente necesarios declarados para Android
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.POST_NOTIFICATIONS"
      ],
      // tools:node="remove" -> Excluye permisos innecesarios inyectados por dependencias nativas
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",        // expo-camera soporta video, pero nuestra app solo toma fotos y lee QRs
        "android.permission.SYSTEM_ALERT_WINDOW"  // La app no requiere dibujar ventanas flotantes sobre otras apps
      ]
    },
    "plugins": [
      "expo-router",
      [
        "expo-camera",
        {
          // Textos de propósito y desactivación de micrófono para la cámara
          "cameraPermission": "Usamos tu cámara para escanear el código QR del aula y registrar fotos de los desperfectos.",
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-location",
        {
          // Solo ubicación en primer plano ("al usar la app")
          "locationWhenInUsePermission": "Usamos tu ubicación para sugerirte automáticamente el sector del edificio donde reportás un desperfecto."
        }
      ],
      [
        "expo-image-picker",
        {
          // photosPermission en false: delegamos la selección al Photo Picker del sistema sin pedir permisos de galería
          "photosPermission": false
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#004085"
        }
      ]
    ]
  }
}
```

### Justificación de permisos en `blockedPermissions`:
1. **`android.permission.RECORD_AUDIO`:** La librería `expo-camera` incluye soporte de audio para grabación de video. Como nuestra app solo lee códigos QR y captura fotos de desperfectos, pedir el micrófono violaría el principio de mínimo privilegio y generaría sospechas infundadas.
2. **`android.permission.SYSTEM_ALERT_WINDOW`:** Algunas dependencias de depuración o notificaciones intentan incluir alertas flotantes tipo "burbuja". La app no requiere superponerse a otras aplicaciones, por lo que se elimina para prevenir vulnerabilidades de seguridad y rechazos en Google Play.

---

## 4. Tabla de Permisos del Sistema

| Recurso | Módulo de Expo | ¿Cuándo se pide? | Alternativa si se deniega |
| :--- | :--- | :--- | :--- |
| **Cámara (QR)** | `expo-camera` | Al tocar el botón "Escanear" en el campo Aula de `/reporte/nuevo`. | Escribir el código o nombre del aula a mano en el campo de texto. |
| **Cámara (Foto)** | `expo-camera` / `expo-image-picker` | Al tocar la opción "Sacar foto en el momento" dentro de `/reporte/foto`. | Elegir una foto existente utilizando el selector del sistema (sin permiso). |
| **Fotos / Galería** | `expo-image-picker` | **No se pide nunca.** Se utiliza `launchImageLibraryAsync` que abre el Photo Picker del SO. | N/A (el usuario elige individualmente el archivo). |
| **Ubicación** | `expo-location` | Al tocar "Detectar Ubicación Actual" en `/reporte/ubicacion`. | Seleccionar el sector edilicio manualmente de una lista o escribirlo a mano. |
| **Notificaciones** | `expo-notifications` | Al encender voluntariamente el interruptor en `/ajustes-app`. | Los avisos se guardan en la bandeja interna accesible en la pestaña `/avisos`. |

---

## 5. Respuestas para la Defensa Oral (G6)

### 1. Mostrá el código que decide entre “Continuar” y “Abrir Ajustes”. ¿Qué campo de la respuesta lo decide?
El código se encuentra en [`src/hooks/usePermiso.ts`](file:///c:/Users/milag/Downloads/react%20native%20tp/src/hooks/usePermiso.ts#L48-L76) y en la pantalla modal [`src/app/permisos/[recurso].tsx`](file:///c:/Users/milag/Downloads/react%20native%20tp/src/app/permisos/%5Brecurso%5D.tsx#L80-L105):

```tsx
// usePermiso.ts
if (resp.status === 'granted') {
  setEstado('concedido');
} else if (resp.status === 'undetermined') {
  setEstado('preguntable');
} else if (resp.canAskAgain) {
  setEstado('preguntable'); // Se puede mostrar diálogo del sistema
} else {
  setEstado('bloqueado');   // Diálogo agotado en el SO; requiere abrir Ajustes
}
```

```tsx
// permisos/[recurso].tsx
{estado === 'bloqueado' ? (
  <TouchableOpacity onPress={abrirAjustes}>
    <Text>Abrir Ajustes</Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity onPress={manejarContinuar}>
    <Text>Continuar</Text>
  </TouchableOpacity>
)}
```
**¿Qué campo lo decide?**  
Lo decide el campo booleano **`canAskAgain`** del objeto de respuesta (`PermissionResponse`). Si `canAskAgain === true`, el botón dice **"Continuar"** porque el sistema operativo todavía permite mostrar el diálogo nativo. Si `canAskAgain === false`, el diálogo del sistema está bloqueado y el botón pasa a ser **"Abrir Ajustes"** (`Linking.openSettings()`).

---

### 2. Revocá la cámara desde Ajustes con la app abierta y volvé. ¿Qué hace Android con la app? ¿Cómo se entera tu código del cambio?
1. **Qué hace Android con la app:**  
   Por motivos de seguridad e integridad de la memoria, cuando el usuario revoca un permiso desde Ajustes mientras la app se encuentra abierta o en segundo plano, Android **mata de inmediato el proceso de la aplicación (`process kill`)**. Al regresar a la app, la actividad se reinicia completamente desde cero.
2. **Cómo se entera nuestro código del cambio:**  
   En nuestro código implementamos el hook [`useRevisarAlVolver.ts`](file:///c:/Users/milag/Downloads/react%20native%20tp/src/hooks/useRevisarAlVolver.ts), que se suscribe al evento `AppState.addEventListener('change', ...)`. Cuando la app pasa de segundo plano/inactivo a primer plano (`active`), se ejecuta automáticamente la función `revisar()`, consultando a la API nativa y actualizando el estado de la UI en tiempo real.

---

### 3. ¿Por qué tu app no pide permiso para elegir una foto, pero sí para sacarla?
- **Para elegir una foto:** Porque la app utiliza el **Photo Picker del sistema operativo** (`ImagePicker.launchImageLibraryAsync`). Esta interfaz es un proceso del propio sistema operativo donde el usuario selecciona manualmente la foto. El SO le devuelve a la app únicamente el URI de esa imagen seleccionada, por lo que **no se requiere permiso `READ_MEDIA_IMAGES` ni acceso a la biblioteca completa**. Cumple con el lema: *"El mejor permiso es el que no se pide"*.
- **Para sacarla:** Porque tomar una foto requiere controlar directamente el sensor físico de hardware de la cámara (`CameraView` o `launchCameraAsync`), lo cual exige la autorización formal del usuario mediante el permiso de tiempo de ejecución `android.permission.CAMERA` o `NSCameraUsageDescription`.

---

### 4. ¿Qué cambia en la app si la persona elige ubicación aproximada? ¿Y si la deniega?
- **Si elige ubicación aproximada:**  
  El hook `usePermiso` detecta `resp.android.accuracy === 'coarse'` (Android) o `resp.accuracy === 'reduced'` (iOS) y marca `parcial: true`. La pantalla de ubicación no muestra coordenadas GPS milimétricas, sino la leyenda *"Ubicación aproximada del campus detectada"*, guardando el reporte con esa aproximación sin interrumpir el flujo.
- **Si la deniega:**  
  La app no se bloquea. Se activa inmediatamente el **camino alternativo**: se presenta una lista de sectores del instituto predefinidos (Patio Central, Estacionamiento, Pasillo PB, Biblioteca, etc.) o un campo de texto para que el usuario escriba el sector a mano.

---

### 5. ¿Por qué tus textos de propósito no aparecían en Expo Go?
Porque **Expo Go** es un binario genérico ya precompilado y firmado por el equipo de Expo con su propio `Info.plist` fijo. Los textos de propósito configurados en `app.json` (`NSCameraUsageDescription`, etc.) solo se incorporan al archivo nativo `Info.plist` cuando se ejecuta `npx expo prebuild` y se compila una Development Build o build de producción propia.

---

### 6. Si mañana agregás la nota de voz, ¿alcanza con publicar una actualización OTA? ¿Por qué?
**NO alcanza.**  
Las actualizaciones OTA (Over-The-Air) solo pueden actualizar el bundle de código JavaScript y assets estáticos. Grabar una nota de voz requiere declarar un nuevo permiso nativo en el manifiesto (`RECORD_AUDIO` en Android y `NSMicrophoneUsageDescription` en `Info.plist` de iOS). Al requerir cambios en los archivos nativos empaquetados en el binario del instalador (APK/AAB o IPA), es **obligatorio generar una nueva compilación nativa y enviarla a las tiendas**.

---

## 6. Desafíos Opcionales Implementados (G4)

1. **Notificaciones provisionales en iOS:**  
   En `src/hooks/usePermiso.ts` se configura `allowProvisional: true` para iOS. En `/permisos` se detecta y muestra el matiz *"Notificaciones provisionales (silenciosas)"* cuando el usuario autorizó este modo.
2. **Bloqueo por plataforma:**  
   En la pantalla modal `/permisos/[recurso]`, cuando el estado es `bloqueado`, se renderizan las instrucciones exactas diferenciadas por sistema operativo (`Platform.OS`):
   - **Android:** *Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Habilitar...*
   - **iOS:** *Configuración > Mantenimiento IPF > Activar el interruptor...*
3. **Auditoría de Manifiesto (`npx expo prebuild --clean`):**  
   - `android.permission.INTERNET` (Expo base - Normal)
   - `android.permission.CAMERA` (expo-camera - Runtime)
   - `android.permission.ACCESS_COARSE_LOCATION` y `ACCESS_FINE_LOCATION` (expo-location - Runtime)
   - `android.permission.POST_NOTIFICATIONS` (expo-notifications - Runtime)
   - `android.permission.RECORD_AUDIO` -> **Eliminado** mediante `blockedPermissions` y `recordAudioAndroid: false`.
   - `android.permission.SYSTEM_ALERT_WINDOW` -> **Eliminado** mediante `blockedPermissions`.

---

## 7. Instrucciones para Ejecutar y Probar el Proyecto

### Dependencias requeridas
Asegurate de contar con Node.js v18+ o v22+.

1. **Instalar dependencias del proyecto:**
   ```bash
   npm install
   ```

2. **Iniciar la aplicación con Expo:**
   ```bash
   npx expo start
   ```

3. **Ejecutar en Android o iOS (Development Build):**
   ```bash
   # Generar carpetas nativas
   npx expo prebuild --clean

   # Compilar en Android
   npx expo run:android

   # Compilar en iOS
   npx expo run:ios
   ```

4. **Comprobación de Tipos TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

---

## 8. Sección de Capturas para la Entrega (G5)

A continuación se indican los espacios para adjuntar las capturas requeridas en la entrega final:

1. **Escáner en sus 4 estados:**
   - *Cargando:* Indicador de actividad inicial.
   - *Concedido:* Visor de cámara en vivo con visor de QR.
   - *Preguntable:* Pantalla previa con botón "Continuar".
   - *Bloqueado:* Aviso de bloqueo con botón "Abrir Ajustes" y opción manual.
2. **Ubicación concedida y denegada:**
   - *Concedida:* Ubicación precisa con coordenadas o aproximada del campus.
   - *Denegada:* Selección de sector a mano (Patio, Pasillo, etc.).
3. **Foto desde el selector:**
   - Selector del sistema (Photo Picker) sin solicitud de permisos de galería.
4. **Notificación recibida y Bandeja de Avisos:**
   - Alerta a los 10s tras presionar "Simular resolución" (con notificaciones activas).
   - Aviso añadido en `/avisos` (si las notificaciones estaban denegadas).
5. **Panel de Permisos:**
   - Estado antes y después de volver de los Ajustes del dispositivo.
