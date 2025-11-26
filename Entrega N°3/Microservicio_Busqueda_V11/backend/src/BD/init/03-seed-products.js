// Script para poblar la colección de productos con datos de ejemplo
// Ejecutar con: node 03-seed-products.js

db = db.getSiblingDB('searchdb');

// Productos de ejemplo para pruebas
// Los primeros 5 incluyen información completa de multimedia y vendedor
const productos = [
  {
    id: 1,
    nombre: "Laptop HP Pavilion 15",
    precio: 450,
    categoria: "Electrónica",
    condicion: "nuevo",
    stock: 10,
    sku: "HP-PAV-001",
    descripcion: "Laptop HP Pavilion 15.6 pulgadas con procesador Intel Core i5 de 11va generación, 8GB RAM DDR4, SSD de 256GB. Ideal para trabajo, estudio y entretenimiento. Incluye Windows 11 Home preinstalado y garantía de 1 año.",
    marca: "HP",
    fecha_creacion: new Date(),
    id_vendedor: "vendor_tech_001",
    multimedia: [
      {
        url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
        tipo: "imagen"
      },
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        tipo: "imagen"
      },
      {
        url: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800",
        tipo: "imagen"
      }
    ],
    despacho: "ambos",
    precio_envio: 5000,
    estado: "activo",
    vendedor: {
      id: "vendor_tech_001",
      nombre: "TechStore UV",
      email: "contacto@techstore.cl",
      tipo: "tienda",
      telefono: "+56 9 8765 4321"
    }
  },
  {
    id: 2,
    nombre: "Monitor LG 24 pulgadas",
    precio: 180,
    categoria: "Electrónica",
    condicion: "nuevo",
    stock: 15,
    sku: "LG-MON-002",
    descripcion: "Monitor LG 24 pulgadas Full HD IPS con resolución 1920x1080, frecuencia de 75Hz. Panel IPS para colores vibrantes y ángulos de visión amplios. Conexiones HDMI y DisplayPort. Perfecto para trabajo de oficina y gaming casual.",
    marca: "LG",
    fecha_creacion: new Date(),
    id_vendedor: "vendor_tech_001",
    multimedia: [
      {
        url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
        tipo: "imagen"
      },
      {
        url: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800",
        tipo: "imagen"
      }
    ],
    despacho: "ambos",
    precio_envio: 3500,
    estado: "activo",
    vendedor: {
      id: "vendor_tech_001",
      nombre: "TechStore UV",
      email: "contacto@techstore.cl",
      tipo: "tienda",
      telefono: "+56 9 8765 4321"
    }
  },
  {
    id: 3,
    nombre: "Teclado Mecánico RGB",
    precio: 85,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 25,
    sku: "KEY-RGB-003",
    descripcion: "Teclado mecánico gaming con switches mecánicos azules, iluminación RGB personalizable por tecla. Software incluido para crear macros y perfiles de iluminación. Construcción metálica resistente, reposa muñecas incluido. Compatible con Windows y Mac.",
    marca: "Corsair",
    fecha_creacion: new Date(),
    id_vendedor: "vendor_games_002",
    multimedia: [
      {
        url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
        tipo: "imagen"
      },
      {
        url: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
        tipo: "imagen"
      },
      {
        url: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800",
        tipo: "imagen"
      }
    ],
    despacho: "envio",
    precio_envio: 2500,
    estado: "activo",
    vendedor: {
      id: "vendor_games_002",
      nombre: "Gaming Pro Chile",
      email: "ventas@gamingpro.cl",
      tipo: "tienda",
      telefono: "+56 9 7654 3210"
    }
  },
  {
    id: 4,
    nombre: "Mouse Inalámbrico Logitech",
    precio: 35,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 30,
    sku: "MOUSE-LOG-004",
    descripcion: "Mouse inalámbrico Logitech con sensor óptico de alta precisión, batería de hasta 18 meses de duración. Diseño ergonómico ambidiestro, rueda de desplazamiento suave. Conectividad USB 2.4GHz plug-and-play. Ideal para oficina y uso diario.",
    marca: "Logitech",
    fecha_creacion: new Date(),
    id_vendedor: "vendor_individual_001",
    multimedia: [
      {
        url: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
        tipo: "imagen"
      },
      {
        url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
        tipo: "imagen"
      }
    ],
    despacho: "retiro_en_tienda",
    precio_envio: 0,
    estado: "activo",
    vendedor: {
      id: "vendor_individual_001",
      nombre: "Carlos Pérez",
      email: "carlos.perez@email.cl",
      tipo: "vendedor",
      telefono: "+56 9 6543 2109"
    }
  },
  {
    id: 5,
    nombre: "Silla Gamer Premium",
    precio: 280,
    categoria: "Muebles",
    condicion: "nuevo",
    stock: 8,
    sku: "CHAIR-GAM-005",
    descripcion: "Silla gamer ergonómica de alta calidad con soporte lumbar ajustable, reposabrazos 4D, respaldo reclinable hasta 180°. Cojines de espuma de alta densidad, base metálica resistente con ruedas silenciosas. Cuero sintético PU fácil de limpiar. Soporta hasta 150kg.",
    marca: "DXRacer",
    fecha_creacion: new Date(),
    id_vendedor: "vendor_muebles_003",
    multimedia: [
      {
        url: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800",
        tipo: "imagen"
      },
      {
        url: "https://images.unsplash.com/photo-1633078654544-61b3455b9161?w=800",
        tipo: "imagen"
      },
      {
        url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800",
        tipo: "imagen"
      },
      {
        url: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800",
        tipo: "imagen"
      }
    ],
    despacho: "ambos",
    precio_envio: 8000,
    estado: "activo",
    vendedor: {
      id: "vendor_muebles_003",
      nombre: "Muebles Modernos",
      email: "info@mueblesmodernos.cl",
      tipo: "tienda",
      telefono: "+56 9 5432 1098"
    }
  },
  {
    id: 6,
    nombre: "Escritorio Ajustable",
    precio: 320,
    categoria: "Muebles",
    condicion: "nuevo",
    stock: 5,
    sku: "DESK-ADJ-006",
    descripcion: "Escritorio ajustable en altura con motor eléctrico",
    marca: "FlexiSpot",
    fecha_creacion: new Date()
  },
  {
    id: 7,
    nombre: "Webcam 1080p HD",
    precio: 55,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 20,
    sku: "WEBCAM-HD-007",
    descripcion: "Webcam Full HD 1080p con micrófono integrado",
    marca: "Logitech",
    fecha_creacion: new Date()
  },
  {
    id: 8,
    nombre: "Headset Gamer Pro",
    precio: 120,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 18,
    sku: "HEADSET-PRO-008",
    descripcion: "Headset gamer con cancelación de ruido y sonido 7.1",
    marca: "SteelSeries",
    fecha_creacion: new Date()
  },
  {
    id: 9,
    nombre: "Hub USB 3.0 (7 puertos)",
    precio: 45,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 22,
    sku: "HUB-USB-009",
    descripcion: "Hub USB 3.0 con 7 puertos independientes",
    marca: "Belkin",
    fecha_creacion: new Date()
  },
  {
    id: 10,
    nombre: "Micrófono Condenser USB",
    precio: 95,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 12,
    sku: "MIC-COND-010",
    descripcion: "Micrófono condenser USB profesional para streaming",
    marca: "Audio-Technica",
    fecha_creacion: new Date()
  },
  {
    id: 11,
    nombre: "Laptop Dell XPS 13",
    precio: 850,
    categoria: "Electrónica",
    condicion: "usado",
    stock: 3,
    sku: "DELL-XPS-011",
    descripcion: "Laptop Dell XPS 13 usada, excelente estado",
    marca: "Dell",
    fecha_creacion: new Date()
  },
  {
    id: 12,
    nombre: "Teclado Inalámbrico",
    precio: 42,
    categoria: "Accesorios",
    condicion: "usado",
    stock: 5,
    sku: "KEY-WIRELESS-012",
    descripcion: "Teclado inalámbrico usado en buen estado",
    marca: "Microsoft",
    fecha_creacion: new Date()
  },
  {
    id: 13,
    nombre: "Monitor 27 pulgadas 144Hz",
    precio: 320,
    categoria: "Electrónica",
    condicion: "nuevo",
    stock: 7,
    sku: "MON-27-144-013",
    descripcion: "Monitor 27 pulgadas para gaming 144Hz",
    marca: "ASUS",
    fecha_creacion: new Date()
  },
  {
    id: 14,
    nombre: "Dock para Laptop",
    precio: 65,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 14,
    sku: "DOCK-LAPTOP-014",
    descripcion: "Dock USB-C para conectar múltiples dispositivos",
    marca: "Anker",
    fecha_creacion: new Date()
  },
  {
    id: 15,
    nombre: "Mousepad Grande",
    precio: 25,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 50,
    sku: "MOUSEPAD-L-015",
    descripcion: "Mousepad XXL con superficie antideslizante",
    marca: "SteelSeries",
    fecha_creacion: new Date()
  },
  {
    id: 16,
    nombre: "SSD Samsung 1TB NVMe",
    precio: 95,
    categoria: "Electrónica",
    condicion: "nuevo",
    stock: 18,
    sku: "SSD-SAM-016",
    descripcion: "Disco SSD NVMe Samsung 1TB alta velocidad",
    marca: "Samsung",
    fecha_creacion: new Date()
  },
  {
    id: 17,
    nombre: "Impresora Multifuncional HP",
    precio: 180,
    categoria: "Electrónica",
    condicion: "nuevo",
    stock: 6,
    sku: "PRINT-HP-017",
    descripcion: "Impresora multifuncional con WiFi y escáner",
    marca: "HP",
    fecha_creacion: new Date()
  },
  {
    id: 18,
    nombre: "Cámara Web 4K Ultra HD",
    precio: 145,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 9,
    sku: "CAM-4K-018",
    descripcion: "Cámara web 4K con enfoque automático y HDR",
    marca: "Razer",
    fecha_creacion: new Date()
  },
  {
    id: 19,
    nombre: "Router WiFi 6 Gaming",
    precio: 220,
    categoria: "Electrónica",
    condicion: "nuevo",
    stock: 11,
    sku: "ROUTER-W6-019",
    descripcion: "Router WiFi 6 tri-banda para gaming y streaming",
    marca: "ASUS",
    fecha_creacion: new Date()
  },
  {
    id: 20,
    nombre: "Lámpara LED de Escritorio",
    precio: 38,
    categoria: "Muebles",
    condicion: "nuevo",
    stock: 27,
    sku: "LAMP-LED-020",
    descripcion: "Lámpara LED ajustable con puerto USB para carga",
    marca: "Philips",
    fecha_creacion: new Date()
  },
  {
    id: 21,
    nombre: "Tarjeta Gráfica RTX 3060",
    precio: 420,
    categoria: "Electrónica",
    condicion: "usado",
    stock: 4,
    sku: "GPU-RTX-021",
    descripcion: "Tarjeta gráfica NVIDIA RTX 3060 12GB usada",
    marca: "NVIDIA",
    fecha_creacion: new Date()
  },
  {
    id: 22,
    nombre: "Soporte para Monitor Doble",
    precio: 75,
    categoria: "Muebles",
    condicion: "nuevo",
    stock: 13,
    sku: "MOUNT-DUAL-022",
    descripcion: "Soporte ajustable para dos monitores hasta 27 pulgadas",
    marca: "Ergotron",
    fecha_creacion: new Date()
  },
  {
    id: 23,
    nombre: "Tablet iPad Air",
    precio: 550,
    categoria: "Electrónica",
    condicion: "nuevo",
    stock: 8,
    sku: "TABLET-IPAD-023",
    descripcion: "iPad Air 10.9 pulgadas con chip M1",
    marca: "Apple",
    fecha_creacion: new Date()
  },
  {
    id: 24,
    nombre: "Auriculares Bluetooth Sony",
    precio: 95,
    categoria: "Accesorios",
    condicion: "nuevo",
    stock: 16,
    sku: "HEADPHONE-SONY-024",
    descripcion: "Auriculares inalámbricos con cancelación de ruido",
    marca: "Sony",
    fecha_creacion: new Date()
  },
  {
    id: 25,
    nombre: "Fuente de Poder 750W 80+ Gold",
    precio: 110,
    categoria: "Electrónica",
    condicion: "nuevo",
    stock: 10,
    sku: "PSU-750W-025",
    descripcion: "Fuente de poder modular 750W certificación 80+ Gold",
    marca: "Corsair",
    fecha_creacion: new Date()
  }
];

// Insertar productos en la colección de productos
db.products.insertMany(productos);

print("✓ Productos insertados correctamente en la colección 'products'");
print("Total de productos: " + productos.length);
