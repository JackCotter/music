import { ThemeOptions } from "@mui/material";
import themeColors from "../styles/pages/app.module.scss";

export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: themeColors.primary,
    },
    secondary: {
      main: themeColors.secondary,
    },
    background: {
      paper: themeColors.paper,
    },
    text: {
      primary: themeColors.lightText,
      secondary: themeColors.lightText,
    },
  },
};