import type { AppProps } from "next/app";
import { QueryClientProvider, QueryClient } from "react-query";
import { ThemeOptions, ThemeProvider, createTheme } from "@mui/material/styles";
import "../styles/global.scss";
import themeColors from "../styles/pages/app.module.scss";

export default function App({ Component, pageProps }: AppProps) {
  const darkThemeOptions: ThemeOptions = {
    palette: {
      primary: {
        main: themeColors.primary,
      },
      secondary: {
        main: themeColors.secondary,
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
