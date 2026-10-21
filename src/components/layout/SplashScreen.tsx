import React from 'react';
import { motion } from 'framer-motion';
import { Building2Icon, Sparkles } from 'lucide-react';

// Variantes pour les animations en cascade
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    filter: "blur(10px)",
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

export function SplashScreen() {
  return (
    <motion.div
      key="splash"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#edf1f7]"
    >
      {/* ── Arrière-plan dynamique (Formes flottantes) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0, -100, 0],
            y: [0, -100, 100, 50, 0],
            scale: [1, 1.2, 1, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[#0067c0]/10 blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, -150, 50, 100, 0],
            y: [0, 100, -100, -50, 0],
            scale: [1, 1.1, 0.9, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-[#005fb8]/10 blur-[60px]"
        />
      </div>

      {/* ── Contenu central ── */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logo avec anneaux rotatifs */}
        <motion.div variants={itemVariants} className="relative mb-8">
          <div className="relative grid h-28 w-28 place-items-center rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-black/5">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#0067c0] to-[#004a8f] text-white shadow-inner"
            >
              <Building2Icon className="h-8 w-8" strokeWidth={1.8} />
            </motion.div>

            {/* Anneau lumineux rotatif en arrière-plan */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 rounded-[32px] border-2 border-transparent border-t-[#0067c0]/40 border-r-[#0067c0]/10"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-6 rounded-[40px] border border-transparent border-b-[#0067c0]/20 border-l-[#0067c0]/5"
            />
          </div>
        </motion.div>

        {/* Texte avec apparition fluide */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#0067c0]/20 bg-[#0067c0]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[.16em] text-[#0067c0]">
            <Sparkles className="h-3 w-3" />
            Plateforme Éducative
          </div>
          <h1 className="ecole_m-display text-3xl font-bold tracking-tight text-[#1a1d21] sm:text-4xl">
            École Manager
          </h1>
          <p className="mt-3 text-[14px] font-medium text-[#5a6472]">
            Préparation de votre espace de travail...
          </p>
        </motion.div>

        {/* Barre de chargement moderne (Shimmer) */}
        <motion.div variants={itemVariants} className="mt-10 w-64">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#0067c0] to-transparent"
            />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div 
        variants={itemVariants}
        className="absolute bottom-8 flex flex-col items-center gap-1"
      >
        <p className="text-[11px] font-semibold text-[#8b95a3]">
          © {new Date().getFullYear()} École Manager
        </p>
        <p className="text-[10px] font-mono text-[#8b95a3]/60">
          Initialisation du système...
        </p>
      </motion.div>
    </motion.div>
  );
}