import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  Grid,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Paper,
  Avatar,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import logoPulgaShop from "../../assets/logopulgashop.png";

interface ProductDetail {
  producto: {
    id_producto?: number;
    nombre: string;
    precio: number;
    descripcion: string;
    categoria: string;
    condicion: string;
    stock?: number;
    marca?: string;
    sku?: string;
  };
  vendedor: {
    id: string;
    nombre: string;
    email?: string;
    tipo?: string;
  };
  publicacion?: {
    multimedia: Array<{ url: string; tipo: string }>;
    despacho: string;
    precio_envio: number;
    estado: string;
    fecha_creacion: string;
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        console.log("🔍 Cargando detalle del producto ID:", id);
        const response = await axios.get<ProductDetail>(
          `http://localhost:5610/api/search/products/${id}/detail`
        );
        console.log("✅ Detalle cargado:", response.data);
        setDetalle(response.data);
        // Scroll al inicio de la página al cargar
        window.scrollTo(0, 0);
      } catch (err) {
        console.error("❌ Error al cargar detalle:", err);
        setError("No se pudo cargar la información del producto");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarDetalle();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <AppBar
          position="static"
          sx={{
            backgroundColor: "#386641",
            boxShadow: 2,
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="img"
                src={logoPulgaShop}
                alt="Pulga Shop Logo"
                sx={{
                  height: 40,
                  width: "auto",
                  objectFit: "contain",
                }}
              />
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                Pulga Shop
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </>
    );
  }

  if (error || !detalle) {
    return (
      <>
        <AppBar
          position="static"
          sx={{
            backgroundColor: "#386641",
            boxShadow: 2,
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="img"
                src={logoPulgaShop}
                alt="Pulga Shop Logo"
                sx={{
                  height: 40,
                  width: "auto",
                  objectFit: "contain",
                }}
              />
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                Pulga Shop
              </Typography>
            </Box>
            
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/", { state: { showSearch: true } })}
              sx={{
                color: "white",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              Volver al Buscador
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography color="error" variant="h6">
            {error || "Producto no encontrado"}
          </Typography>
        </Container>
      </>
    );
  }

  const { producto, vendedor, publicacion } = detalle;
  const imagenes = publicacion?.multimedia || [];

  console.log("📦 Renderizando ProductDetail:", { 
    producto: producto?.nombre, 
    vendedor: vendedor?.nombre, 
    imagenes: imagenes.length,
    publicacion: !!publicacion 
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* Header con logo y botón de retroceso */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#386641",
          boxShadow: 2,
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src={logoPulgaShop}
              alt="Pulga Shop Logo"
              sx={{
                height: 40,
                width: "auto",
                objectFit: "contain",
              }}
            />
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              Pulga Shop
            </Typography>
          </Box>
          
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/", { state: { showSearch: true } })}
            sx={{
              color: "white",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            Volver al Buscador
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="lg" sx={{ overflowX: "hidden" }}>
          <Grid container spacing={4}>
          {/* Columna izquierda: Imágenes */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
              {imagenes.length > 0 ? (
                <>
                  <CardMedia
                    component="img"
                    height="400"
                    image={imagenes[imagenActual]?.url}
                    alt={producto.nombre}
                    sx={{ objectFit: "cover" }}
                  />
                  {imagenes.length > 1 && (
                    <Box sx={{ display: "flex", gap: 1, p: 2, overflowX: "auto" }}>
                      {imagenes.map((img, index) => (
                        <Box
                          key={index}
                          onClick={() => setImagenActual(index)}
                          sx={{
                            width: 80,
                            height: 80,
                            cursor: "pointer",
                            border: imagenActual === index ? 3 : 1,
                            borderColor:
                              imagenActual === index ? "primary.main" : "grey.300",
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={img.url}
                            alt={`Vista ${index + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    height: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.200",
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 100, color: "grey.400" }} />
                </Box>
              )}
            </Card>
          </Grid>

          {/* Columna derecha: Información */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Información del producto */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom fontWeight={700}>
                  {producto.nombre}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={producto.categoria}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={producto.condicion}
                    color={producto.condicion === "NUEVO" ? "success" : "warning"}
                    size="small"
                  />
                  {publicacion?.estado && (
                    <Chip label={publicacion.estado} size="small" />
                  )}
                </Stack>

                <Typography
                  variant="h3"
                  color="primary"
                  fontWeight={700}
                  sx={{ mb: 2 }}
                >
                  ${producto.precio.toLocaleString("es-CL")}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" color="text.secondary" paragraph>
                  {producto.descripcion}
                </Typography>

                {producto.marca && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Marca:</strong> {producto.marca}
                  </Typography>
                )}
                {producto.sku && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>SKU:</strong> {producto.sku}
                  </Typography>
                )}
                {producto.stock !== undefined && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Stock disponible:</strong> {producto.stock} unidades
                  </Typography>
                )}
              </Card>

              {/* Información del vendedor/tienda */}
              <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                    {vendedor.tipo === "tienda" ? <StoreIcon /> : <PersonIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {vendedor.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {vendedor.tipo === "tienda" ? "Tienda" : "Vendedor"}
                    </Typography>
                  </Box>
                </Stack>

                {vendedor.email && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Contacto:</strong> {vendedor.email}
                  </Typography>
                )}
              </Card>

              {/* Información de despacho */}
              {publicacion && (
                <Card sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <LocalShippingIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Opciones de entrega
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Tipo de despacho:</strong>{" "}
                    {publicacion.despacho === "ambos"
                      ? "Retiro en tienda o envío a domicilio"
                      : publicacion.despacho === "envio"
                      ? "Solo envío a domicilio"
                      : "Solo retiro en tienda"}
                  </Typography>

                  {publicacion.precio_envio > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Costo de envío:</strong> $
                      {publicacion.precio_envio.toLocaleString("es-CL")}
                    </Typography>
                  )}
                </Card>
              )}

              {/* Botón de acción */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<AttachMoneyIcon />}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                Contactar al vendedor
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Información adicional */}
        {publicacion?.fecha_creacion && (
          <Paper sx={{ mt: 4, p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Publicado el {new Date(publicacion.fecha_creacion).toLocaleDateString("es-CL")}
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
    </Box>
  );
};

export default ProductDetail;
