import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Badge } from "@mui/material";
import { ShoppingCart, Person } from "@mui/icons-material";
import logoPulgaShop from "../assets/logopulgashop.png";

interface HeaderProps {
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#386641",
        boxShadow: 2,
        top: 0,
        zIndex: 1100,
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
        {/* Logo y Nombre - Clickeable */}
        <Box
          onClick={onLogoClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            transition: "opacity 0.3s ease",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
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

        {/* Iconos a la Derecha */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Icono Perfil */}
          <IconButton
            size="large"
            aria-label="perfil"
            sx={{
              color: "white",
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            <Person />
          </IconButton>

          {/* Icono Carrito */}
          <IconButton
            size="large"
            aria-label="carrito"
            sx={{
              color: "white",
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            <Badge badgeContent={0} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
