import { useState, FormEvent, useEffect, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ProductFilters from "./ProductFilters";
import CategoriesPage from "./CategoriesPage";
import PopularProducts from "./PopularProducts";
import ErrorAlert from "./ErrorAlert";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Product, FilterState, Sugerencia } from "../types";

const ProductList = forwardRef<{ handleBackToCategories: () => void }>((_props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showSearch = (location.state as { showSearch?: boolean })?.showSearch;
  const [showCategories, setShowCategories] = useState(!showSearch);
  const [categorySelected, setCategorySelected] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    precio: "",
    categoria: "",
    condicion: "",
    ordenPrecio: "",
  });

  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [searchId, setSearchId] = useState<string | null>(null);

  // Exponer el método handleBackToCategories al componente padre
  useImperativeHandle(ref, () => ({
    handleBackToCategories,
  }));

  // Cargar todos los productos al montar el componente
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Product[]>(
          "http://localhost:5610/api/search/products/all"
        );
        setProductos(response.data);
      } catch (err) {
        setError("Error al cargar los productos");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // Ejecutar búsqueda cuando cambian los filtros (excepto search que se maneja con el botón)
  useEffect(() => {
    // Solo ejecutar si hay algún filtro activo (no search)
    if (filters.precio || filters.categoria || filters.condicion || filters.ordenPrecio) {
      buscarProductos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.precio, filters.categoria, filters.condicion, filters.ordenPrecio]);

  // Buscar productos cuando se selecciona una categoría
  useEffect(() => {
    if (categorySelected && filters.categoria) {
      buscarProductos();
      setCategorySelected(false);
    }
  }, [categorySelected]);

  const buscarProductos = async (e?: FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setSugerencias([]);

    try {
      // Si no hay filtros, mostrar todos los productos
      if (
        !filters.search.trim() &&
        !filters.precio &&
        !filters.categoria &&
        !filters.condicion &&
        !filters.ordenPrecio
      ) {
        const response = await axios.get<Product[]>(
          "http://localhost:5610/api/search/products/all"
        );
        setProductos(response.data);
        return;
      }

      // Manejo especial para la categoría "SORPRENDEME"
      if (filters.categoria === "SORPRENDEME") {
        const response = await axios.get(
          "http://localhost:5610/api/search/products/random",
          {
            params: { limite: 20 }
          }
        );
        
        const responseData = response.data;
        const productos = responseData.productos || responseData;
        setProductos(productos);
        return;
      }

      const searchParams: Record<string, string> = {};

      if (filters.search.trim()) {
        searchParams.busqueda = filters.search.trim();
      }

      if (filters.precio && filters.precio !== "")
        searchParams.precio = filters.precio;
      if (filters.categoria && filters.categoria !== "")
        searchParams.categoria = filters.categoria;
      if (filters.condicion && filters.condicion !== "")
        searchParams.condicion = filters.condicion;
      if (filters.ordenPrecio && filters.ordenPrecio !== "")
        searchParams.ordenar = filters.ordenPrecio;

      const response = await axios.get<Product[]>(
        `http://localhost:5610/api/search/products`,
        {
          params: searchParams,
        }
      );

      // El backend ahora retorna { productos, metadata: { searchId, total } }
      // Si es el formato nuevo, usar productos del objeto, sino usar response.data directamente
      const responseData = response.data as any;
      const productos = responseData.productos || responseData;
      const metadata = responseData.metadata;

      setProductos(productos);

      // Guardar el searchId si viene en la respuesta (para tracking de clicks)
      if (metadata?.searchId) {
        setSearchId(metadata.searchId);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || "Error al realizar la búsqueda"
        );
      } else {
        setError("Error al realizar la búsqueda");
        console.error("Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    if (!value.trim()) {
      setSugerencias([]);
    }
  };

  const handleSelectCategory = (category: string) => {
    // Si es "TODO", no establecer filtro de categoría (mostrar todos)
    if (category === "TODO") {
      setFilters((prev) => ({ ...prev, categoria: "" }));
    } else {
      setFilters((prev) => ({ ...prev, categoria: category }));
    }
    setShowCategories(false);
    setCategorySelected(true);
  };

  const handleBackToCategories = () => {
    setShowCategories(true);
    handleClearFilters();
  };

  const handleProductClick = async (producto: Product) => {
    console.log("🔍 Click en producto:", producto.id_producto, producto.nombre);
    
    // Registrar el click solo si hay un searchId válido
    if (searchId) {
      try {
        await axios.post("http://localhost:5610/api/search/clicks", {
          searchId: searchId,
          productId: producto.id_producto.toString(),
        });
        console.log(`Click registrado para producto: ${producto.nombre}`);
      } catch (err) {
        console.error("Error al registrar click:", err);
      }
    }
    
    // Navegar al detalle del producto, pasando el estado de navegación
    console.log("🚀 Navegando a:", `/producto/${producto.id_producto}`);
    navigate(`/producto/${producto.id_producto}`, {
      state: { fromCategories: showCategories }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector(
        ".search-input-container"
      );
      if (
        searchContainer &&
        !searchContainer.contains(event.target as Node)
      ) {
        setSugerencias([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const obtenerSugerencias = async (texto: string) => {
    if (!texto.trim()) {
      setSugerencias([]);
      return;
    }
    try {
      const response = await axios.get<Sugerencia[]>(
        `http://localhost:5610/api/search/suggestions?texto=${texto}`
      );
      setSugerencias(response.data);
    } catch (err) {
      console.error("Error al obtener sugerencias:", err);
      setSugerencias([]);
    }
  };

  const handleSugerenciaClick = async (sugerencia: Sugerencia) => {
    if (sugerencia.tipo === "historial" && sugerencia.filtros) {
      setFilters((prev) => ({
        ...prev,
        ...sugerencia.filtros,
        search: sugerencia.texto,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        search: sugerencia.texto,
      }));
    }
    setSugerencias([]);

    await buscarProductos();
  };

  const handleClearFilters = async () => {
    setFilters({
      search: "",
      precio: "",
      categoria: "",
      condicion: "",
      ordenPrecio: "",
    });
    setSugerencias([]);
    
    // Cargar todos los productos
    setLoading(true);
    try {
      const response = await axios.get<Product[]>(
        "http://localhost:5610/api/search/products/all"
      );
      setProductos(response.data);
    } catch (err) {
      setError("Error al cargar los productos");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCondicionColor = (
    condicion: string
  ): "success" | "warning" | "error" | "info" | "default" | undefined => {
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

  const getCondicionLabel = (condicion: string): string => {
    switch (condicion.toUpperCase()) {
      case "NUEVO":
        return "✓ Nuevo";
      case "USADO":
        return "↻ Usado";
      case "REACONDICIONADO":
        return "⚙ Recondicionado";
      default:
        return condicion;
    }
  };

  const formatearPrecio = (precio: number): string => {
    // Si el precio está en centavos (>= 100), convertir a dólares
    const precioEnDolares = precio >= 100 ? precio / 100 : precio;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precioEnDolares);
  };

  return (
    <>
      {showCategories ? (
        <>
          <CategoriesPage onSelectCategory={handleSelectCategory} />
          <PopularProducts onProductClick={handleProductClick} />
        </>
      ) : (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box component="form" onSubmit={buscarProductos} sx={{ mb: 4 }}>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onSearchInput={obtenerSugerencias}
              sugerencias={sugerencias}
              onSugerenciaClick={handleSugerenciaClick}
              onClearFilters={handleClearFilters}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              type="submit"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {loading ? "Buscando..." : "Buscar Productos"}
            </Button>
          </Box>

          {error && (
            <ErrorAlert
              message={error}
              onClose={() => setError("")}
              sx={{ mb: 3 }}
            />
          )}

          {loading && !productos.length ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <CircularProgress />
                <Typography variant="body1" color="text.secondary">
                  Cargando productos...
                </Typography>
              </Stack>
            </Box>
          ) : productos.length > 0 ? (
            <>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "text.secondary", fontWeight: 500 }}
              >
                {productos.length} producto{productos.length !== 1 ? "s" : ""}{" "}
                encontrado{productos.length !== 1 ? "s" : ""}
              </Typography>
              <Grid container spacing={3}>
                {productos.map((producto) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={`${producto.id_producto}-${producto.sku}`}
                  >
                    <Card
                      onClick={() => handleProductClick(producto)}
                      sx={{
                        position: "relative",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          transform: "translateY(-8px)",
                        },
                        overflow: "hidden",
                      }}
                    >
                      {/* Imagen del producto */}
                      {producto.imagen ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={producto.imagen}
                          alt={producto.nombre}
                          sx={{
                            objectFit: "cover",
                            backgroundColor: "#f5f5f5",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 200,
                            backgroundColor: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <InventoryIcon
                            sx={{ fontSize: 60, color: "#ccc" }}
                          />
                        </Box>
                      )}

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
                          label={getCondicionLabel(producto.condicion)}
                          size="small"
                          color={getCondicionColor(producto.condicion)}
                          variant="filled"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>

                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        {/* Marca */}
                        {producto.marca && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              mb: 0.5,
                              fontWeight: 500,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {producto.marca}
                          </Typography>
                        )}

                        {/* Nombre del producto */}
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            mb: 1,
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.4,
                            color: "#1a1a1a",
                          }}
                        >
                          {producto.nombre}
                        </Typography>

                        {/* Descripción */}
                        {producto.descripcion && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              fontSize: "0.85rem",
                              lineHeight: 1.3,
                            }}
                          >
                            {producto.descripcion}
                          </Typography>
                        )}

                        {/* Precio */}
                        <Typography
                          variant="h5"
                          sx={{
                            color: "primary.main",
                            fontWeight: 700,
                            mb: 2,
                            fontSize: "1.5rem",
                          }}
                        >
                          {formatearPrecio(producto.precio)}
                        </Typography>

                        {/* Stock e Información */}
                        <Stack spacing={1} sx={{ mb: 2 }}>
                          {/* Categoría */}
                          <Chip
                            label={`📦 ${producto.categoria}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: "0.8rem",
                              height: "auto",
                              "& .MuiChip-label": { px: 1, py: 0.5 },
                            }}
                          />

                          {/* Stock */}
                          {producto.stock !== undefined && (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <LocalShippingIcon
                                sx={{
                                  fontSize: "1rem",
                                  color:
                                    producto.stock > 0
                                      ? "success.main"
                                      : "error.main",
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 500,
                                  color:
                                    producto.stock > 0
                                      ? "success.main"
                                      : "error.main",
                                }}
                              >
                                {producto.stock > 0
                                  ? `${producto.stock} disponible${producto.stock !== 1 ? "s" : ""}`
                                  : "Sin stock"}
                              </Typography>
                            </Stack>
                          )}

                          {/* SKU */}
                          {producto.sku && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                color: "text.disabled",
                              }}
                            >
                              SKU: {producto.sku}
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              <InventoryIcon
                sx={{
                  fontSize: 64,
                  color: "text.disabled",
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                No se encontraron productos
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Intenta con otros términos de búsqueda o modifica los filtros
              </Typography>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ borderRadius: "6px" }}
              >
                Limpiar Filtros
              </Button>
            </Paper>
          )}
        </Container>
      )}
    </>
  );
});

ProductList.displayName = 'ProductList';

export default ProductList;

