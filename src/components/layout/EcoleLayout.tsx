import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster } from "sonner";
import { SchoolProvider } from "../../contexts/SchoolContext";
import { Taskbar } from "./Taskbar";
import { DocumentationDrawer } from "../docs/DocumentationDrawer";
import { HelpButton } from "../docs/HelpButton";
import "../../index.css";

export function EcoleLayout() {
  const { pathname } = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <SchoolProvider>
      <Toaster position="top-right" richColors closeButton />

      <div className="ecole_m ecole_m-desktop">
        <main className="mx-auto w-full max-w-[1680px] px-4 pb-24 pt-6 md:px-8 md:pt-8">
          <motion.div
            key={pathname.split("/").slice(0, 3).join("/")}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Documentation Contextuelle */}
        <HelpButton onClick={() => setHelpOpen(true)} />
        <DocumentationDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />

        <Taskbar />
      </div>
    </SchoolProvider>
  );
}

export default EcoleLayout;