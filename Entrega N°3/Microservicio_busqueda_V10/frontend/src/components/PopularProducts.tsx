import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  LocalShipping,
  TrendingUp,
} from "@mui/icons-material";
import { Product } from "../types";

interface TopProduct {
  productId: string;
  searchCount: number;
  lastSearched: string;
  producto: Product;
}

interface PopularProductsProps {
  onProductClick?: (producto: Product) => void;
}

const PopularProducts: React.FC<PopularProductsProps> = ({ onProductClick }) => {
  const [productos, setProductos] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const cargarProductosPopulares = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5610/api/analytics/top-products?limit=6"
        );
        setProductos(response.data.productos || []);
      } catch (err) {
        console.error("Error al cargar productos populares:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarProductosPopulares();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("popular-products-scroll");
    if (container) {
      const scrollAmount = 300;
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;

      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      setScrollPosition(newPosition);
    }
  };

  const formatearPrecio = (precio: number): string => {
    const precioEnDolares = precio >= 100 ? precio / 100 : precio;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precioEnDolares);
  };

  const getCondicionColor = (
    condicion: string
  ): "success" | "warning" | "info" | "default" => {
    switch (condicion.toUpperCase()) {
      case "NUEVO":
        return "success";
      case "USADO":
        return "warning";
      case "REACONDICIONADO":
        return "info";
      default:
        return "default";
    }
  };

  if (loading || productos.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 4, backgroundColor: "#f9f9f9" }}>
      <Box sx={{ maxWidth: "lg", mx: "auto", px: 3 }}>
        {/* Encabezado */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <TrendingUp sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Productos Más Populares
          </Typography>
        </Stack>

        {/* Contenedor de productos con scroll */}
        <Box sx={{ position: "relative" }}>
          {/* Botón scroll izquierda */}
          <IconButton
            onClick={() => handleScroll("left")}
            disabled={scrollPosition <= 0}
            sx={{
              position: "absolute",
              left: -20,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: "white",
              },
              "&.Mui-disabled": {
                display: "none",
              },
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Scroll container */}
          <Box
            id="popular-products-scroll"
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 2,
              pb: 2,
              scrollbarWidth: "thin",
              scrollbarColor: "#bbb #f0f0f0",
              "&::-webkit-scrollbar": {
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#bbb",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "#999",
                },
              },
            }}
          >
            {productos.map((item) => (
              <Card
                key={item.productId}
                onClick={() => onProductClick?.(item.producto)}
                sx={{
                  position: "relative",
                  minWidth: 280,
                  maxWidth: 280,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {/* Badge de popularidad */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 1,
                  }}
                >
                  <Chip
                    icon={<TrendingUp sx={{ fontSize: 16 }} />}
                    label={`${item.searchCount} búsqueda${item.searchCount !== 1 ? 's' : ''}`}
                    size="small"
                    color="error"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>

                {/* Badge de condición */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1,
                  }}
                >
                  <Chip
                    label={item.producto.condicion}
                    size="small"
                    color={getCondicionColor(item.producto.condicion)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                {/* Imagen */}
                {item.producto.imagen ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={item.producto.imagen}
                    alt={item.producto.nombre}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 180,
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h4" color="text.disabled">
                      📦
                    </Typography>
                  </Box>
                )}

                <CardContent sx={{ pt: 2 }}>
                  {/* Marca */}
                  {item.producto.marca && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "text.secondary",
                        mb: 0.5,
                        fontWeight: 500,
                        textTransform: "uppercase",
                      }}
                    >
                      {item.producto.marca}
                    </Typography>
                  )}

                  {/* Nombre */}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.3,
                      minHeight: "2.6em",
                    }}
                  >
                    {item.producto.nombre}
                  </Typography>

                  {/* Precio */}
                  <Typography
                    variant="h6"
                    sx={{
                      color: "primary.main",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {formatearPrecio(item.producto.precio)}
                  </Typography>

                  {/* Stock */}
                  {item.producto.stock !== undefined && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocalShipping
                        sx={{
                          fontSize: "1rem",
                          color:
                            item.producto.stock > 0
                              ? "success.main"
                              : "error.main",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          color:
                            item.producto.stock > 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {item.producto.stock > 0
                          ? `${item.producto.stock} disponible${item.producto.stock !== 1 ? "s" : ""}`
                          : "Sin stock"}
                      </Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Botón scroll derecha */}
          <IconButton
            onClick={() => handleScroll("right")}
            sx={{
              position: "absolute",
              right: -20,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default PopularProducts;
