import { ThemeOptions } from "@mui/material/styles";

/**
 * Configuración de tema personalizada para pulga-shop-ui
 * Puede ser usado como: getPulgaTheme(customTheme)
 */
export const customThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#002E38",
      light: "#003c58",
      dark: "#0d1d1e",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1f4d5d",
      light: "#327d96",
      dark: "#0c1f25",
      contrastText: "#ffffff",
    },
    success: {
      main: "#28a745",
    },
    warning: {
      main: "#ffc107",
    },
    error: {
      main: "#dc3545",
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
  },
};

export default customThemeOptions;
