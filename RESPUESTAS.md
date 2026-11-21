# Trabajo Práctico N° 3 — Permisos móviles: Android, iOS y Expo
## Taller Complementario – React Native II
**Instituto Politécnico Formosa · Tecnicatura Superior en Desarrollo de Software Multiplataforma**

---

# RESPUESTAS TEÓRICAS Y EJERCICIOS (Partes A a F)

---

## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

#### a) ¿Qué es un permiso? ¿Qué papel cumplen la app, el sistema operativo y la persona usuaria?
Un **permiso** es una autorización formal otorgada a una aplicación para acceder a datos sensibles (como la ubicación física, contactos o fotos) o a componentes de hardware restringidos (como la cámara, el micrófono o el Bluetooth), los cuales están protegidos por el sistema operativo.

Los tres actores cumplen roles claramente delimitados:
1. **La Aplicación (App):** Actúa como la entidad solicitante y consumidora. Su rol es declarar anticipadamente qué recursos requiere para funcionar, justificar ante el usuario la necesidad de dichos recursos en el momento pertinente y solicitar la autorización mediante las APIs oficiales, adaptándose con caminos alternativos si el acceso es denegado.
2. **El Sistema Operativo (SO - Android / iOS):** Actúa como el guardián y árbitro de seguridad (*gatekeeper*). Su rol es aislar a la aplicación, renderizar los diálogos nativos del sistema de manera inviolable, registrar la decisión tomada y cortar de forma estricta cualquier intento de la app de acceder a APIs protegidas sin la debida concesión.
3. **La Persona Usuaria:** Actúa como la propietaria y decisora final. Su rol es evaluar la legitimidad y el valor que la app le ofrece a cambio de sus datos personales o acceso al hardware, teniendo el control soberano de conceder, limitar o revocar los permisos en cualquier momento desde los Ajustes del dispositivo.

#### b) ¿Qué es la caja de arena (sandbox) y qué relación tiene con los permisos? ¿Qué puede hacer una app sin ningún permiso?
El **Sandbox** (caja de arena) es el mecanismo de seguridad fundamental de los sistemas operativos móviles modernos donde cada aplicación se ejecuta en un proceso aislado con un identificador de usuario único (UID en Linux/Android) y un espacio de almacenamiento privado e inaccesible para otras apps. 

**Relación con los permisos:** El sandbox encierra a la app de forma hermética. Los permisos son precisamente las "puertas" controladas a través de las cuales el sistema operativo le permite a la app salir de los límites de su sandbox para interactuar con hardware del dispositivo o con almacenes de datos compartidos del sistema.

**¿Qué puede hacer una app sin ningún permiso?**
Una app sin ningún permiso puede realizar una gran cantidad de operaciones fundamentales:
- Renderizar interfaces de usuario, animaciones y procesar lógica de negocio en memoria.
- Leer y escribir archivos en su propio directorio privado interno (`FileSystem.documentDirectory` / `cacheDirectory`).
- Almacenar pares clave-valor en almacenamiento local persistente (`AsyncStorage`).
- En Android, acceder a Internet (ya que `INTERNET` es un permiso normal que se concede automáticamente sin intervención del usuario).
- Abrir selectores provistos por el sistema operativo mediante contratos de actividad (como el Photo Picker nativo del SO para seleccionar imágenes sin acceder a la galería completa).
- Reproducir sonidos incluidos en el paquete de la aplicación (assets locales).
- Interactuar con sensores básicos de movimiento y orientación (acelerómetro, giroscopio).

#### c) Nombrá las cuatro razones por las que existen los permisos y dá un ejemplo concreto de cada una.
1. **Privacidad de datos personales:** Proteger la información íntima o sensible del individuo frente al espionaje o recolección indiscriminada.  
   *Ejemplo:* Acceso a la agenda de contactos personales (`READ_CONTACTS`) para evitar que una app envíe la libreta telefónica a servidores publicitarios.
2. **Seguridad e integridad del dispositivo y del sistema:** Evitar que una aplicación interfiera con otras apps, intercepte comunicaciones o tome el control no autorizado del dispositivo.  
   *Ejemplo:* Superponer ventanas sobre otras aplicaciones (`SYSTEM_ALERT_WINDOW`), lo cual podría utilizarse para ataques de *tapjacking* o robo de credenciales.
3. **Consumo de recursos y costos económicos/energéticos:** Proteger la batería, el plan de datos móviles y evitar cobros no deseados en la factura del usuario.  
   *Ejemplo:* El uso de la antena GPS en segundo plano (`ACCESS_BACKGROUND_LOCATION`), que agota severamente la batería si se ejecuta de forma continua, o el envío de SMS premium.
4. **Control, consentimiento y confianza del usuario:** Garantizar que el usuario sepa en todo momento qué capacidades se están utilizando en su dispositivo y conserve la facultad de decidir.  
   *Ejemplo:* Los indicadores de cámara y micrófono encendidos (punto verde/naranja en la barra de estado de iOS y Android) junto a la opción de otorgar acceso a la cámara "Solo esta vez".

#### d) En la analogía del portero del edificio, ¿quién es la visita, quién el portero y quién el dueño del departamento? ¿Qué significa que “el portero se acuerda de la respuesta”?
- **La Visita:** La aplicación (app) que toca timbre solicitando entrar a un recurso sensible.
- **El Portero:** El Sistema Operativo (Android o iOS) que intermedia en la entrada, detiene a la visita en la puerta y le consulta al dueño.
- **El Dueño del departamento:** La persona usuaria, quien decide si autoriza o rechaza el ingreso.

**¿Qué significa que “el portero se acuerda de la respuesta”?**  
Significa que el sistema operativo almacena de manera persistente la decisión del usuario en su base de datos interna de permisos. Si el usuario ya rechazó la solicitud (o eligió "No volver a preguntar" / "Don't allow"), el sistema operativo "recuerda" esa negativa y en las siguientes ocasiones directamente deniega la petición de la app en silencio sin volver a consultar al usuario (sin mostrar el diálogo en pantalla).

---

### A2. Declarar y solicitar

| Cuestión | Declarar (al compilar) | Solicitar (al ejecutar) |
| :--- | :--- | :--- |
| **¿Qué se hace?** | Se le avisa formalmente al sistema operativo y a las tiendas de aplicaciones qué recursos sensibles tiene previsto utilizar el binario de la app. | Se le presenta al usuario en tiempo de ejecución el diálogo nativo del sistema para que autorice el acceso específico al recurso en ese instante. |
| **¿Dónde / cómo en Android?** | Se incluye la etiqueta `<uses-permission android:name="..." />` dentro del archivo `AndroidManifest.xml`. | Se invoca la API nativa de Android `ActivityCompat.requestPermissions()` o `ActivityResultLauncher`. |
| **¿Dónde / cómo en iOS?** | Se agrega la clave de descripción de uso (ej. `NSCameraUsageDescription`) con su texto explicativo dentro del archivo `Info.plist`. | Se invoca el método nativo del framework correspondiente (ej. `AVCaptureDevice.requestAccess(for: .video)`). |
| **¿Dónde / cómo en Expo?** | En `app.json` (o `app.config.ts`) mediante el arreglo `plugins` de cada librería o en propiedades específicas como `expo.android.permissions` e `expo.ios.infoPlist`. | En el código TypeScript/JavaScript usando funciones o hooks asíncronos del módulo (ej. `Camera.requestCameraPermissionsAsync()` o `useCameraPermissions()`). |
| **¿Qué pasa si se omite?** | En Android: el sistema rechaza la petición en runtime (no muestra diálogo o arroja `SecurityException`). En iOS: la app crashea al instante (`SIGABRT`) y Apple rechaza la subida a App Store Connect. | La app nunca obtiene acceso al recurso en tiempo de ejecución; las APIs devuelven un error o estado denegado y la funcionalidad queda inoperativa. |

---

### A3. Verdadero o falso

- **a) El diálogo de permiso lo dibuja tu app con componentes de React Native.**  
  **FALSO.** El diálogo de permiso es una ventana modal nativa del propio sistema operativo ejecutada por un proceso del sistema fuera del control de la aplicación. Ni React Native ni la app pueden modificar su diseño, botones o estilo visual.

