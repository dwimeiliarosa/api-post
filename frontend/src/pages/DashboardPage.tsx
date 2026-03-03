import { useState, useMemo } from "react";
import { usePosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useMe } from "@/hooks/useAuth";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Trash2, 
  Edit, 
  ShoppingBag, 
  Loader2, 
  LogOut, 
  User, 
  Search, 
  X,
  Heart 
} from "lucide-react";
import api from "@/api/axiosInstance";

// Assets
import myBackgroundImage from "@/assets/bg-dashboard.png";
import imgMakeup from "@/assets/makeup.png";
import imgSkincare from "@/assets/skincare.png";
import imgBodycare from "@/assets/bodycare.png";
import imgHaircare from "@/assets/haircare.png";

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Data Fetching
  const { data: userData, isLoading: isUserLoading } = useMe();
  const { data: categories } = useCategories();
  const { data: posts, isLoading: isPostsLoading } = usePosts();
  
  // Hook Favorite
  const toggleFavorite = useToggleFavorite();

  // Normalize user data
  const user = userData?.data || userData;

  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // CONFIGURATION: Sesuaikan dengan URL MinIO & Nama Bucket kamu
  const MINIO_ENDPOINT = "http://localhost:9000"; 
  const BUCKET_NAME = "glowup-bucket"; 

  // LOGIKA FILTER & SEARCH
  const filteredPosts = useMemo(() => {
    const allPosts = Array.isArray(posts) ? posts : (posts as any)?.data || [];
    if (!searchTerm) return allPosts;

    return allPosts.filter((post: any) =>
      post.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.isi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const displayedPosts = showAll ? filteredPosts : filteredPosts.slice(0, 8);

  const getCategoryImage = (name: string) => {
    const n = name ? name.toLowerCase().trim() : "";
    if (n.includes("makeup")) return imgMakeup;
    if (n.includes("skincare")) return imgSkincare;
    if (n.includes("bodycare")) return imgBodycare;
    if (n.includes("haircare")) return imgHaircare;
    return imgHaircare;
  };

 const handleLogout = () => {
  // 1. Hapus Token
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // 2. Bersihkan semua cache data (PENTING!)
  // Ini akan menghapus data 'me' (profil) dan 'posts' yang lama
  queryClient.clear(); 

  // 3. Arahkan ke login
  navigate("/login");
};

 const handleDelete = async (e: React.MouseEvent, id: number) => {
  e.stopPropagation();
  if (window.confirm("Produk ini akan dihapus permanen. Lanjutkan?")) {
    try {
      await api.delete(`/posts/${id}`);
      // Memberitahu React Query untuk refresh data otomatis tanpa reload halaman
      queryClient.invalidateQueries({ queryKey: ["posts"] }); 
      alert("Produk berhasil dihapus! ✨");
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menghapus produk");
    }
  }
};

  return (
    <div
      className="min-h-screen font-sans pb-20 bg-fixed bg-center bg-cover"
      style={{ backgroundImage: `url(${myBackgroundImage})` }}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => navigate("/dashboard")}>
              <div
                className="p-2 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform"
                style={{ background: "linear-gradient(135deg, #ff99d8 0%, #967EFA 100%)" }}
              >
                <ShoppingBag size={20} />
              </div>
              <h1 className="hidden sm:block text-2xl font-black tracking-tighter text-zinc-800 uppercase italic">
                Glow Up.<span style={{ color: "#967EFA" }}>space</span>
              </h1>
            </div>

            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Search your beauty needs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-2.5 bg-zinc-100/50 border-none rounded-2xl focus:ring-2 focus:ring-[#967EFA]/50 transition-all outline-none text-sm font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <p className="text-[10px] font-black text-[#967EFA] uppercase tracking-[0.2em]">Ready to glow?</p>
              <div className="text-sm font-bold text-zinc-800 italic flex items-center gap-2">
                {isUserLoading ? (
                  <span className="animate-pulse text-zinc-300">Syncing...</span>
                ) : (
                  <>
                    Hi, { user?.username || user?.email?.split('@')[0] || "Gorgeous" }! ✨
                    {user?.role === 'admin' && (
                      <span className="not-italic bg-purple-100 text-[#967EFA] px-2 py-0.5 rounded-full text-[9px] uppercase font-black">Admin</span>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {user?.role === 'admin' && (
              <Button
                onClick={() => navigate("/create-post")}
                className="text-white rounded-full px-6 shadow-lg font-bold hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}
              >
                <Plus className="mr-2 h-4 w-4" /> Post
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => navigate("/user/profile")}
              className="rounded-full h-11 w-11 p-0 bg-zinc-100 text-zinc-600 hover:bg-[#ff99d8]/10 hover:text-[#ff99d8]"
            >
              <User size={22} />
            </Button>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-500 rounded-full h-11 w-11 p-0"
            >
              <LogOut size={22} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10 px-4">
        {/* CATEGORIES SECTION */}
        <section className="mb-12">
          <div className="inline-block bg-white/60 backdrop-blur-sm px-4 py-1 rounded-full mb-6 shadow-sm border border-white/50">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "#d857a6" }}>categories of beauty</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-5">
            {categories?.map((cat: any) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                className="bg-white rounded-[2rem] p-5 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-4 ring-purple-50 group-hover:ring-purple-100 transition-all">
                  <img src={getCategoryImage(cat.name)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-tight text-center group-hover:text-[#d857a6]">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCTS SECTION */}
        <section className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 shadow-2xl border border-white/40">
          <div className="flex justify-between items-center mb-10 px-2">
            <div>
              <h2 className="text-3xl font-black text-zinc-800 uppercase italic tracking-tighter">
                {searchTerm ? `Results for "${searchTerm}"` : <>New <span style={{ color: "#967EFA" }}>Arrivals</span></>}
              </h2>
              <div className="h-1.5 w-12 mt-2 rounded-full" style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}></div>
            </div>
            
            {!searchTerm && (
              <Button
                variant="ghost"
                className="font-bold hover:bg-purple-50 rounded-full text-sm text-[#967EFA]"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : "Explore All →"}
              </Button>
            )}
          </div>

          {isPostsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-purple-300">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-bold italic animate-pulse">Fetching your beauty items...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400"><Search size={32} /></div>
              <p className="font-bold text-zinc-500 italic">Oops! No beauty matches found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayedPosts.map((post: any) => (
                <Card 
                  key={post.id} 
                  className="border-none shadow-none group bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  onClick={() => navigate(`/detail/${post.id}`)}
                >
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img
                      src={
                        post.gambar?.startsWith("http") 
                        ? post.gambar 
                        : `${MINIO_ENDPOINT}/${BUCKET_NAME}/${post.gambar}`
                      }
                      alt={post.judul}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x500?text=Product+Glow+Up";
                      }}
                    />
                    
                    {/* TOMBOL FAVORITE (HATI) */}
                    <div className="absolute top-4 left-4 z-20">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation(); // Mencegah pindah ke halaman detail
                          console.log("Favorite clicked for post:", post.id);
                          toggleFavorite.mutate(post.id);
                        }}
                        disabled={toggleFavorite.isPending}
                        className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all active:scale-125 ${
                          post.isFavorited 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/80 text-zinc-400 hover:text-red-500'
                        }`}
                      >
                        {toggleFavorite.isPending && toggleFavorite.variables === post.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Heart size={18} fill={post.isFavorited ? "currentColor" : "none"} />
                        )}
                      </button>
                    </div>

                    {/* Action Buttons Overlay - HANYA ADMIN */}
                    {user?.role === 'admin' && (
                      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl shadow-md hover:bg-[#d857a6] hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit-post/${post.id}`);
                          }}
                        >
                          <Edit size={16}/>
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-9 w-9 rounded-xl shadow-md"
                          onClick={(e) => handleDelete(e, post.id)}
                        >
                          <Trash2 size={16}/>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-5">
                    <CardTitle className="text-lg font-bold text-zinc-800 line-clamp-1 uppercase tracking-tighter italic group-hover:text-[#d857a6] transition-colors">
                      {post.judul}
                    </CardTitle>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed">
                      {post.isi}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}