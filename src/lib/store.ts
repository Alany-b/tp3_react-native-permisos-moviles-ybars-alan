export interface UbicacionReporte {
  sector?: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  esAproximada: boolean;
}

export type CategoriaReporte = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';
export type EstadoReporte = 'pendiente' | 'en curso' | 'resuelto';

export interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: CategoriaReporte;
  estado: EstadoReporte;
  fotoUri?: string;
  ubicacion?: UbicacionReporte;
  fechaCreacion: string;
}

export interface Aviso {
  id: string;
  reporteId: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

// Estado en memoria accesible globalmente y reactivo para los componentes
class StoreMantenimiento {
  private reportes: Reporte[] = [
    {
      id: 'rep-101',
      titulo: 'Tubo fluorescente parpadeando',
      descripcion: 'El tubo del fondo parpadea constantemente e interrumpe las clases teóricas.',
      aula: 'Aula 204 - 2do Piso',
      categoria: 'electricidad',
      estado: 'en curso',
      fotoUri: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=500&auto=format&fit=crop&q=60',
      ubicacion: {
        sector: 'Pabellón Central - 2do Piso',
        esAproximada: false,
        coordenadas: { latitud: -26.1852, longitud: -58.1755 },
      },
      fechaCreacion: '2026-10-22 09:30',
    },
    {
      id: 'rep-102',
      titulo: 'Pérdida continua de agua en canilla',
      descripcion: 'La canilla del lavatorio izquierdo gotea sin parar e inunda la mesada.',
      aula: 'Baño de Alumnos - PB',
      categoria: 'agua',
      estado: 'pendiente',
      ubicacion: {
        sector: 'Planta Baja - Sanitarios',
        esAproximada: true,
      },
      fechaCreacion: '2026-10-23 08:15',
    },
    {
      id: 'rep-103',
      titulo: 'Proyector HDMI no da video',
      descripcion: 'Se probó con varias notebooks y el proyector no detecta la señal del cable.',
      aula: 'Laboratorio de Informática 1',
      categoria: 'equipos',
      estado: 'resuelto',
      ubicacion: {
        sector: 'Laboratorios',
        esAproximada: false,
        coordenadas: { latitud: -26.1850, longitud: -58.1752 },
      },
      fechaCreacion: '2026-10-21 14:00',
    },
  ];

  private avisos: Aviso[] = [
    {
      id: 'aviso-1',
      reporteId: 'rep-103',
      titulo: 'Reporte Resuelto: Proyector HDMI',
      mensaje: 'El equipo técnico reemplazó el cable HDMI del Laboratorio 1. El proyector vuelve a estar operativo.',
      fecha: '2026-10-22 17:30',
      leido: false,
    },
  ];

  private avisarResolucion: boolean = false;
  private listeners: Array<() => void> = [];

  public suscribir(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notificar() {
    this.listeners.forEach((l) => l());
  }

  public getReportes(): Reporte[] {
    return [...this.reportes];
  }

  public getReportePorId(id: string): Reporte | undefined {
    return this.reportes.find((r) => r.id === id);
  }

  public agregarReporte(nuevo: Omit<Reporte, 'id' | 'fechaCreacion' | 'estado'>): Reporte {
    const reporteCompleto: Reporte = {
      ...nuevo,
      id: `rep-${Date.now().toString().slice(-4)}`,
      estado: 'pendiente',
      fechaCreacion: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
    };
    this.reportes = [reporteCompleto, ...this.reportes];
    this.notificar();
    return reporteCompleto;
  }

  public actualizarEstadoReporte(id: string, nuevoEstado: EstadoReporte): boolean {
    const idx = this.reportes.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.reportes[idx] = { ...this.reportes[idx], estado: nuevoEstado };
    this.notificar();
    return true;
  }

  public getAvisos(): Aviso[] {
    return [...this.avisos];
  }

  public agregarAviso(reporteId: string, titulo: string, mensaje: string): Aviso {
    const nuevoAviso: Aviso = {
      id: `aviso-${Date.now()}`,
      reporteId,
      titulo,
      mensaje,
      fecha: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
      leido: false,
    };
    this.avisos = [nuevoAviso, ...this.avisos];
    this.notificar();
    return nuevoAviso;
  }

  public marcarAvisosLeidos() {
    this.avisos = this.avisos.map((a) => ({ ...a, leido: true }));
    this.notificar();
  }

  public getAvisarResolucion(): boolean {
    return this.avisarResolucion;
  }

  public setAvisarResolucion(valor: boolean) {
    this.avisarResolucion = valor;
    this.notificar();
  }

  private borrador: Partial<Reporte> = {
    categoria: 'electricidad',
  };

  public getBorrador(): Partial<Reporte> {
    return { ...this.borrador };
  }

  public actualizarBorrador(datos: Partial<Reporte>) {
    this.borrador = { ...this.borrador, ...datos };
    this.notificar();
  }

  public limpiarBorrador() {
    this.borrador = { categoria: 'electricidad' };
    this.notificar();
  }
}

export const store = new StoreMantenimiento();