- **b) En Expo, la fuente de verdad de los permisos es app.json (o app.config.ts), no el AndroidManifest.xml.**  
  **VERDADERO.** En el flujo administrado de Expo (*Managed Workflow*), los archivos nativos son generados automáticamente durante el prebuild a partir de `app.json` o `app.config.ts`. Si se modifica `AndroidManifest.xml` a mano, se sobrescribirá al regenerar el proyecto nativo.

- **c) Agregar un permiso nuevo en el Info.plist se puede publicar con una actualización OTA.**  
  **FALSO.** Las actualizaciones OTA (Over-The-Air, como Expo Updates) únicamente pueden actualizar el bundle de JavaScript y assets estáticos. El archivo `Info.plist` está empaquetado dentro del binario nativo compilado (`.ipa`), por lo que cualquier cambio en permisos requiere compilar una nueva versión nativa y enviarla a revisión a App Store Connect.

- **d) Si tu código pide un permiso que no está en el manifiesto, Android igual muestra el diálogo.**  
  **FALSO.** Android verifica primero si el permiso solicitado figura declarado en el `AndroidManifest.xml`. Si no está declarado, el sistema no muestra ningún diálogo, deniega la petición de inmediato devolviendo un resultado denegado o genera una excepción de seguridad.

- **e) El paquete expo-permissions es la forma recomendada de pedir permisos en SDK 57.**  
  **FALSO.** `expo-permissions` fue deprecado en el SDK 41 y eliminado por completo en versiones posteriores. A partir de Expo SDK 43+ y plenamente en SDK 52+, la forma oficial y recomendada es utilizar los hooks y métodos integrados directamente en cada módulo (`expo-camera`, `expo-location`, `expo-notifications`, etc.).

- **f) En iOS, las notificaciones no llevan texto de propósito en el Info.plist.**  
  **VERDADERO.** A diferencia de la cámara o la ubicación, las notificaciones locales o push en iOS no requieren una clave `UsageDescription` en `Info.plist`. Se gestionan directamente en tiempo de ejecución a través del framework nativo `UserNotifications` (`UNUserNotificationCenter`).

- **g) Con acceso limitado a fotos, status vale 'granted' y el matiz está en accessPrivileges.**  
  **VERDADERO.** En Expo, cuando el usuario en iOS selecciona "Seleccionar fotos..." (acceso limitado), `status` toma el valor `'granted'`, y la propiedad `accessPrivileges` dentro de la respuesta toma el valor `'limited'`.

- **h) Desinstalar y reinstalar la app es la forma confiable de volver a “sin decidir” en las dos plataformas.**  
  **VERDADERO.** Al desinstalar la app se eliminan su sandbox local y los registros de permisos persistidos en el sistema operativo, permitiendo que una nueva instalación empiece desde el estado inicial (`undetermined` / sin decidir).

---

### A4. Los estados de un permiso

#### a) Diagrama de estados en Android y en iOS y diferencia central

```text
ESTADOS EN ANDROID:
                   [ Sin decidir (undetermined) ]
                                 │
                        (Solicitud en app)
                                 ▼
                     [ Diálogo del Sistema ]
                     /                     \
        (Permitir / Una vez)         (No permitir - 1ra vez)
                   ▼                               ▼
             [ Concedido ]             [ Denegado preguntable ]
                                                   │
                                          (Solicitud en app)
                                                   ▼
                                       [ Diálogo del Sistema ]
                                       /                     \
                                  (Permitir)         (No permitir - 2da vez)
                                     ▼                         ▼
                               [ Concedido ]         [ Bloqueado permanentemente ]
                                                               │
                                                   (Solo recuperable vía Ajustes)

ESTADOS EN iOS:
                   [ Sin decidir (undetermined) ]
                                 │
                        (Solicitud en app)
                                 ▼
                     [ Diálogo del Sistema ]
                     /                     \
       (Permitir / Permitir una vez)    (No permitir - 1ra vez)
                   ▼                               ▼
             [ Concedido ]            [ Bloqueado permanentemente ]
                                                   │
                                       (Solo recuperable vía Ajustes)
```

**Diferencia central entre las dos plataformas:**  
La diferencia fundamental radica en la **tolerancia a rechazos**:
- En **iOS**, el diálogo nativo del sistema solo se puede mostrar **una única vez en toda la vida útil de la instalación**. Si el usuario presiona "No permitir", el permiso pasa instantáneamente al estado de bloqueo permanente; cualquier llamado futuro a la API no mostrará diálogo alguno y la única vía para concederlo será que el usuario vaya manualmente a la app de Ajustes de iOS.
- En **Android** (desde Android 11+), rige la regla de los **dos rechazos**: si el usuario rechaza el permiso por primera vez, el permiso queda en un estado denegado pero aún preguntable (`canAskAgain: true`), permitiendo a la app volver a mostrar el diálogo nativo una segunda vez. Recién tras un segundo rechazo explícito, Android lo considera bloqueado de forma permanente (`canAskAgain: false`).

#### b) Tabla de valores devueltos por Expo en cada estado

| Estado | status | canAskAgain | ¿Puede aparecer el diálogo? |
| :--- | :--- | :--- | :--- |
| **Sin decidir** | `'undetermined'` | `true` | **Sí** |
| **Concedido** | `'granted'` | `true` (o `false` s/plataforma) | **No** (ya está otorgado) |
| **Denegado (se puede volver a pedir)** | `'denied'` | `true` | **Sí** |
| **Bloqueado** | `'denied'` | `false` | **No** (requiere abrir Ajustes) |

---

## Parte B · Android: tipos de permisos y manifiesto

### B1. Clasificá los permisos

| Permiso | Tipo | ¿Cómo se obtiene? |
| :--- | :--- | :--- |
| `INTERNET` | De instalación (Normal) | Se concede automáticamente al momento de la instalación si está declarado en el `AndroidManifest.xml`. |
| `CAMERA` | Tiempo de ejecución (Dangerous / Peligroso) | Se declara en el manifiesto y se solicita en tiempo de ejecución al usuario mediante un diálogo interactivo del sistema. |
| `VIBRATE` | De instalación (Normal) | Se concede automáticamente al instalar la aplicación sin intervención del usuario. |
| `SYSTEM_ALERT_WINDOW` | Especial | Requiere declarar el permiso en el manifiesto y enviar al usuario mediante un Intent explícito a la pantalla de Ajustes del sistema (`Settings.ACTION_MANAGE_OVERLAY_PERMISSION`). |
| `POST_NOTIFICATIONS` | Tiempo de ejecución (Dangerous - Android 13+) | Se declara en el manifiesto y se pide en tiempo de ejecución al usuario mediante diálogo nativo. |
| `ACCESS_NETWORK_STATE` | De instalación (Normal) | Se concede automáticamente al instalar. |
| `READ_CONTACTS` | Tiempo de ejecución (Dangerous / Peligroso) | Se declara en el manifiesto y se pide interactivamente en tiempo de ejecución. |
| `SCHEDULE_EXACT_ALARM` | Especial (Android 12+) | Declarado en el manifiesto; en Android 13+ y 14+ requiere evaluación de Google Play y/o consentimiento explícito del usuario en Ajustes del sistema. |
| `RECORD_AUDIO` | Tiempo de ejecución (Dangerous / Peligroso) | Se declara en el manifiesto y se solicita en tiempo de ejecución mediante diálogo nativo. |
| `MANAGE_EXTERNAL_STORAGE` | Especial (All files access) | Requiere declarar en el manifiesto, dirigir al usuario a Ajustes con `ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION` y justificar rigurosamente ante Google Play. |

---

### B2. Grupos y nombres

#### a) ¿Qué es un grupo de permisos? Si la app pide ACCESS_FINE_LOCATION y ACCESS_COARSE_LOCATION juntos, ¿cuántos diálogos ve la persona?
Un **grupo de permisos** es una agrupación lógica que hace el sistema operativo de permisos individuales relacionados funcionalmente (por ejemplo, el grupo `LOCATION` o `CONTACTS`).  
Si la app solicita `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` simultáneamente, la persona ve **un único diálogo unificado**. En dicho diálogo (desde Android 12+), el sistema le permite al usuario elegir visualmente entre precisión "Precisa" (Fine) o "Aproximada" (Coarse).

