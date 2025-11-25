import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductList from "../../components/ProductList";

function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Header />
      <Box sx={{ flex: 1 }}>
        <ProductList />
      </Box>
      <Footer />
    </Box>
  );
}

export default Home;