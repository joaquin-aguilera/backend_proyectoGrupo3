import { useRef } from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductList from "../../components/ProductList";

function Home() {
  const productListRef = useRef<{ handleBackToCategories: () => void } | null>(null);

  const handleLogoClick = () => {
    productListRef.current?.handleBackToCategories();
  };

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
      <Header onLogoClick={handleLogoClick} />
      <Box sx={{ flex: 1 }}>
        <ProductList ref={productListRef} />
      </Box>
      <Footer />
    </Box>
  );
}

export default Home;