#### b) ¿Qué prefijo lleva el nombre completo de un permiso? Escribí el nombre completo del permiso de cámara.
Lleva el prefijo estándar del paquete de Android: `android.permission.`  
Nombre completo del permiso de cámara: `android.permission.CAMERA`

#### c) ¿Qué son los permisos de firma (signature)? ¿Por qué no se usan en apps comunes?
Los permisos de firma (*Signature Permissions*) son permisos de máxima seguridad cuyo nivel de protección es `signature`. El sistema operativo únicamente los concede si la aplicación que solicita el permiso está firmada con el **mismo certificado criptográfico (clave privada)** que la aplicación que declaró el permiso o que la imagen del sistema operativo del dispositivo.  
**Por qué no se usan en apps comunes:** Porque los desarrolladores de terceros no poseen las claves privadas con las que los fabricantes (Samsung, Google, Xiaomi) firman el sistema operativo ni las claves de otras empresas, por lo que una app común jamás podrá obtenerlos salvo que forme parte del firmware del fabricante.

---

### B3. Leé el manifiesto

A partir del fragmento analizado:

#### a) ¿Qué permisos se conceden solos al instalar y cuáles hay que pedir además en tiempo de ejecución?
- **Se conceden solos al instalar (Permisos normales):**
  - `android.permission.INTERNET`
- **Hay que pedir además en tiempo de ejecución (Permisos peligrosos/runtime):**
  - `android.permission.CAMERA`
  - `android.permission.ACCESS_COARSE_LOCATION`
  - `android.permission.ACCESS_FINE_LOCATION`
  - `android.permission.POST_NOTIFICATIONS`
  - `android.permission.READ_EXTERNAL_STORAGE` (en dispositivos con Android 12 o inferior).

#### b) ¿Qué significa android:maxSdkVersion="32"? ¿Qué permisos reemplazan a READ_EXTERNAL_STORAGE desde Android 13?
`android:maxSdkVersion="32"` indica que dicho permiso solo se aplicará y solicitará en dispositivos que ejecuten como máximo la API 32 (Android 12L). En dispositivos con Android 13 (API 33) o superior, el sistema operativo ignora por completo este permiso para esta app.  
**Permisos que lo reemplazan desde Android 13 (API 33):**
- `android.permission.READ_MEDIA_IMAGES` (para fotos)
- `android.permission.READ_MEDIA_VIDEO` (para videos)
- `android.permission.READ_MEDIA_AUDIO` (para música y audios)

#### c) ¿Qué hace tools:node="remove"? Escribí el fragmento de app.json que lo genera.
`tools:node="remove"` le indica al *Manifest Merger* (la herramienta de Android que fusiona los manifiestos de las dependencias durante la compilación) que **elimine de forma forzada** ese permiso del `AndroidManifest.xml` final, incluso si alguna librería de terceros (como `expo-camera`) intentó declararlo.  
En Expo se genera utilizando la propiedad `blockedPermissions` dentro de `expo.android`:
```json
{
  "expo": {
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO"
      ]
    }
  }
}
```

#### d) Necesitás agregar SCHEDULE_EXACT_ALARM, que ninguna librería declara. ¿En qué propiedad de app.json va?
Va dentro del arreglo `permissions` bajo el objeto `android`:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.SCHEDULE_EXACT_ALARM"
      ]
    }
  }
}
```

#### e) ¿Por qué en Expo no conviene editar este archivo a mano? ¿Funciona blockedPermissions en Expo Go?
1. **No conviene editar a mano:** Porque en el flujo gestionado de Expo, el directorio `android/` es un artefacto de compilación generado dinámicamente mediante `npx expo prebuild`. Si se edita manualmente, en la próxima ejecución de `prebuild` (o en servicios como EAS Build) los cambios manuales se sobrescribirán y perderán. La configuración debe realizarse en `app.json` mediante plugins y propiedades de configuración.
2. **¿Funciona blockedPermissions en Expo Go?** **NO.** Expo Go es una aplicación nativa precompilada que ya tiene todos los permisos posibles incluidos en su propio `AndroidManifest.xml` para poder probar todas las APIs del SDK. `blockedPermissions` solo surte efecto al generar y compilar una Development Build o build de producción.

---

### B4. Así pregunta Android

#### a) ¿Se puede poner texto propio dentro del diálogo de Android? Entonces, ¿dónde tenés que explicar para qué usás el permiso?
**No**, el diálogo nativo de permisos de Android es renderizado por el sistema operativo y no admite ningún tipo de texto o mensaje personalizado por parte de la aplicación.  
**Dónde explicarlo:** Se debe explicar en una **pantalla previa (pre-permission screen o modal explicativo)** dentro de la propia interfaz de usuario de la app, justo antes de disparar el método nativo que abre el diálogo del sistema.

#### b) ¿Qué diferencia hay entre “Mientras la app está en uso” y “Solo esta vez”? ¿Para qué permisos existe esta última opción?
- **“Mientras la app está en uso” (While using the app):** Otorga el permiso de forma persistente mientras la aplicación se encuentre en primer plano; el permiso se conserva para futuras sesiones hasta que el usuario decida revocarlo manualmente en Ajustes.
- **“Solo esta vez” (Only this time / One-time permission):** Otorga un permiso temporal válido exclusivamente para la sesión actual. En cuanto el usuario sale de la app, el proceso se suspende o pasa un tiempo prudencial en segundo plano, el sistema revoca automáticamente el permiso y en el próximo uso volverá a solicitarse.
- **Permisos en los que existe:** Cámara (`CAMERA`), Micrófono (`RECORD_AUDIO`) y Ubicación (`ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`).

#### c) En Android 11+, ¿qué pasa si la persona toca “No permitir” dos veces? ¿Qué valor toma canAskAgain?
Si el usuario toca "No permitir" dos veces consecutivas, Android interpreta la acción como un rechazo explícito y permanente equivalente a la antigua casilla "No volver a preguntar". A partir de ese momento, el sistema silencia las solicitudes de ese permiso para la app.  
El campo `canAskAgain` devuelto por Expo toma el valor **`false`**.

#### d) La ubicación aproximada tiene una precisión de unos 3 km². Dá un ejemplo de función que anda bien con ella y otro de una que no.
- **Función que anda bien:** Una aplicación de pronóstico del tiempo meteorológico o una app para conocer la farmacia de turno o puntos de reciclaje en el barrio.
- **Función que no anda bien:** Una app de navegación GPS paso a paso para vehículos (tipo Waze o Google Maps) o una app deportiva para medir ritmo y distancia exacta por metro corrido.

#### e) Si la persona revoca un permiso desde Ajustes mientras la app está abierta, ¿qué hace Android con el proceso de la app?
Android **mata de inmediato el proceso de la aplicación** (`process kill`). Lo hace por principios de seguridad y consistencia arquitectónica, para asegurar que la app no mantenga en memoria punteros a hardware abierto o datos cacheados en estado inconsistente. Cuando el usuario vuelve a la app, la actividad se reinicia desde cero.

---

### B5. Android, versión por versión

| Cambio | Versión (API) | Qué implica para el código |
| :--- | :--- | :--- |
| **Nacen los permisos en tiempo de ejecución** | Android 6.0 (API 23 - Marshmallow) | Ya no basta con declarar en el manifiesto; el código debe verificar el estado con `checkSelfPermission()` y solicitarlo asincrónicamente al interactuar. |
| **La ubicación en segundo plano pasa a ser un permiso aparte** | Android 10 (API 29 - Q) | Se introduce `ACCESS_BACKGROUND_LOCATION`. No se puede pedir junto con primer plano; debe pedirse de manera escalonada tras obtener el acceso en uso. |
| **Dos rechazos equivalen a “no volver a preguntar”** | Android 11 (API 30 - R) | Si el usuario deniega 2 veces, `requestPermissions` no muestra diálogo. El código debe detectar `canAskAgain: false` y guiar a `Linking.openSettings()`. |
| **Ubicación precisa o aproximada** | Android 12 (API 31 - S) | Se deben solicitar `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos. La app debe tolerar que el usuario elija solo aproximada sin fallar. |
| **Las notificaciones pasan a ser un permiso (`POST_NOTIFICATIONS`)** | Android 13 (API 33 - Tiramisu) | Enviar notificaciones requiere solicitar permiso runtime explícito al usuario y configurar canales de notificación previos. |
| **Acceso parcial a fotos y videos (“Seleccionar fotos”)** | Android 14 (API 34 - Upside Down Cake) | Se añade `READ_MEDIA_VISUAL_USER_SELECTED`. Se recomienda migrar al Photo Picker del sistema que no requiere declarar ningún permiso de lectura. |
| **Permiso de red local (`ACCESS_LOCAL_NETWORK`)** | Android 15/16 (API 35/36 - Vanilla Ice Cream) | Escanear dispositivos en la red LAN local (mDNS, sockets locales) requiere permiso explícito, similar a iOS. |

