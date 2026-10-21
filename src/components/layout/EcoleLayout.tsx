import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster } from "sonner";
import { SchoolProvider } from "../../contexts/SchoolContext";
import { Taskbar } from "./Taskbar";
import { StatusBar } from "./StatusBar";
import { CommandPalette } from "./CommandPalette";
import { DocumentationDrawer } from "../docs/DocumentationDrawer";
import { HelpButton } from "../docs/HelpButton";
import { modules } from "../../data/modules";
import "../../index.css";

export function EcoleLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);

  // Raccourcis Clavier Globaux (Ctrl+1 à Ctrl+9 pour les modules)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const shortcuts = modules.slice(0, 9); // Prend les 9 premiers modules
        if (shortcuts[index]) {
          navigate(shortcuts[index].path);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <SchoolProvider>
      <Toaster position="top-right" richColors closeButton />
      <CommandPalette />

      {/* Layout principal : prend tout l'écran */}
      <div className="ecole_m ecole_m-desktop flex h-full flex-col bg-[var(--em-bg)]">
        
        {/* Zone de contenu principale avec pb-20 pour laisser la place à la Taskbar + StatusBar */}
        <main className="flex-1 overflow-hidden pb-20 relative">
          <div className="h-full overflow-y-auto ecole_m-scroll">
            <motion.div
              key={pathname.split("/").slice(0, 3).join("/")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="h-full p-4 md:p-6 lg:p-8"
            >
              <Outlet />
            </motion.div>
          </div>
        </main>

        <StatusBar />
        <HelpButton onClick={() => setHelpOpen(true)} />
        <DocumentationDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
        <Taskbar />
      </div>
    </SchoolProvider>
  );
}

export default EcoleLayout;