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
  CircularProgress,
  Paper,
  Avatar,
  AppBar,
  Toolbar,
  Rating,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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
    rating?: number;
    numCalificaciones?: number;
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
            <Stack spacing={2}>
              {/* Información principal del producto - COMPACTA */}
              <Card sx={{ p: 2.5 }}>
                <Typography variant="h5" gutterBottom fontWeight={700}>
                  {producto.nombre}
                </Typography>

                {/* Rating */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Rating
                    value={producto.rating || 0}
                    readOnly
                    precision={0.5}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {producto.rating ? `${producto.rating.toFixed(1)}` : "Sin calificaciones"}
                    {producto.numCalificaciones && ` (${producto.numCalificaciones})`}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
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
                  variant="h4"
                  color="primary"
                  fontWeight={700}
                  sx={{ mb: 1 }}
                >
                  ${producto.precio.toLocaleString("es-CL")}
                </Typography>

                {/* Stock info */}
                {producto.stock !== undefined && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mb: 1.5,
                      display: "block",
                      color: producto.stock > 0 ? "success.main" : "error.main",
                      fontWeight: 600
                    }}
                  >
                    {producto.stock > 0 
                      ? `✓ ${producto.stock} unidades disponibles` 
                      : "❌ Sin stock disponible"}
                  </Typography>
                )}

                {producto.marca && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                    <strong>Marca:</strong> {producto.marca}
                  </Typography>
                )}
                {producto.sku && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    <strong>SKU:</strong> {producto.sku}
                  </Typography>
                )}
              </Card>

              {/* Botones de compra - ARRIBA */}
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.2,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    backgroundColor: "#386641",
                    "&:hover": {
                      backgroundColor: "#2d5233",
                    },
                  }}
                  disabled={producto.stock === 0}
                >
                  Comprar Ahora
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  sx={{
                    py: 1.2,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    borderColor: "#386641",
                    color: "#386641",
                    "&:hover": {
                      borderColor: "#2d5233",
                      backgroundColor: "rgba(56, 102, 65, 0.05)",
                    },
                  }}
                  disabled={producto.stock === 0}
                >
                  Agregar al Carrito
                </Button>
              </Stack>

              {producto.stock === 0 && (
                <Paper sx={{ p: 1.5, backgroundColor: "#fff3cd", textAlign: "center" }}>
                  <Typography variant="caption" color="error" fontWeight={600}>
                    ⚠️ Este producto no tiene stock disponible
                  </Typography>
                </Paper>
              )}

              {/* Descripción Detallada */}
              <Card sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Descripción
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, mb: 1.5 }}>
                  {producto.descripcion || "No hay descripción disponible"}
                </Typography>
              </Card>

              {/* Información de despacho */}
              {publicacion && (
                <Card sx={{ p: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <LocalShippingIcon color="primary" sx={{ fontSize: "1.2rem" }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Entrega
                    </Typography>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                    <strong>Tipo:</strong>{" "}
                    {publicacion.despacho === "ambos"
                      ? "Retiro o envío"
                      : publicacion.despacho === "envio"
                      ? "Solo envío"
                      : "Solo retiro"}
                  </Typography>

                  {publicacion.precio_envio > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      <strong>Costo:</strong> ${publicacion.precio_envio.toLocaleString("es-CL")}
                    </Typography>
                  )}
                </Card>
              )}

              {/* Información del vendedor */}
              <Card sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                    {vendedor.tipo === "tienda" ? <StoreIcon /> : <PersonIcon />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {vendedor.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {vendedor.tipo === "tienda" ? "Tienda Oficial" : "Vendedor Particular"}
                    </Typography>
                    {vendedor.email && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {vendedor.email}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default ProductDetail;
