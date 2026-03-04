import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CategoryPage from "./pages/CategoryPage";
import DetailPage from "./pages/DetailPage";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import FavoritesPage from "./pages/FavoritesPage";

// Import Profile (Pastikan penamaan berbeda agar tidak bentrok)
import ProfilePage from "./pages/user/ProfilePage";
import ProfileEditPage from "./pages/user/ProfileEditPage"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
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
  );
}

export default App;