import React from "react";
import { Box, Container, Typography, Stack, Link } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#386641",
        color: "white",
        py: 4,
        mt: 6,
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Contenido principal del footer */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={4}
            sx={{
              justifyContent: "space-between",
            }}
          >
            {/* Sección 1: Sobre nosotros */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Sobre Nosotros
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Somos un marketplace dedicado a conectar compradores y vendedores de toda la región con productos de calidad.
              </Typography>
            </Box>

            {/* Sección 2: Enlaces rápidos */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Enlaces Rápidos
              </Typography>
              <Stack spacing={1}>
                <Link
                  href="#"
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline", opacity: 0.8 },
                    fontSize: "0.875rem",
                  }}
                >
                  Términos de servicio
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline", opacity: 0.8 },
                    fontSize: "0.875rem",
                  }}
                >
                  Política de privacidad
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline", opacity: 0.8 },
                    fontSize: "0.875rem",
                  }}
                >
                  Contacto
                </Link>
              </Stack>
            </Box>

            {/* Sección 3: Redes sociales */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Síguenos
              </Typography>
              <Stack direction="row" spacing={2}>
                <Link
                  href="#"
                  sx={{
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Facebook />
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Twitter />
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Instagram />
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <LinkedIn />
                </Link>
              </Stack>
            </Box>
          </Stack>

          {/* Línea divisora */}
          <Box
            sx={{
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              pt: 3,
            }}
          >
            {/* Copyright */}
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                opacity: 0.7,
              }}
            >
              © {new Date().getFullYear()} Marketplace. Todos los derechos reservados.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
