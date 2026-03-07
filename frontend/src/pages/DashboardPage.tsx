import { useState, useMemo } from "react";
import { usePosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useMe } from "@/hooks/useAuth";
import { useToggleFavorite, useMyFavorites } from "@/hooks/useFavorites";
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
  Heart,
  ChevronLeft,
  ChevronRight,
  Layers 
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

  // --- STATE PAGINATION, LIMIT, SEARCH & CATEGORY ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8); 
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // --- LOGIKA FETCHING DINAMIS ---
  // Jika sedang filter/cari, kita tarik data banyak (100) agar tidak mencar antar slide
  const isFiltering = !!activeCategory || !!searchTerm;
  const effectiveLimit = isFiltering ? 100 : limit;
  const effectivePage = isFiltering ? 1 : currentPage;

  const { data: userData, isLoading: isUserLoading } = useMe();
  const { data: categories } = useCategories();
  
  const { data: postResponse, isLoading: isPostsLoading } = usePosts(
    effectivePage, 
    effectiveLimit
  );
  
  const { data: favs } = useMyFavorites();
  const toggleFavorite = useToggleFavorite();

  const user = userData?.data || userData;

  // --- DATA HANDLING ---
  const posts = postResponse?.data || [];
  const meta = postResponse?.meta;
  const totalPages = meta?.totalPages || 1;
  const totalData = meta?.totalData || 0;

  // --- LOGIKA FILTER (STRICT & PADAT) ---
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (activeCategory) {
      result = result.filter((post: any) => {
        const categoryName = post.category?.name?.toLowerCase() || post.category_name?.toLowerCase();
        return categoryName === activeCategory.toLowerCase();
      });
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter((post: any) => {
        const matchTitle = post.judul?.toLowerCase().includes(searchLower);
        const matchContent = post.isi?.toLowerCase().includes(searchLower);
        const matchCategory = 
          post.category?.name?.toLowerCase().includes(searchLower) || 
          post.category_name?.toLowerCase().includes(searchLower);

        return matchTitle || matchContent || matchCategory;
      });
    }

    return result;
  }, [posts, searchTerm, activeCategory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setActiveCategory(null); 
    setCurrentPage(1); 
  };

  const getCategoryImage = (name: string) => {
    const n = name ? name.toLowerCase().trim() : "";
    if (n.includes("makeup")) return imgMakeup;
    if (n.includes("skincare")) return imgSkincare;
    if (n.includes("bodycare")) return imgBodycare;
    if (n.includes("haircare")) return imgHaircare;
    return imgHaircare;
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    queryClient.clear(); 
    navigate("/login");
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("Produk ini akan dihapus permanen. Lanjutkan?")) {
      try {
        await api.delete(`/posts/${id}`);
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
            <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => { navigate("/dashboard"); setActiveCategory(null); setSearchTerm(""); setCurrentPage(1); }}>
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
                placeholder="Search beauty needs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-10 py-2.5 bg-zinc-100/50 border-none rounded-2xl focus:ring-2 focus:ring-[#967EFA]/50 transition-all outline-none text-sm font-medium"
              />
              {(searchTerm || activeCategory) && (
                <button
                  onClick={() => { setSearchTerm(""); setActiveCategory(null); setCurrentPage(1); }}
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

            {user?.role !== 'admin' && (
              <Button
                variant="ghost"
                onClick={() => navigate("/favorites")}
                className="rounded-full h-11 w-11 p-0 bg-zinc-100 text-zinc-600 hover:bg-[#ff99d8]/10 hover:text-[#ff99d8] transition-all relative group"
                title="My Favorites"
              >
                <Heart size={20} className="group-hover:fill-[#ff99d8] transition-colors" />
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
                onClick={() => {
                  setActiveCategory(cat.name);
                  setSearchTerm(""); 
                  setCurrentPage(1);
                }}
                className={`bg-white rounded-[2rem] p-5 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group ${
                  activeCategory === cat.name ? "ring-2 ring-[#967EFA] bg-purple-50" : ""
                }`}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-4 ring-purple-50 group-hover:ring-purple-100 transition-all">
                  <img src={getCategoryImage(cat.name)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tight text-center transition-colors ${
                  activeCategory === cat.name ? "text-[#d857a6]" : "text-zinc-700 group-hover:text-[#d857a6]"
                }`}>{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCTS SECTION */}
        <section className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 shadow-2xl border border-white/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 px-2 gap-4">
            <div>
              <h2 className="text-3xl font-black text-zinc-800 uppercase italic tracking-tighter">
                {activeCategory 
                  ? `Category: ${activeCategory}` 
                  : searchTerm 
                    ? `Results for "${searchTerm}"` 
                    : <>New <span style={{ color: "#967EFA" }}>Arrivals</span></>
                }
              </h2>
              <div className="h-1.5 w-12 mt-2 rounded-full" style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}></div>
            </div>

            {/* LIMIT SELECTOR - Disembunyikan saat filtering agar tampilan tetap padat */}
            {!isFiltering && (
              <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-purple-50 shadow-sm">
                <Layers size={14} className="ml-2 text-zinc-400" />
                <span className="text-[10px] font-black text-zinc-400 uppercase mr-1">Show:</span>
                {[4, 8, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => { setLimit(num); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      limit === num 
                      ? "bg-[#967EFA] text-white shadow-md" 
                      : "text-zinc-500 hover:bg-purple-50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
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
              <p className="font-bold text-zinc-500 italic">Oops! No beauty matches found</p>
              <Button 
                variant="ghost" 
                className="mt-4 text-[#967EFA] font-bold"
                onClick={() => { setSearchTerm(""); setActiveCategory(null); setCurrentPage(1); }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredPosts.map((post: any) => {
                  const isFavorited = favs?.some((f: any) => f.id === post.id);
                  return (
                    <Card 
                      key={post.id} 
                      className="border-none shadow-none group bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer"
                      onClick={() => navigate(`/detail/${post.id}`)}
                    >
                      <div className="aspect-[4/5] overflow-hidden relative">
                        <img
                          src={post.gambar} 
                          alt={post.judul}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {user?.role !== 'admin' && (
                          <div className="absolute top-4 left-4 z-20">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite.mutate(post.id);
                              }}
                              disabled={toggleFavorite.isPending}
                              className={`p-2.5 rounded-full shadow-lg transition-all active:scale-90 ${
                                isFavorited ? "bg-red-500 text-white" : "bg-white/80 text-zinc-400 hover:text-red-500"
                              }`}
                            >
                              <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
                            </button>
                          </div>
                        )}

                        {user?.role === 'admin' && (
                          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                            <Button size="icon" variant="secondary" className="h-9 w-9 rounded-xl shadow-md hover:bg-[#d857a6] hover:text-white" onClick={(e) => { e.stopPropagation(); navigate(`/edit-post/${post.id}`); }}><Edit size={16}/></Button>
                            <Button size="icon" variant="destructive" className="h-9 w-9 rounded-xl shadow-md" onClick={(e) => handleDelete(e, post.id)}><Trash2 size={16}/></Button>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <CardTitle className="text-lg font-bold text-zinc-800 line-clamp-1 uppercase tracking-tighter italic group-hover:text-[#d857a6] transition-colors">
                          {post.judul}
                        </CardTitle>
                        {(post.category?.name || post.category_name) && (
                           <span className="text-[9px] bg-purple-50 text-[#967EFA] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                             {post.category?.name || post.category_name}
                           </span>
                        )}
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed">{post.isi}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* PAGINATION CONTROLS - Hanya muncul jika tidak sedang filtering */}
              {!isFiltering && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16 pb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl border-purple-100 hover:bg-purple-50 text-[#967EFA] disabled:opacity-30 transition-all"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={20} />
                    </Button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                            currentPage === i + 1
                              ? "bg-[#967EFA] text-white shadow-lg shadow-purple-200 scale-110"
                              : "text-zinc-400 hover:bg-purple-50 hover:text-[#967EFA]"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl border-purple-100 hover:bg-purple-50 text-[#967EFA] disabled:opacity-30 transition-all"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                  
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Showing {filteredPosts.length} of {totalData} items
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}