**¿Qué es el targetSdkVersion? ¿A qué API apunta Expo SDK 57 y qué exige Google Play desde el 31 de agosto de 2026?**  
- **targetSdkVersion:** Es el identificador numérico de API con el cual la app fue probada y construida. Le indica al sistema operativo Android cómo aplicar los comportamientos de compatibilidad y las reglas de seguridad.
- **Expo SDK y targetSdkVersion:** Expo SDK apunta habitualmente a las APIs más recientes requeridas por Google (en SDKs modernos apunta a API 34 o API 35).
- **Exigencia de Google Play (desde 31 de agosto):** Google Play exige anualmente que todas las aplicaciones nuevas y actualizaciones tengan como objetivo como mínimo la versión de API más reciente (Android 14 - API 34 o Android 15 - API 35). Apps con `targetSdkVersion` inferior son bloqueadas para nuevos usuarios con dispositivos modernos.

---

## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves del Info.plist

| Recurso | Clave en Info.plist |
| :--- | :--- |
| **Cámara** | `NSCameraUsageDescription` |
| **Micrófono** | `NSMicrophoneUsageDescription` |
| **Ubicación en uso** | `NSLocationWhenInUseUsageDescription` |
| **Ubicación siempre** | `NSLocationAlwaysAndWhenInUseUsageDescription` |
| **Fotos (leer)** | `NSPhotoLibraryUsageDescription` |
| **Fotos (solo guardar)** | `NSPhotoLibraryAddUsageDescription` |
| **Contactos** | `NSContactsUsageDescription` |
| **Face ID** | `NSFaceIDUsageDescription` |
| **Rastreo entre apps (ATT)** | `NSUserTrackingUsageDescription` |
| **Notificaciones** | *No lleva clave en Info.plist* (se gestiona vía `UNUserNotificationCenter`) |

---

### C2. Sin texto, no hay permiso

#### a) ¿Qué pasa si falta el texto de propósito y la app intenta usar la cámara? ¿Y al subir la build a App Store Connect? Mencioná el código de error.
- **Al ejecutar en el dispositivo:** La aplicación crashea de inmediato y de forma irrecuperable con una señal fatal **`SIGABRT`** arrojando en los logs de Xcode: `This app has crashed because it attempted to access privacy-sensitive data without a usage description.`
- **Al subir la build a App Store Connect:** El procesamiento automatizado de Apple rechaza el binario con el código de error **`ITMS-90683: Missing Purpose String in Info.plist`**.

#### b) ¿Cuántas veces muestra iOS el diálogo de un permiso? Si la persona dice que no, ¿qué le queda a la app?
iOS muestra el diálogo nativo del sistema **exactamente una sola vez**.  
Si la persona elige "No permitir", las llamadas subsiguientes a la API fallan en silencio sin mostrar nada. A la app solo le queda como recurso informar educadamente al usuario y ofrecerle un botón que lo dirija a la pantalla de configuración de la app en iOS usando `Linking.openSettings()`.

#### c) En el diálogo de iOS, ¿qué parte arma el sistema y cuál escribís vos? En Expo, ¿dónde se configura ese texto?
- **Parte que arma el sistema:** El título general (`"NombreDeApp" desea acceder a...`), el marco visual del popup y los botones de acción (`"Permitir"`, `"No permitir"`).
- **Parte que escribe el desarrollador:** El cuerpo central o mensaje descriptivo (el valor de la clave `UsageDescription`).
- **En Expo se configura:** Dentro del archivo `app.json`, ya sea en el bloque `expo.ios.infoPlist` o en las propiedades de configuración provistas por el plugin del módulo dentro del arreglo `expo.plugins`:
```json
{
  "plugins": [
    ["expo-camera", { "cameraPermission": "Usamos tu cámara para escanear el QR del aula." }]
  ]
}
```

#### d) Una librería usa una API protegida que tu app nunca llama y Apple rechaza la build. ¿Por qué pasa y cómo se resuelve?
- **Por qué pasa:** Porque los escáneres estáticos de App Store Connect analizan todos los símbolos nativos compilados dentro del binario. Si una librería incluye referencias a APIs sensibles (por ejemplo, llamadas a `CLLocationManager` o `AVCaptureDevice`), Apple detecta la presencia del código y exige la clave correspondiente en `Info.plist`, aunque la app no ejecute ese método.
- **Cómo se resuelve:**
  1. Configurando el plugin de la librería en `app.json` para deshabilitar las funciones no deseadas (por ejemplo, en `expo-camera` desactivar el permiso de micrófono).
  2. Si la librería lo permite mediante flags de compilación, excluir los submódulos innecesarios.
  3. En caso inevitable, añadir la clave con una explicación neutra o reemplazar la librería por una más modular.

---

### C3. Probador de textos de propósito (Pauta 5.1.1 de Apple)

Molde requerido: **"Usamos tu [dato] para [beneficio concreto]"**

| Texto propuesto | ¿Aprobado? | Versión mejorada |
| :--- | :--- | :--- |
| *“Necesitamos tu ubicación.”* | **Rechazado** | *"Usamos tu ubicación para mostrarte las farmacias de turno más cercanas a tu posición."* |
| *“Para mejorar tu experiencia.”* | **Rechazado** | *"Usamos tu ubicación para sugerirte automáticamente el sector del edificio donde reportás un desperfecto."* |
| *“Usamos tu ubicación para mostrarte las farmacias de turno más cercanas.”* | **Aprobado** | Cumple perfectamente con el molde: especifica el dato ("tu ubicación") y el beneficio directo para el usuario. |
| *“La app no funciona sin ubicación.”* | **Rechazado** | *"Usamos tu ubicación para georreferenciar tu reclamo de mantenimiento y enviar a la cuadrilla técnica al aula correcta."* |
| *“Ubicación requerida por el sistema.”* | **Rechazado** | *"Usamos tu ubicación para registrar el lugar exacto del desperfecto edilicio dentro del campus."* |

---

### C4. Acceso parcial y gradual

| Caso | iOS | En Expo |
| :--- | :--- | :--- |
| **Fotos limitadas (“Seleccionar fotos”)** | iOS 14+ | `status === 'granted'`, con `accessPrivileges === 'limited'`. |
| **Ubicación aproximada (interruptor “Precisa”)** | iOS 14+ | Detectable en `Location.getForegroundPermissionsAsync()` mediante `accuracy: 'reduced'`. |
| **“Permitir una vez” (ubicación)** | iOS 13+ | Devuelve `status: 'granted'` durante la sesión actual; al matar y reiniciar la app vuelve a `'undetermined'`. |
| **Ubicación escalonada: de “al usar la app” a “Siempre”** | iOS 11/13+ | Primero se invoca `requestForegroundPermissionsAsync()`; una vez concedido, se invoca `requestBackgroundPermissionsAsync()`. |
| **Notificaciones provisionales** | iOS 12+ | `Notifications.requestPermissionsAsync({ ios: { allowProvisional: true } })`. |
| **Rastreo entre apps (App Tracking Transparency)** | iOS 14.5+ | `requestTrackingPermissionsAsync()` del paquete `expo-tracking-transparency`. |

**¿Qué versión mínima de iOS requiere Expo SDK 57? ¿Qué consecuencia práctica tiene eso sobre la tabla anterior?**  
- **Versión mínima:** Expo SDK 52+ / 57 requiere como versión mínima **iOS 15.1** (o superior).
- **Consecuencia práctica:** Todas las características de la tabla anterior (surgidas entre iOS 11 y iOS 14.5) están **100% disponibles y garantizadas** en cualquier dispositivo iPhone donde corra la aplicación, sin necesidad de condicionar el código para versiones antiguas de iOS.

---

