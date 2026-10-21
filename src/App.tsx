import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Auth & Contexts
import { AuthProvider, useAuth } from './lib/auth';
import { AbonnementProvider, useAbonnement } from './lib/AbonnementContext';

// Layout & Guards
import { TitleBar } from './components/layout/TitleBar';
import { RequireAuth } from './components/layout/RequireAuth';
import { SplashScreen } from './components/layout/SplashScreen';
import { EcoleLayout } from './components/layout/EcoleLayout';

// Composants Abonnement
import { AbonnementGuard } from './abonnement/src/components/AbonnementGuard';
import { TrialBanner } from './abonnement/src/components/TrialBanner';
import AbonnementPage from './abonnement/src/pages/AbonnementPage';
import AbonnementUpgradePage from './abonnement/src/pages/AbonnementUpgradePage';
import AbonnementVirementPage from './abonnement/src/pages/VirementPage';
import PaypalSuccessPage from './abonnement/src/pages/PaypalSuccessPage';
import PaypalCancelPage from './abonnement/src/pages/PaypalCancelPage';
import AbonnementExpirePage from './abonnement/src/pages/AbonnementExpirePage';
import AbonnementDashboardPage from './abonnement/src/pages/DashboardPage';
import ProfilPage from './pages/Profil';

// Pages Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Pages École
import { Dashboard as EcoleDashboard } from './pages/Dashboard';
import { Parametres } from './pages/Parametres';
import { Registres } from './pages/Registres';
import { NotFound } from './pages/NotFound';

// Pédagogie
import { Analyses } from './pages/pedagogie/Analyses';
import { Bulletins } from './pages/pedagogie/Bulletins';
import { Classes } from './pages/pedagogie/Classes';
import { Devoirs } from './pages/pedagogie/Devoirs';
import { EmploiDuTemps } from './pages/pedagogie/EmploiDuTemps';
import { Notes } from './pages/pedagogie/Notes';
import { Presences } from './pages/pedagogie/Presences';

// Personnes
import { Admissions } from './pages/personnes/Admissions';
import { Eleves } from './pages/personnes/Eleves';
import { Enseignants } from './pages/personnes/Enseignants';
import { Parents } from './pages/personnes/Parents';

// Services
import { Bibliotheque } from './pages/services/Bibliotheque';
import { Cartes } from './pages/services/Cartes';
import { Discipline } from './pages/services/Discipline';
import { Finance } from './pages/services/Finance';
import { Infirmerie } from './pages/services/Infirmerie';
import { Patrimoine } from './pages/services/Patrimoine';
import { Transport } from './pages/services/Transport';
import { VieScolaire } from './pages/services/VieScolaire';

// Composant qui gère la logique du Splash Screen
function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { loading: aboLoading } = useAbonnement();
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = !minTimeElapsed || (isAuthenticated && aboLoading);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <SplashScreen key="splash" />
      ) : (
        <div key="app" className="h-full">
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AbonnementProvider>
          <Toaster position="top-right" />
          
          {/* Barre de titre personnalisée */}
          <TitleBar />

          {/* Conteneur principal : pt-9 pour la TitleBar, h-screen pour bloquer le scroll global */}
          <div className="h-screen overflow-hidden bg-[#edf1f7] pt-9">
            <AppBootstrap>
              <TrialBanner />
              
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />

                <Route element={<RequireAuth />}>
                  <Route path="/" element={<AbonnementGuard />}>
                    <Route element={<EcoleLayout />}>
                      <Route index element={<EcoleDashboard />} />
                      <Route path="dashboard" element={<AbonnementDashboardPage />} />
                      <Route path="profil" element={<ProfilPage />} />

                      <Route path="abonnement">
                        <Route index element={<AbonnementPage />} />
                        <Route path="upgrade" element={<AbonnementUpgradePage />} />
                        <Route path="virement" element={<AbonnementVirementPage />} />
                        <Route path="paypal/succes" element={<PaypalSuccessPage />} />
                        <Route path="paypal/annule" element={<PaypalCancelPage />} />
                        <Route path="expire" element={<AbonnementExpirePage />} />
                      </Route>

                      <Route path="eleves" element={<Eleves />} />
                      <Route path="classes" element={<Classes />} />
                      <Route path="enseignants" element={<Enseignants />} />
                      <Route path="parents" element={<Parents />} />
                      <Route path="emploi-du-temps" element={<EmploiDuTemps />} />
                      <Route path="notes" element={<Notes />} />
                      <Route path="bulletins" element={<Bulletins />} />
                      <Route path="presences" element={<Presences />} />
                      <Route path="devoirs" element={<Devoirs />} />
                      <Route path="finance" element={<Finance />} />
                      <Route path="admissions" element={<Admissions />} />
                      <Route path="vie-scolaire" element={<VieScolaire />} />
                      <Route path="infirmerie" element={<Infirmerie />} />
                      <Route path="discipline" element={<Discipline />} />
                      <Route path="bibliotheque" element={<Bibliotheque />} />
                      <Route path="transport" element={<Transport />} />
                      <Route path="patrimoine" element={<Patrimoine />} />
                      <Route path="cartes" element={<Cartes />} />
                      <Route path="analyses" element={<Analyses />} />
                      <Route path="parametres" element={<Parametres />} />
                      <Route path="registres" element={<Registres />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppBootstrap>
          </div>

        </AbonnementProvider>
      </AuthProvider>
    </HashRouter>
  );
}