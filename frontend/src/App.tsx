import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CategoryPage from "./pages/CategoryPage";
import DetailPage from "./pages/DetailPage";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import FavoritesPage from "./pages/FavoritesPage";
import LandingPage from "./pages/LandingPage";
import NotificationPage from "./pages/NotificationPage"; // <--- 1. IMPORT HALAMAN BARU

// Import Profile
import ProfilePage from "./pages/user/ProfilePage";
import ProfileEditPage from "./pages/user/ProfileEditPage"; 

function App() {
  return (
    <>
      {/* Konfigurasi Toaster untuk Notifikasi Rich Colors */}
      <Toaster 
        position="top-center" 
        richColors 
        expand={false}
        closeButton
        toastOptions={{
          className: 'font-sans',
          style: { borderRadius: '1.2rem' } 
        }}
      />
      
      <BrowserRouter>
        <Routes>
          {/* --- Auth Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- Main Content Routes --- */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />

          {/* --- User Routes --- */}
          <Route path="/user/favorites" element={<FavoritesPage />} />
          <Route path="/user/profile" element={<ProfilePage />} />
          <Route path="/user/profile/edit" element={<ProfileEditPage />} />
          
          {/* 2. ROUTE NOTIFIKASI DI SINI */}
          <Route path="/notifications" element={<NotificationPage />} />

          {/* --- Admin/Post Management Routes --- */}
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/edit-post/:id" element={<EditPost />} />

          {/* --- Fallback & Safety Routes --- */}
          <Route path="/favorites" element={<Navigate to="/user/favorites" />} />
          
          {/* Catch-all: Menangani URL yang tidak terdaftar */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;