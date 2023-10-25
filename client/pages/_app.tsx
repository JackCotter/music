import type { AppProps } from "next/app";
import { QueryClientProvider, QueryClient } from "react-query";
import { ThemeOptions, ThemeProvider, createTheme } from "@mui/material/styles";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const darkThemeOptions: ThemeOptions = {
    palette: {
      primary: {
        main: "#3f51b5",
      },
      secondary: {
        main: "#f5f242",
      },
      background: {
        default: "#2d2c2c",
        paper: "#121212",
      },
    },
  };

  return (
    <ThemeProvider theme={createTheme(darkThemeOptions)}>
      <QueryClientProvider client={new QueryClient()}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