### C5. Android vs iOS, lado a lado

| Aspecto | Android | iOS |
| :--- | :--- | :--- |
| **¿Dónde se declara?** | `AndroidManifest.xml` (`<uses-permission>`) | `Info.plist` (Claves `UsageDescription`) |
| **Texto en el diálogo** | Fijo por el sistema. El desarrollador **no** puede personalizarlo. | El sistema arma el título; el desarrollador redacta el texto explicativo de propósito. |
| **Oportunidades para preguntar** | Hasta 2 oportunidades (Android 11+). Al segundo rechazo se bloquea (`canAskAgain: false`). | **Una sola vez** en toda la vida útil de la app. Si deniega, pasa a bloqueado. |
| **“Solo esta vez” / “Permitir una vez”** | Disponible en Cámara, Micrófono y Ubicación. Se revoca al cerrar sesión. | Disponible para Ubicación. Se revoca al cerrar y matar la app. |
| **Notificaciones** | Permiso en tiempo de ejecución (`POST_NOTIFICATIONS` desde Android 13). | No requiere `Info.plist`. Permiso interactivo en runtime o provisional sin diálogo. |
| **Ubicación en segundo plano** | Permiso separado (`ACCESS_BACKGROUND_LOCATION`). Exige pedir primero primer plano. | Escalado progresivo: requiere pedir primero "al usar la app" y luego solicitar "Siempre". |
| **Si falta la declaración** | Se deniega la llamada en runtime o arroja `SecurityException`. | Crash instantáneo de la app (`SIGABRT`) y rechazo en App Store Connect. |

---

## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad | Módulo | Hook / función de permiso |
| :--- | :--- | :--- |
| **Escanear un QR con la cámara** | `expo-camera` | `useCameraPermissions()` o `requestCameraPermissionsAsync()` |
| **Grabar video con sonido** | `expo-camera` (y `expo-audio` / `expo-av`) | `requestCameraPermissionsAsync()` y `requestMicrophonePermissionsAsync()` |
| **Mostrar farmacias cercanas** | `expo-location` | `useForegroundPermissions()` o `requestForegroundPermissionsAsync()` |
| **Seguir un envío con la app en segundo plano** | `expo-location` | `requestForegroundPermissionsAsync()` seguido de `requestBackgroundPermissionsAsync()` |
| **Mostrar un recordatorio** | `expo-notifications` | `usePermissions()` o `requestPermissionsAsync()` |
| **Grabar una nota de voz** | `expo-audio` | `requestRecordingPermissionsAsync()` |
| **Galería propia dentro de la app** | `expo-media-library` | `usePermissions()` o `requestPermissionsAsync()` |
| **Publicidad personalizada entre apps (iOS)** | `expo-tracking-transparency` | `requestTrackingPermissionsAsync()` |

**Un tutorial usa `import * as Permissions from 'expo-permissions'`. ¿Qué te dice eso sobre el tutorial?**  
Indica que el tutorial está **completamente obsoleto y desactualizado**. La librería global `expo-permissions` fue declarada obsoleta en Expo SDK 41 y eliminada definitivamente del ecosistema hace varias versiones. Cada módulo ahora incorpora sus propios hooks y métodos dedicados.

---

### D2. Consultar, pedir y el hook

#### a) ¿Qué diferencia hay entre get…PermissionsAsync() y request…PermissionsAsync()? ¿Cuál puede mostrar un diálogo?
- `get...PermissionsAsync()`: Es una función de **solo lectura**. Consulta de forma silenciosa el estado actual del permiso en el sistema operativo sin interactuar con el usuario ni alterar nada. **Nunca muestra un diálogo**.
- `request...PermissionsAsync()`: Es una función de **acción**. Si el permiso está en estado preguntable (`undetermined` o denegado con `canAskAgain: true`), **dispara y muestra el diálogo nativo del sistema operativo** para solicitar el consentimiento.

#### b) El hook devuelve tres elementos. ¿Qué es cada uno? ¿Qué vale permiso en el primer render y qué tiene que mostrar la pantalla mientras tanto?
Los tres elementos son:
1. `permiso` (o `status`): Objeto `PermissionResponse` con el estado actual del permiso (`status`, `granted`, `canAskAgain`, etc.).
2. `pedirPermiso`: Función despachadora para invocar el diálogo del sistema (equivalente a `requestPermissionsAsync`).
3. `consultarPermiso`: Función despachadora para re-consultar el estado sin pedir (equivalente a `getPermissionsAsync`).

**En el primer render:** `permiso` vale **`null`**, pues la consulta al sistema operativo es asíncrona.  
**Qué mostrar mientras tanto:** La pantalla debe mostrar un **indicador de carga (`ActivityIndicator`)** o pantalla de esqueleto (*skeleton screen*), evitando asumir que el permiso está denegado o concedido prematuramente.

#### c) Si canAskAgain es false, ¿qué pasa al llamar a request…()? ¿Qué problema aparece si se lo llama en un bucle?
- Si `canAskAgain` es `false`, llamar a `request...()` **no muestra ningún diálogo**; la promesa se resuelve casi instantáneamente retornando el estado `'denied'` sin molestar al usuario.
- **Problema en bucle:** Si se invoca dentro de un `useEffect` mal condicionado o ante cada render, se produce un **bucle infinito** de llamadas asíncronas que congela el hilo de JavaScript, bloquea la interfaz de usuario y agota la batería del teléfono.

---

### D3. Leé la respuesta

| Respuesta de Expo | Qué hace la app |
| :--- | :--- |
| `null` | Muestra un indicador de carga (`ActivityIndicator`); aún no se conoce el estado. |
| `{ status: 'granted', granted: true }` | Renderiza directamente la funcionalidad protegida (cámara, mapa, etc.). |
| `{ status: 'undetermined', canAskAgain: true }` | Muestra la pantalla previa explicativa contextual con botón "Continuar" para solicitar el permiso. |
| `{ status: 'denied', canAskAgain: true }` | Muestra pantalla explicativa reforzando el beneficio y permitiendo volver a solicitar con el diálogo del sistema. |
| `{ status: 'denied', canAskAgain: false }` | Muestra la interfaz de permiso bloqueado, explicando cómo activarlo en Configuración y ofreciendo el botón "Abrir Ajustes" (`Linking.openSettings()`), además del camino alternativo. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Permite usar la galería pero con el subconjunto de fotos elegidas, ofreciendo la opción de gestionar más fotos. |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Activa la funcionalidad pero adaptada a baja precisión (ej. muestra "Ubicación aproximada" sin obligar a coordenadas finas). |

**¿Cuáles son los dos campos que deciden casi todo? ¿Qué pregunta responde cada uno?**
1. **`status`**: Responde a la pregunta: *¿Tengo autorización para acceder al recurso en este momento?* (Valores: `'granted'`, `'denied'`, `'undetermined'`).
2. **`canAskAgain`**: Responde a la pregunta: *¿El sistema operativo me permite mostrarle de nuevo el diálogo nativo a la persona o está bloqueado?* (Valores: `true` o `false`).

---

### D4. Simulación del ciclo completo

#### Tabla de simulación en Android 14 (`expo-location`)

| # | Acción | status | canAskAgain | ¿Diálogo? |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `getForegroundPermissionsAsync()` | `'undetermined'` | `true` | **No** |
| **2** | `requestForegroundPermissionsAsync()` → "No permitir" | `'denied'` | `true` | **Sí** |
| **3** | `requestForegroundPermissionsAsync()` → "No permitir" | `'denied'` | `false` | **Sí** |
| **4** | `requestForegroundPermissionsAsync()` | `'denied'` | `false` | **No** |
| **5** | `Linking.openSettings()` → habilita "Mientras la app está en uso" → vuelve y la app consulta | `'granted'` | `true` | **No** |
| **6** | Igual que el 5, pero la app no vuelve a consultar: ¿qué muestra? | `'denied'` | `false` | **No** (sigue mostrando bloqueado porque la app mantuvo el estado en memoria y no lo refrescó) |

#### Comparación con iOS (Pasos 1 a 4):
- **¿En qué paso cambia y por qué?**  
  Cambia en el **Paso 3**. En iOS, tras el primer "No permitir" en el Paso 2, `canAskAgain` pasa inmediatamente a `false`. En el Paso 3, iOS **no muestra diálogo**, mientras que Android sí lo mostró por segunda vez.
