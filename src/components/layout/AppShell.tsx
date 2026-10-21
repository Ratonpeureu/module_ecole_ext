import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Taskbar } from "./Taskbar";

export function AppShell() {
  const { pathname } = useLocation();
  return (
    <div className="ecole_m ecole_m-desktop">
      <main className="mx-auto w-full max-w-[1680px] px-4 pb-24 pt-6 md:px-8 md:pt-8">
        <motion.div
          key={pathname.split("/").slice(0, 3).join("/")}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
          
          <Outlet />
        </motion.div>
      </main>
      <Taskbar />
    </div>);

}