import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";

import App from "./App";

// Call `extendTheme` and pass your custom values
const theme = extendTheme({
  useSystemColorMode: true,
  initialColorMode: "dark",
  styles: {
    global: {
      "#root": {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root?.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