- **¿Qué pasa en iOS si la persona elige “Permitir una vez” y después cierra y reabre la app?**  
  Al cerrar completamente (matar el proceso) y reabrir la app, el permiso temporal caduca y vuelve al estado **`status: 'undetermined'`** con **`canAskAgain: true`**, permitiendo que la próxima vez que se requiera el recurso se vuelva a mostrar el diálogo.

---

### D5. Configurar app.json

Bloque de configuración en `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Usamos tu cámara para escanear el código QR del aula.",
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Usamos tu ubicación para sugerirte los puntos de reciclaje más cercanos a tu posición."
        }
      ]
    ],
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

**¿Por qué expo-camera agrega RECORD_AUDIO en Android aunque la app no grabe sonido?**  
Porque la biblioteca nativa subyacente de `expo-camera` (`CameraView`) incluye de fábrica funcionalidades para capturar fotografía y grabar video con audio sincronizado. Para que la grabación de video no falle por falta de permisos en apps que sí la utilizan, el manifiesto de la librería declara `RECORD_AUDIO` por defecto. Si la app solo toma fotos o lee QRs, el desarrollador debe removerlo explícitamente con `recordAudioAndroid: false` o `blockedPermissions`.

---

### D6. Expo Go no es tu app

#### a) ¿Por qué tus textos de propósito no aparecen cuando probás en Expo Go?
Porque Expo Go es una aplicación ya empaquetada y firmada que se instaló desde el App Store de Apple con su propio `Info.plist` predefinido por el equipo de Expo. Los textos personalizados que definís en tu `app.json` solo se inyectan en el `Info.plist` nativo cuando generás un prebuild y compilas tu propia aplicación.

#### b) ¿Qué se puede probar en Expo Go y qué necesita una development build? Pensá en push en Android y en ubicación en segundo plano.
- **Se puede probar en Expo Go:** Flujos estándar de UI, navegación con Expo Router, cámara básica, ubicación en primer plano, almacenamiento local, selección de imágenes con selector del sistema.
- **Necesita una Development Build:**
  - **Notificaciones push remotas en Android:** Desde Expo SDK 51+, el servicio de notificaciones remotas en Android requiere credenciales FCM propias y configuración nativa que no puede compartirse en Expo Go.
  - **Ubicación en segundo plano:** Requiere servicios en segundo plano (`expo-task-manager` / `ACCESS_BACKGROUND_LOCATION`) que iOS y Android restringen fuera del binario propio.
  - Módulos nativos personalizados, pagos in-app o exclusión real de permisos mediante `blockedPermissions`.

#### c) Escribí los comandos para ver los archivos nativos generados y para compilar una development build en Android.
- Para generar y ver los directorios nativos (`android/` e `ios/`):
  ```bash
  npx expo prebuild --clean
  ```
- Para compilar y ejecutar una development build en un dispositivo Android o emulador local:
  ```bash
  npx expo run:android
  ```

#### d) ¿Cómo volvés un permiso a “sin decidir” sin reinstalar, en Android (adb) y en el simulador de iOS (xcrun simctl)?
- **En Android (adb):**
  ```bash
  adb shell pm reset-permissions <package-name>
  ```
- **En el simulador de iOS (xcrun simctl):**
  ```bash
  xcrun simctl privacy booted reset all <bundle-identifier>
  ```

---

## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

#### Tres errores identificados en el código original:
1. **No maneja el estado inicial `permiso === null`:** Al inicio `permiso` es nulo, por lo que evaluar `permiso.status` arrojaría un error de ejecución en tiempo de carga (`Cannot read property 'status' of null`).
2. **Confunde "no concedido" con "preguntable":** Si el permiso fue rechazado definitivamente (`canAskAgain: false`), la pantalla sigue mostrando el botón "Permitir" que ya no hace nada en lugar de advertir que está bloqueado y ofrecer abrir Ajustes.
3. **No respeta la regla de no insistir ni ofrece alternativas:** Asume que la pantalla sólo puede o mostrar la cámara o insistir con el botón, sin contemplar la carga ni una alternativa manual si no hay cámara disponible.

#### Versión corregida con los cuatro estados:
```tsx
import React from 'react';
import { View, Text, Button, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Escanear() {
  const [permiso, pedirPermiso] = useCameraPermissions();

  // 1. Estado: Cargando
  if (!permiso) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0055ff" />
        <Text style={styles.texto}>Consultando permisos de la cámara...</Text>
      </View>
    );
  }

  // 2. Estado: Concedido
  if (permiso.status === 'granted') {
    return <CameraView style={styles.flex} facing="back" />;
  }

  // 3. Estado: Bloqueado (no se puede volver a pedir directamente)
  if (!permiso.canAskAgain) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Acceso a la cámara bloqueado</Text>
        <Text style={styles.texto}>
          Para escanear el QR del aula necesitás habilitar el permiso de la cámara desde la configuración del dispositivo.
        </Text>
        <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
      </View>
    );
  }

  // 4. Estado: Preguntable (sin decidir o denegado reintentable)
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Escaneo de aula</Text>
      <Text style={styles.texto}>
        Usamos la cámara para leer el código QR de la puerta del aula e identificarla automáticamente.
      </Text>
      <Button title="Continuar" onPress={pedirPermiso} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  texto: { fontSize: 16, marginBottom: 20, color: '#444' }
});
```

---

### E2. El orden importa (ubicación)

#### a) ¿Qué está mal? ¿Qué ocurre en iOS y qué ocurre en Android 11+?
**Qué está mal:** La función solicita el permiso de segundo plano (`requestBackgroundPermissionsAsync()`) **antes** de haber solicitado y obtenido el permiso de primer plano (`requestForegroundPermissionsAsync()`).  
- **En iOS:** El sistema ignora la petición de segundo plano o arroja un error si no se cuenta con autorización previa en primer plano.
- **En Android 11+:** Si una app pide `ACCESS_BACKGROUND_LOCATION` sin haber obtenido previamente `ACCESS_FINE_LOCATION` o `ACCESS_COARSE_LOCATION`, el sistema operativo rechaza la solicitud de inmediato sin mostrar ningún diálogo.

#### b) Reescribí la función correctamente:
```typescript
import * as Location from 'expo-location';

export async function activarSeguimiento(): Promise<boolean> {
  // 1. Solicitar primero la ubicación en uso (primer plano)
  const enUso = await Location.requestForegroundPermissionsAsync();
  if (!enUso.granted) {
    return false;
  }

  // 2. Recién con primer plano concedido, solicitar segundo plano
  const siempre = await Location.requestBackgroundPermissionsAsync();
  return siempre.granted;
}
```

#### c) Función `obtenerUbicacion()` resiliente:
```typescript
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface ResultadoUbicacion {
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  aproximada: boolean;
}

