import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import logoPulgaShop from "../assets/logopulgashop.png";

const Header: React.FC = () => {
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
  );
};

export default Header;
