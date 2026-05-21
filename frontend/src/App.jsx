import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, AuthProvider, ProtectedRoute } from './contexts';
import { MainLayout } from './components/layout';
import {
  LandingPage,
  AuthPage,
  FeedPage,
  EventsPage,
  ClubsPage,
  ResourcesPage,
  OpportunitiesPage,
  MarketplacePage,
  LostFoundPage,
  AdminPanel
} from './pages';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <FeedPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EventsPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clubs" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ClubsPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resources" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ResourcesPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/opportunities" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <OpportunitiesPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/marketplace" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MarketplacePage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lost-found" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <LostFoundPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AdminPanel />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
