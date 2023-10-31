import { ThemeOptions } from "@mui/material";
import themeColors from "../styles/pages/app.module.scss";

export const darkThemeOptions: ThemeOptions = {
  palette: {
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
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiFormLabel-root": {
            color: themeColors.lightText,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: themeColors.lightText,
          },
          "& .MuiInputBase-input": {
            color: themeColors.lightText,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(228, 219, 233, 0.25)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(228, 219, 233, 0.25)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(228, 219, 233, 0.25)",
          },
          "&:before .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(228, 219, 233, 0.25)",
          },
          ".MuiSvgIcon-root ": {
            fill: "white !important",
          },
          },
        },
      },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: themeColors.lightText,
        },
      },
    },
    //       "& .MuiInputBase-input": {
    //         color: themeColors.lightText,
    //       },
    //       "& .MuiSelect-icon": {
    //         color: themeColors.lightText,
    //       },
    //       "& .MuiInputLabel-root": {
    //         color: themeColors.lightText,
    //       },
    //       "& .MuiOutlinedInput-notchedOutline": {
    //         color: themeColors.lightText,
    //       },
    //       "& .MuiListItem-root": {
    //         color: themeColors.lightText,
    //       },
    //     },
    //   },
    // },
  },
};