export async function obtenerUbicacion(): Promise<ResultadoUbicacion | null> {
  try {
    const estado = await Location.getForegroundPermissionsAsync();
    
    // Si no está concedido, intentamos pedirlo
    let permiso = estado;
    if (permiso.status !== 'granted' && permiso.canAskAgain) {
      permiso = await Location.requestForegroundPermissionsAsync();
    }

    if (permiso.status !== 'granted') {
      return null;
    }

    // Detectar si la ubicación es aproximada según plataforma
    let esAproximada = false;
    if (Platform.OS === 'android') {
      esAproximada = permiso.android?.accuracy === 'coarse';
    } else if (Platform.OS === 'ios') {
      esAproximada = (permiso as any).scope === 'reduced' || (permiso as any).accuracy === 'reduced';
    }

    const posicion = await Location.getCurrentPositionAsync({
      accuracy: esAproximada ? Location.Accuracy.Balanced : Location.Accuracy.High
    });

    return {
      coordenadas: {
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude
      },
      aproximada: esAproximada
    };
  } catch (error) {
    // Si ocurre cualquier error, devolvemos null sin romper la app
    return null;
  }
}
```

#### d) ¿Hace falta segundo plano para “farmacias cercanas”? ¿Qué exige Google Play si lo pedís?
- **¿Hace falta segundo plano?** **NO.** Para mostrar farmacias cercanas solo se necesita conocer la posición cuando el usuario tiene la aplicación abierta en pantalla (primer plano).
- **Qué exige Google Play si lo pedís:** Google Play tiene una estricta política sobre `ACCESS_BACKGROUND_LOCATION`. Exige una justificación exhaustiva demostrando que la funcionalidad principal de la app no puede existir sin rastreo continuo en segundo plano (ej. emergencias, navegación activa). Si no se demuestra, la aplicación es rechazada de la tienda.

---

### E3. Notificaciones mudas

#### a) ¿Cuál es la causa más probable? ¿Qué hay que hacer antes de pedir el permiso?
- **Causa más probable:** En Android 13+ (API 33+) no basta con pedir el permiso; si la app no tiene configurado un **Canal de Notificación (`NotificationChannel`)** en Android, o falta la declaración `POST_NOTIFICATIONS` en el manifiesto, el sistema no presenta el diálogo.
- **Qué hay que hacer antes:** Se debe crear obligatoriamente el canal de notificación llamando a `Notifications.setNotificationChannelAsync('nombre_canal', { ... })` antes de solicitar el permiso o emitir notificaciones.

#### b) ¿Qué pasa con este permiso en Android 12 o anterior?
En Android 12 (API 32) y versiones inferiores, el permiso para enviar notificaciones se consideraba un permiso normal y se otorgaba **automáticamente al instalar la aplicación**, sin requerir diálogo en tiempo de ejecución.

#### c) ¿Qué opción de iOS permite recibir notificaciones sin diálogo? ¿Cómo detectás en código ese estado?
- **Opción de iOS:** Las **Notificaciones Provisionales** (*Provisional Authorization*). Permiten enviar notificaciones que van directo al Centro de Notificaciones de forma silenciosa (sin banner emergente ni sonido) sin haber mostrado un diálogo previo.
- **Detección en código:** Al solicitar el permiso con `{ ios: { allowProvisional: true } }`, la respuesta devuelve `status === 'granted'` y en iOS la propiedad `ios.status === Notifications.IosAuthorizationStatus.PROVISIONAL`.

#### d) ¿En qué momento conviene pedir este permiso? Dá un ejemplo de buen y de mal momento.
- **Buen momento:** En contexto, inmediatamente después de que el usuario realiza una acción cuyo resultado le interesa monitorear.  
  *Ejemplo:* Luego de presionar "Confirmar reporte de desperfecto", mostrando: *"¿Deseás que te avisemos cuando la cuadrilla solucione este problema?"*.
- **Mal momento:** En el primer lanzamiento de la app, justo en la pantalla de bienvenida o login, sin haberle mostrado aún ninguna funcionalidad al usuario.

---

### E4. Fotos sin pedir permiso

| Necesidad | Herramienta | Permiso |
| :--- | :--- | :--- |
| **Elegir una foto de perfil** | Photo Picker del sistema (`ImagePicker.launchImageLibraryAsync`) | **Ninguno** (el selector nativo del SO no requiere permisos) |
| **Sacar una foto en el momento** | Cámara del dispositivo (`ImagePicker.launchCameraAsync` o `CameraView`) | Permiso de Cámara (`CAMERA`) |
| **Editor que muestra toda la galería** | Galería personalizada (`expo-media-library`) | `READ_MEDIA_IMAGES` / `NSPhotoLibraryUsageDescription` |
| **Adjuntar la foto de un comprobante** | Photo Picker del sistema o `DocumentPicker` | **Ninguno** |

**¿Por qué Google Play restringe READ_MEDIA_IMAGES y READ_MEDIA_VIDEO? ¿Desde cuándo? ¿Qué es “el mejor permiso”?**
- **Por qué lo restringe:** Para preservar la privacidad de los usuarios, impidiendo que apps que solo necesitan adjuntar una imagen ocasional soliciten acceso irrestricto a todas las fotos y videos privados del dispositivo.
- **Desde cuándo:** De manera obligatoria desde mediados de 2024 para todas las apps en Google Play.
- **¿Qué es “el mejor permiso”?** *"El mejor permiso es el que no se pide"*. Significa delegar la selección de archivos al selector del propio sistema operativo, obteniendo únicamente el elemento seleccionado por el usuario sin exigir permisos globales sobre todo el almacenamiento.

---

### E5. Volver de Ajustes

#### Código completo del hook `useRevisarAlVolver.ts`:
```typescript
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo: AppStateStatus) => {
      const estabaAfuera = /inactive|background/.test(anterior.current);
      if (estabaAfuera && nuevo === 'active') {
        revisar();
      }
      anterior.current = nuevo;
    });

    return () => {
      sub.remove();
    };
  }, [revisar]);
}
```

#### a) ¿Por qué los hooks de Expo no se enteran solos de que el permiso cambió en Ajustes?
Porque los hooks estándar de React ejecutan su lógica basados en cambios de estado o renderizados del ciclo de vida interno de React Native. Cuando el usuario cambia un ajuste en la configuración del sistema operativo, dicho cambio ocurre en un proceso externo ajeno a la app; por lo tanto, el sistema no emite ningún evento directo a JavaScript salvo el cambio de estado global de la aplicación (`AppState`).

#### b) ¿Qué función del hook de cámara le pasarías a useRevisarAlVolver?
La función de consulta silenciosa: el tercer elemento devuelto por `useCameraPermissions()`, habitualmente denominado `consultarPermiso` (o `getPermissionsAsync`).

#### c) ¿Por qué no conviene guardar el estado del permiso en un store global “para siempre”?
Porque el permiso es un estado volátil administrado por el sistema operativo. En cualquier momento el usuario puede minimizar la app, ir a Ajustes y revocar o modificar los privilegios. Si la app guarda el estado "para siempre" en un store global, operará con información desactualizada, causando errores de llamada a APIs protegidas.

---

## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si lo deniegan |
| :--- | :--- | :--- |
| **Delivery · ubicación** | Al momento de ingresar la dirección de entrega o presionar "Usar mi ubicación actual". | Escribir manualmente la calle y número en una barra de búsqueda. |
| **Billetera virtual · cámara** | Únicamente al tocar el botón "Escanear QR para pagar". | Ingresar manualmente el código alfanumérico o alias de la cuenta de pago. |
| **Red social · contactos** | Al ingresar a la sección "Buscar amigos que ya usan la app". | Buscar contactos manualmente por su nombre de usuario o enviar un enlace de invitación. |
| **Mensajería · micrófono** | Al mantener presionado el botón del micrófono para enviar una nota de voz. | Escribir el mensaje en texto o adjuntar un archivo de audio pregrabado. |
| **Turnos médicos · notificaciones** | Inmediatamente después de agendar con éxito un nuevo turno. | Mostrar los recordatorios en la bandeja de avisos interna de la app o enviar confirmación por correo electrónico. |
| **Editor de fotos · galería completa** | Al abrir la pantalla de edición múltiple o collage que requiere examinar álbumes completos. | Abrir el Photo Picker del sistema para elegir fotos individuales una por una. |

**¿Por qué pedir cuatro permisos apenas se abre la app “entrena el No permitir automático”?**  
Porque genera fatiga por sobrecarga cognitiva y desconfianza en el usuario. Al no haber visto aún la propuesta de valor ni entender para qué se solicita cada permiso, el usuario reacciona a la defensiva tocando "No permitir" repetidamente para descartar los diálogos invasivos.

---

### F2. La pantalla previa

#### a) ¿Qué tres elementos tiene una buena pantalla previa al diálogo del sistema?
1. **Contexto visual y título claro:** Un ícono representativo y un título que indique el recurso solicitado (ej. Ícono de cámara y "Escaneo de aula").
2. **Propósito con beneficio directo para el usuario:** Una frase clara siguiendo el molde *"Usamos tu [dato] para [beneficio concreto]"*.
3. **Llamado a la acción unívoco ("Continuar"):** Un botón claro que anticipa que a continuación aparecerá la solicitud del sistema.

#### b) ¿Por qué el botón debe decir “Continuar” y no “Permitir”?
Porque la pantalla previa **no tiene la facultad de otorgar el permiso**; quien lo concede es el diálogo del sistema operativo que vendrá a continuación. Decir "Permitir" confunde al usuario haciéndole creer que ya aceptó, provocando desconcierto cuando inmediatamente después salta el diálogo nativo preguntándole de nuevo. "Continuar" expresa con precisión que el proceso de configuración continúa en el siguiente paso.

#### c) ¿Qué dice la pauta 5.1.1(iv) de Apple sobre botones como “Ahora no” o “Cerrar” en esa pantalla?
La directriz 5.1.1(iv) de Apple prohíbe explícitamente engañar o condicionar al usuario en pantallas previas (*pre-permission alerts*), y señala que estas no deben duplicar innecesariamente las opciones del diálogo nativo. Si se muestra una pantalla explicativa, no debe condicionar el avance ni desorientar al usuario con opciones ambiguas previas a la decisión soberana del sistema operativo.

#### d) ¿Cómo cambia la pantalla si el permiso ya está bloqueado?
- El texto explicativo pasa de ser informativo a **instructivo**, indicando los pasos exactos para habilitarlo (ej. *"Andá a Ajustes > Privacidad > Cámara y activá el interruptor"*).
- El botón de acción cambia su texto y comportamiento: pasa de "Continuar" a **"Abrir Ajustes"**, ejecutando `Linking.openSettings()`.
- Se destaca la **alternativa manual** para que el usuario no quede atrapado.

---

### F3. Mínimo privilegio

#### a) Ubicación precisa o aproximada para “puntos de reciclaje de tu barrio”.
- **Elección:** Ubicación **aproximada**.
- **Justificación:** Los contenedores y puntos de reciclaje barriales abarcan áreas de cientos de metros; la precisión a nivel de radio barrial (3 km²) es más que suficiente para listar los puntos cercanos sin necesidad de rastrear la coordenada milimétrica del domicilio del usuario.

#### b) Ubicación “en uso” o “siempre” para “registrar una carrera con el celular en el bolsillo”.
- **Elección:** Ubicación **en uso** (con servicio en primer plano / *Foreground Service*).
- **Justificación:** Una sesión deportiva es una actividad activa iniciada por el usuario. En Android e iOS, una app con servicio de primer plano y notificación persistente activa puede seguir registrando la ruta GPS mientras la pantalla está apagada o el celular en el bolsillo sin requerir el permiso invasivo de ubicación "Siempre" (en segundo plano permanente).

#### c) Selector del sistema o permiso de galería para “subir la foto del DNI”.
- **Elección:** **Selector del sistema** (Photo Picker / `ImagePicker.launchImageLibraryAsync`).
- **Justificación:** Cumple al 100% con el principio de que "el mejor permiso es el que no se pide". El usuario elige voluntariamente la imagen de su DNI desde la interfaz protegida del sistema operativo y la app recibe solo ese archivo, sin tener acceso al resto de las fotografías personales.

#### d) expo-camera con o sin micrófono para “escanear el QR del aula”.
- **Elección:** **Sin micrófono** (`microphonePermission: false`, `recordAudioAndroid: false`).
- **Justificación:** Escanear un código QR es un proceso puramente óptico. Solicitar acceso al micrófono para leer un QR viola el principio de mínimo privilegio, despierta sospechas de espionaje en el usuario y puede provocar el rechazo de la app en las tiendas.

---

### F4. Tiendas

#### a) Nombrá dos requisitos de Google Play y dos de App Store relacionados con permisos y privacidad.
- **Google Play:**
  1. Declaración detallada de seguridad de datos (*Data Safety Section*), justificando cada permiso peligroso utilizado.
  2. Prohibición estricta de acceder a `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` para apps que no sean administradores globales de medios (obligatoriedad del Photo Picker).
- **App Store:**
  1. Inclusión obligatoria de cadenas de propósito claras y descriptivas (`UsageDescription`) en `Info.plist` para cualquier API protegida; la ausencia genera rechazo o crash.
  2. Cumplimiento de la pauta de transparencia de rastreo (ATT - App Tracking Transparency), solicitando permiso antes de vincular datos de usuario entre diferentes empresas para fines publicitarios.

#### b) ¿Qué es el manifiesto de privacidad (PrivacyInfo.xcprivacy) y dónde se configura en Expo?
Es un archivo exigido por Apple desde la primavera de 2024 donde las aplicaciones y los SDKs de terceros deben declarar los tipos de datos que recopilan y declarar el uso legítimo de las "APIs de motivo requerido" (*Required Reason APIs*, como APIs de disco, timestamps o user defaults) para evitar el rastreo no consentido por huella digital (*fingerprinting*).  
**En Expo se configura:** En `app.json` dentro de `expo.ios.privacyManifests` o automáticamente mediante los config plugins de los paquetes actualizados del SDK.

#### c) ¿Qué suma Android 17 y qué va a exigir Google Play desde el 27/01/2027 a las apps que hoy piden READ_CONTACTS?
- **Android 17 / Nueva directriz:** Google Play exigirá la adopción de los selectores desacoplados del sistema (como el nuevo *Contact Picker* del SO), prohibiendo el acceso directo a la base de datos de contactos mediante `READ_CONTACTS` para casos de uso comunes (como invitar amigos o compartir saldo).
- **Exigencia:** Las apps no podrán solicitar el permiso global `READ_CONTACTS` a menos que su función nuclear sea un gestor telefónico completo de contactos, debiendo utilizar el selector del sistema que comparte únicamente el contacto elegido.

---

### F5. Errores comunes

#### a) La consola de Xcode muestra: “This app has crashed because it attempted to access privacy-sensitive data without a usage description.”
- **Causa:** El código invocó una API protegida de iOS (ej. la cámara o la ubicación) sin haber definido la clave correspondiente en `Info.plist` (`NSCameraUsageDescription` o `NSLocationWhenInUseUsageDescription`).
- **Solución:** Configurar en `app.json` el plugin correspondiente con su mensaje explicativo, o agregarlo en `expo.ios.infoPlist`, y luego regenerar el proyecto con `npx expo prebuild --clean`.

#### b) “En Expo Go anda, en la build no”: en la development build la cámara se deniega sin mostrar ningún diálogo.
- **Causa:** En Expo Go la cámara funcionaba porque la app Expo Go ya tiene todos los permisos declarados en su propio manifiesto. Al generar la build propia, no se configuró el plugin de `expo-camera` en `app.json` o se colocó el permiso en `blockedPermissions`. Al no estar en el `AndroidManifest.xml` de la build propia, Android deniega la petición de forma instantánea.
- **Solución:** Agregar el plugin `["expo-camera", { "cameraPermission": "..." }]` en `app.json` y volver a compilar con `npx expo run:android`.

#### c) Después de habilitar la ubicación en Ajustes, la app sigue diciendo “bloqueado”.
- **Causa:** El componente consultó el estado del permiso únicamente al montarse (`useEffect` con arreglo de dependencias vacío `[]`). Al volver desde Ajustes a la app, el componente no se desmontó ni volvió a consultar la API nativa.
- **Solución:** Suscribirse al evento de cambio de estado de la app mediante `AppState.addEventListener('change', ...)` (como en el hook `useRevisarAlVolver`) y ejecutar la función de consulta cada vez que el estado pase de segundo plano a activo (`active`).

#### d) La pantalla queda en “Pidiendo permiso…” para siempre porque el código llama a request…() cada vez que se renderiza.
- **Causa:** Se llamó a `requestPermissionsAsync()` directamente en el cuerpo del componente funcional sin envolverlo en un `useEffect` o sin atarlo a un evento `onPress`. Como cada respuesta actualiza un estado de React, esto dispara un nuevo render, que vuelve a llamar a la función, creando un bucle infinito de solicitudes asíncronas.
- **Solución:** Envolver la llamada dentro de un callback disparado por un evento del usuario (`onPress`) o dentro de un `useEffect` con dependencias estrictas, validando previamente que el permiso sea preguntable (`canAskAgain === true`).

#### e) Una app de turnos no permite entrar a ninguna pantalla si se deniegan las notificaciones.
- **Causa:** El flujo de la aplicación condicionó la navegación global a tener el permiso de notificaciones concedido (*permission gating* abusivo), bloqueando la aplicación con un modal insalvable si el usuario presiona "No permitir".
- **Solución:** Desvincular el acceso a la app de la concesión del permiso. Si el usuario deniega las notificaciones, permitirle utilizar la app con normalidad y ofrecer una bandeja de avisos interna (`/avisos`) donde consultar las novedades de sus turnos.
