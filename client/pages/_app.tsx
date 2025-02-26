import type { AppProps } from "next/app";
import { QueryClientProvider, QueryClient } from "react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "../styles/global.scss";
import Header from "@/components/header";
import { AuthContextProvider } from "@/contexts/authContext";
import { darkThemeOptions } from "@/styles/theme";
import { AudioContextProvider } from "@/contexts/audioContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={createTheme(darkThemeOptions)}>
      <QueryClientProvider client={new QueryClient()}>
        <AuthContextProvider>
          <AudioContextProvider>
            <Header />
            <Component {...pageProps} />
          </AudioContextProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
