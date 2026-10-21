import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Détecte si on compile pour Tauri
  const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined;

  return {
    plugins: [react()],
    
    // ✅ SI Tauri : './' (chemins relatifs pour l'AppImage)
    // ✅ SI Web : '/ecole/' (chemins absolus pour le serveur Nginx)
    base: isTauri ? './' : '/ecole/', 

    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/auth": { target: "https://rhmanager.site", changeOrigin: true, secure: false },
        "/api": { target: "https://rhmanager.site", changeOrigin: true, secure: false },
        "/abonnement": { target: "https://rhmanager.site", changeOrigin: true, secure: false },
      },
    },
  };
});