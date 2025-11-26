import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";
import { ArrowForward, Star } from "@mui/icons-material";

interface Category {
  nombre: string;
  imagen: string | null;
  totalProductos: number;
}

interface CategoryCardProps {
  name: string;
  description: string;
  image: string;
  productCount: number;
  onSelect: (category: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  description,
  image,
  productCount,
  onSelect,
}) => {
  // Colores por categoría para badges
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      "SORPRENDEME": "#FF6B6B",
      "TODO": "#4ECDC4",
      "ELECTRÓNICA": "#3498DB",
      "ROPA": "#E91E63",
      "CALZADO": "#FF9800",
      "HOGAR": "#9C27B0",
      "DEPORTES": "#4CAF50",
      "BELLEZA": "#FFC0CB",
      "JUGUETES": "#FFD700",
      "LIBROS": "#8B4513",
      "ALIMENTOS": "#FF6B35",
      "OFICINA": "#607D8B",
      "AUTOMOTRIZ": "#424242",
      "MASCOTAS": "#A1887F",
      "GENERAL": "#757575",
    };
    return colors[category] || "#386641";
  };

  const isFeatured = name === "SORPRENDEME" || name === "TODO";

  return (
    <Card
      onClick={() => onSelect(name)}
      sx={{
        height: "100%",
        cursor: "pointer",
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        border: "none",
        borderRadius: isFeatured ? "16px" : "12px",
        overflow: "hidden",
        boxShadow: isFeatured 
          ? "0 8px 24px rgba(56, 102, 65, 0.2)" 
          : "0 4px 12px rgba(0,0,0,0.1)",
        background: isFeatured 
          ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))" 
          : "white",
        "&:hover": {
          transform: isFeatured ? "translateY(-16px) scale(1.02)" : "translateY(-12px)",
          boxShadow: isFeatured
            ? "0 16px 32px rgba(56, 102, 65, 0.3)"
            : "0 12px 24px rgba(0,0,0,0.15)",
          "& .category-image": {
            transform: "scale(1.12)",
          },
          "& .explore-button": {
            transform: "translateX(6px)",
          },
        },
      }}
    >
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          height={isFeatured ? "320" : "280"}
          image={image}
          alt={name}
          className="category-image"
          sx={{
            objectFit: "cover",
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isFeatured
              ? "linear-gradient(135deg, rgba(56, 102, 65, 0.15) 0%, rgba(0,0,0,0.25) 100%)"
              : "linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)",
            transition: "all 0.3s ease",
          }}
        />

        {/* Badge de productos */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: getCategoryColor(name),
            borderRadius: "20px",
            px: 2,
            py: 0.75,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "white",
              fontSize: "0.8rem",
            }}
          >
            {productCount} productos
          </Typography>
        </Box>

        {/* Badge featured */}
        {isFeatured && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              px: 1.5,
              py: 0.5,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Star sx={{ fontSize: "0.9rem", color: "#FFD700" }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "#FF6B6B",
                fontSize: "0.75rem",
              }}
            >
              {name === "SORPRENDEME" ? "ESPECIAL" : "TODO"}
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: isFeatured ? 3 : 2.5 }}>
        <Typography
          gutterBottom
          variant={isFeatured ? "h5" : "h6"}
          component="h2"
          sx={{
            fontWeight: isFeatured ? 800 : 700,
            mb: 1,
            color: getCategoryColor(name),
            fontSize: isFeatured ? "1.4rem" : "1.1rem",
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: isFeatured ? 3 : 2.5,
            flex: 1,
            fontSize: isFeatured ? "0.95rem" : "0.85rem",
            lineHeight: 1.6,
            fontWeight: 500,
          }}
        >
          {description}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          className="explore-button"
          sx={{
            color: getCategoryColor(name),
            fontWeight: 700,
            fontSize: isFeatured ? "1rem" : "0.9rem",
            transition: "transform 0.3s ease",
          }}
        >
          <Typography variant="button" sx={{ fontWeight: 700 }}>
            Explorar
          </Typography>
          <ArrowForward sx={{ fontSize: isFeatured ? 22 : 18, transition: "transform 0.3s" }} />
        </Stack>
      </CardContent>
    </Card>
  );
};

