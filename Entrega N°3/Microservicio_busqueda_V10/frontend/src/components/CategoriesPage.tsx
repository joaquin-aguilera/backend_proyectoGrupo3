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
import { ArrowForward } from "@mui/icons-material";

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
  return (
    <Card
      onClick={() => onSelect(name)}
      sx={{
        height: "100%",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "none",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
          "& .category-image": {
            transform: "scale(1.08)",
          },
        },
      }}
    >
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="280"
          image={image}
          alt={name}
          className="category-image"
          sx={{
            objectFit: "cover",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)",
            transition: "all 0.3s ease",
          }}
        />
        {/* Badge con cantidad de productos */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            px: 2,
            py: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            {productCount} productos
          </Typography>
        </Box>
      </Box>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3 }}>
        <Typography
          gutterBottom
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 1, color: "#1a1a1a" }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, flex: 1, fontSize: "0.9rem", lineHeight: 1.5 }}
        >
          {description}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            color: "primary.main",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          <Typography variant="button" sx={{ fontWeight: 600 }}>
            Explorar
          </Typography>
          <ArrowForward sx={{ fontSize: 20, transition: "transform 0.3s" }} />
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
            imagen: "http://localhost:5610/api/images/categories/Aleatorio.jpg",
            totalProductos: totalProductos // Mostramos el total
          },
          {
            nombre: "TODO",
            imagen: "http://localhost:5610/api/images/categories/Todo.jpg",
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
          py: 8,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 8,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg">
        {/* Encabezado */}
        <Stack spacing={3} sx={{ mb: 8, textAlign: "center" }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              color: "#386641",
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "3rem" },
            }}
          >
            Explora Nuestras Categorías
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              fontSize: { xs: "0.9rem", md: "1.1rem" },
            }}
          >
            Descubre miles de productos en las categorías que más te interesan
          </Typography>
        </Stack>

        {/* Grid de categorías */}
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} lg={4} key={category.nombre}>
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
