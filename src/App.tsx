import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import EventsPage from "./pages/EventsPage";
import SignalsPage from "./pages/SignalsPage";
import InsightsPage from "./pages/InsightsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import IntegrationsPage from "./pages/IntegrationsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useGitHubSync } from "./hooks/useGitHubSync";

const queryClient = new QueryClient();

function DashboardWrapper({ children }: { children: any }) {
  useGitHubSync();
  return <DashboardLayout>{children}</DashboardLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/app" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <Dashboard />
              </DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/app/projects" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <ProjectsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/app/projects/:id" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <ProjectDetailsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/app/events" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <EventsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/app/signals" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <SignalsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/app/integrations" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <IntegrationsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/app/insights" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <InsightsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/app/recommendations" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <RecommendationsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/app/profile" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <ProfilePage />
              </DashboardWrapper>
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