interface CategoriesPageProps {
  onSelectCategory: (category: string) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapeo de descripciones para cada categoría
  const categoryDescriptions: Record<string, string> = {
    "SORPRENDEME": "¿Indeciso? Descubre productos increíbles seleccionados aleatoriamente para ti",
    "TODO": "Explora todos los productos disponibles en nuestra tienda",
    "ELECTRÓNICA": "Computadoras, smartphones, tablets y accesorios tecnológicos de última generación",
    "ROPA": "Ropa de moda para hombre, mujer y niños de los mejores diseñadores",
    "CALZADO": "Zapatos, zapatillas y botas para todas las ocasiones y estilos",
    "HOGAR": "Muebles, decoración y accesorios para tu hogar moderno y confortable",
    "DEPORTES": "Equipamiento deportivo y ropa de actividad física para tu bienestar",
    "BELLEZA": "Productos de cuidado personal, cosmética y accesorios de belleza premium",
    "JUGUETES": "Juguetes educativos y de entretenimiento para todas las edades",
    "LIBROS": "Literatura, libros educativos y de entretenimiento",
    "ALIMENTOS": "Productos alimenticios de alta calidad",
    "OFICINA": "Suministros y equipamiento para tu oficina",
    "AUTOMOTRIZ": "Accesorios y productos para tu vehículo",
    "MASCOTAS": "Todo lo que necesita tu mascota",
    "GENERAL": "Productos variados de diferentes categorías",
  };

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await axios.get<Category[]>(
          "http://localhost:5610/api/categories"
        );
        
        // Calcular el total de productos
        const totalProductos = response.data.reduce((sum, cat) => sum + cat.totalProductos, 0);
        
        // Convertir URLs relativas a absolutas y agregar las categorías especiales
        const categoriasConEspeciales: Category[] = [
          {
            nombre: "SORPRENDEME",
            imagen: "http://localhost:5610/api/images/categories/Aleatorio.svg",
            totalProductos: totalProductos // Mostramos el total
          },
          {
            nombre: "TODO",
            imagen: "http://localhost:5610/api/images/categories/Todo.svg",
            totalProductos: totalProductos
          },
          ...response.data.map(cat => ({
            ...cat,
            imagen: cat.imagen 
              ? (cat.imagen.startsWith('http') 
                  ? cat.imagen 
                  : `http://localhost:5610${cat.imagen}`)
              : null
          }))
        ];
        
        setCategories(categoriasConEspeciales);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        // Mantener categorías estáticas como fallback
      } finally {
        setLoading(false);
      }
    };

    cargarCategorias();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafb 25%, #f0f4f8 50%, #e8f0f7 75%, #e0ecf7 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} sx={{ color: "#386641" }} />
          <Typography color="text.secondary" fontWeight={600}>
            Cargando categorías...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafb 25%, #f0f4f8 50%, #e8f0f7 75%, #e0ecf7 100%)",
        py: { xs: 6, md: 10 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(56, 102, 65, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(52, 211, 153, 0.06) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Encabezado Profesional */}
        <Box sx={{ mb: { xs: 6, md: 10 }, textAlign: "center", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Título Principal con mejor jerarquía */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              background: "linear-gradient(135deg, #1a3a24 0%, #386641 30%, #2d5233 70%, #1a3a24 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2.8rem", sm: "3.2rem", md: "4.2rem" },
              lineHeight: { xs: 1.2, md: 1.15 },
              letterSpacing: "-1px",
              fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
              mb: 3,
            }}
          >
            Explora Nuestras Categorías
          </Typography>

          {/* Descripción mejorada */}
          <Typography
            variant="body1"
            sx={{
              color: "#2c3e50",
              fontWeight: 600,
              fontSize: { xs: "1rem", md: "1.2rem" },
              lineHeight: 1.8,
              letterSpacing: "0.3px",
              maxWidth: "700px",
            }}
          >
            Descubre <span style={{ color: "#386641", fontWeight: 800 }}>miles de productos</span> de calidad
            <br />
            en las categorías que más te interesan
          </Typography>
        </Box>

        {/* Grid de categorías */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {categories.map((category, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              key={category.nombre}
              sx={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                "@keyframes fadeInUp": {
                  from: {
                    opacity: 0,
                    transform: "translateY(20px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              <CategoryCard
                name={category.nombre}
                description={categoryDescriptions[category.nombre] || "Explora esta categoría"}
                image={category.imagen || `http://localhost:5610/api/images/categories/${category.nombre}.jpg`}
                productCount={category.totalProductos}
                onSelect={onSelectCategory}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CategoriesPage;
