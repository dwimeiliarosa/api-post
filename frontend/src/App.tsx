import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner"; // 1. Import Toaster
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CategoryPage from "./pages/CategoryPage";
import DetailPage from "./pages/DetailPage";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import FavoritesPage from "./pages/FavoritesPage";
import LandingPage from "./pages/LandingPage";

// Import Profile
import ProfilePage from "./pages/user/ProfilePage";
import ProfileEditPage from "./pages/user/ProfileEditPage"; 

function App() {
  return (
    <>
      {/* 2. Tambahkan Toaster di sini */}
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
          {/* Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Main Content Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />

          <Route path="/favorites" element={<FavoritesPage />} />

          {/* Admin/Post Management Routes */}
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/edit-post/:id" element={<EditPost />} />

          {/* User Profile Routes */}
          <Route path="/user/profile" element={<ProfilePage />} />
          <Route path="/user/profile/edit" element={<ProfileEditPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;