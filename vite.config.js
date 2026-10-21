import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    // ✅ UN SEUL base, en relatif, pour que Tauri trouve les fichiers
    base: './', 
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
});