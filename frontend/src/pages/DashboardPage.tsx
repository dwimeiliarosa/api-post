import { useState, useMemo, useEffect } from "react";
import { usePosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useMe } from "@/hooks/useAuth";
import { useToggleFavorite, useMyFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { 
  Plus, 
  Trash2, 
  Edit, 
  ShoppingBag, 
  Loader2, 
  LogOut, 
  User, 
  Search, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Filter,
  FileSpreadsheet,
  FileText
} from "lucide-material-react";
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
  const [debouncedSearch, setDebouncedSearch] = useState(""); // State untuk debounce
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // --- NEW STATE: SKIN TYPE FILTER & REPORT CATEGORY ---
  const [selectedSkinFilter, setSelectedSkinFilter] = useState<string | null>(null);
  const [reportCategory, setReportCategory] = useState("all");

  // --- LOGIKA DEBOUNCE SEARCH ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // Menunggu 500ms setelah user berhenti mengetik
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- LOGIKA FETCHING DINAMIS ---
  const { data: userData, isLoading: isUserLoading } = useMe();
  const { data: categories } = useCategories();
  
  // Deteksi apakah sedang mencari atau memfilter
  const isFiltering = !!activeCategory || !!debouncedSearch || !!selectedSkinFilter;
  const effectiveLimit = isFiltering ? 100 : limit;
  const effectivePage = isFiltering ? 1 : currentPage;

  // Memasukkan debouncedSearch ke hook usePosts
  const { data: postResponse, isLoading: isPostsLoading } = usePosts(
    effectivePage, 
    effectiveLimit,
    activeCategory ? categories?.find((c: any) => c.name === activeCategory)?.id : undefined,
    debouncedSearch // <-- Data pencarian dikirim ke hook
  );
  
  const { data: favs } = useMyFavorites();
  const toggleFavorite = useToggleFavorite();

  const user = userData?.data || userData;

  // --- DATA HANDLING ---
  const posts = postResponse?.data || [];
  const meta = postResponse?.meta;
  const totalPages = meta?.totalPages || 1;
  const totalData = meta?.totalData || 0;

  // --- LOGIKA FILTER (Server-side search + Client-side Skin Filter) ---
  const displayPosts = useMemo(() => {
    // Karena judul & kategori sudah difilter di BACKEND via 'debouncedSearch',
    // di sini kita hanya perlu memfilter manual untuk 'Skin Type' jika terpilih.
    if (!selectedSkinFilter) return posts;
    
    return posts.filter((post: any) => 
      post.suitable_for?.toLowerCase() === selectedSkinFilter.toLowerCase()
    );
  }, [posts, selectedSkinFilter]);

  // --- LOGIKA REKOMENDASI ---
  const recommendedPosts = useMemo(() => {
    if (!user?.skin_type || posts.length === 0) return [];
    return posts.filter((post: any) => 
      post.suitable_for && 
      post.suitable_for.toLowerCase() === user.skin_type.toLowerCase()
    ).slice(0, 4);
  }, [posts, user?.skin_type]);

  // --- LOGIKA EXPORT ---
  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      let url = '/posts?limit=1000';
      if (reportCategory !== "all") {
        url += `&category_id=${reportCategory}`;
      }

      const response = await api.get(url);
      const allData = response.data.data || [];

      if (allData.length === 0) {
        return Swal.fire("Info", "Tidak ada data produk pada kategori ini", "info");
      }

      const mappedData = allData.map((post: any, index: number) => ({
        No: index + 1,
        Nama: post.judul,
        "Tipe Kulit": post.suitable_for || "Semua Tipe",
        Kategori: post.category?.name || post.category_name || "-",
        Rating: post.rating || 0, 
        Favorit: post.total_favorites || 0
      }));

      if (type === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Produk");
        XLSX.writeFile(workbook, `Laporan_${reportCategory}_${new Date().getTime()}.xlsx`);
      } else {
        const doc = new jsPDF();
        doc.text(`Laporan Produk: ${reportCategory.toUpperCase()}`, 14, 15);
        
        const tableRows = mappedData.map((item: any) => [
          item.No,
          item.Nama,
          item["Tipe Kulit"],
          item.Kategori,
          item.Rating,
          item.Favorit
        ]);

        autoTable(doc, {
          startY: 25,
          head: [["No", "Nama Produk", "Tipe Kulit", "Kategori", "Rating", "Favorit"]],
          body: tableRows,
          headStyles: { fillColor: [150, 126, 250] },
        });

        doc.save(`Laporan_${reportCategory}_${new Date().getTime()}.pdf`);
      }
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire("Error", "Gagal mengunduh laporan", "error");
    }
  };

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
    const result = await Swal.fire({
      title: `<span style="font-family: 'serif'; font-style: italic; font-weight: 600; color: #1f2937;">silahkan konfirmasi</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus Produk",
      confirmButtonColor: "#967EFA",
      customClass: { popup: 'rounded-[2.5rem]' }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/posts/${id}`);
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#967EFA]" size={40} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans pb-20 bg-fixed bg-center bg-cover"
      style={{ backgroundImage: `url(${myBackgroundImage})` }}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => { navigate("/dashboard"); setActiveCategory(null); setSearchTerm(""); setSelectedSkinFilter(null); setCurrentPage(1); }}>
              <div
                className="p-2 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform"
                style={{ background: "linear-gradient(135deg, #ff99d8 0%, #967EFA 100%)" }}
              >
                <ShoppingBag size={20} />
              </div>
              <h1 className="hidden sm:block text-2xl font-black tracking-tighter uppercase italic" style={{ color: "#967EFA" }}>
                Glad2Glow
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
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ready to glow,</span>
              <span className="text-sm font-black text-[#967EFA] italic tracking-tighter">
                {user?.username || "Beautiful"} ✨
              </span>
            </div>

            {user?.role === 'admin' && (
              <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-full border border-purple-100 mr-2">
                <select 
                  className="bg-transparent text-[10px] font-bold uppercase px-2 outline-none text-[#967EFA]"
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                >
                  <option value="all">All Category</option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <div className="flex gap-1 border-l pl-2 border-purple-200">
                  <Button onClick={() => handleExport('excel')} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50 rounded-full">
                    <FileSpreadsheet size={16} />
                  </Button>
                  <Button onClick={() => handleExport('pdf')} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-full">
                    <FileText size={16} />
                  </Button>
                </div>
              </div>
            )}

            {user?.role === 'admin' && (
              <Button 
                onClick={() => navigate("/create-post")} 
                className="text-white rounded-full px-6 shadow-lg font-bold" 
                style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}
              >
                <Plus className="mr-2 h-4 w-4" /> Post
              </Button>
            )}

            {user?.role !== 'admin' && (
              <Button variant="ghost" onClick={() => navigate("/user/favorites")} className="rounded-full h-11 w-11 p-0 bg-zinc-100 text-zinc-600 hover:text-red-500 transition-colors">
                <Heart size={22} />
              </Button>
            )}

            <Button variant="ghost" onClick={() => navigate("/user/profile")} className="rounded-full h-11 w-11 p-0 bg-zinc-100 text-zinc-600">
              <User size={22} />
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-zinc-400 hover:text-red-500 rounded-full h-11 w-11 p-0">
              <LogOut size={22} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10 px-4">
        {/* RECOMMENDED SECTION */}
        {!isFiltering && recommendedPosts.length > 0 && (
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-pink-400 to-purple-50 p-2 rounded-xl text-white shadow-lg"><Sparkles size={20} /></div>
              <div>
                <h2 className="text-xl font-black text-zinc-800 uppercase italic tracking-tighter">Recommended <span className="text-[#967EFA]">For You</span></h2>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                  Tailored for your {user?.skin_type} skin ✨
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedPosts.map((post: any) => (
                <div key={`rec-${post.id}`} onClick={() => navigate(`/detail/${post.id}`)} className="group bg-white/40 backdrop-blur-md rounded-[2rem] p-4 border border-white/60 hover:bg-white/80 transition-all cursor-pointer shadow-sm hover:shadow-xl">
                  <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-3 relative">
                    <img src={post.gambar} alt={post.judul} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="text-xs font-black text-zinc-800 uppercase italic truncate">{post.judul}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CATEGORIES SECTION */}
        <section className="mb-12">
          <div className="inline-block bg-white/60 backdrop-blur-sm px-4 py-1 rounded-full mb-6 shadow-sm border border-white/50">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "#d857a6" }}>categories of beauty</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-5">
            {categories?.map((cat: any) => (
              <div key={cat.id} onClick={() => { setActiveCategory(cat.name); setSearchTerm(""); setSelectedSkinFilter(null); setCurrentPage(1); }} className={`bg-white rounded-[2rem] p-5 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group ${activeCategory === cat.name ? "ring-2 ring-[#967EFA] bg-purple-50" : ""}`}>
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-4 ring-purple-50 group-hover:ring-purple-100 transition-all">
                  <img src={getCategoryImage(cat.name)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tight text-center ${activeCategory === cat.name ? "text-[#d857a6]" : "text-zinc-700"}`}>{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCTS SECTION + SKIN FILTER */}
        <section className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 shadow-2xl border border-white/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 px-2 gap-4">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center w-full">
                <div>
                  <h2 className="text-3xl font-black text-zinc-800 uppercase italic tracking-tighter">
                    {activeCategory ? `Category: ${activeCategory}` : searchTerm ? `Results for "${searchTerm}"` : <>New <span style={{ color: "#967EFA" }}>Arrivals</span></>}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 w-12 rounded-full" style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}></div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">
                      Total: {displayPosts.length} Items found
                    </span>
                  </div>
                </div>

                {!isFiltering && (
                  <div className="hidden md:flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-purple-50 shadow-sm">
                    <Layers size={14} className="ml-2 text-zinc-400" />
                    {[4, 8, 12].map((num) => (
                      <button key={num} onClick={() => { setLimit(num); setCurrentPage(1); }} className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${limit === num ? "bg-[#967EFA] text-white" : "text-zinc-500"}`}>{num}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-2 mr-2 border-r border-purple-200 pr-3">
                  <Filter size={14} className="text-[#967EFA]" />
                  <span className="text-[10px] font-black text-[#967EFA] uppercase tracking-widest">Skin Type:</span>
                </div>
                {['Sensitive', 'Oily', 'Combination', 'Dry', 'Normal'].map((skin) => (
                  <button
                    key={skin}
                    onClick={() => {
                      setSelectedSkinFilter(selectedSkinFilter === skin ? null : skin);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      selectedSkinFilter === skin 
                        ? "bg-[#967EFA] text-white border-[#967EFA] shadow-md scale-105" 
                        : "bg-white text-zinc-500 border-zinc-200 hover:border-[#967EFA] hover:text-[#967EFA]"
                    }`}
                  >
                    {skin}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isPostsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-purple-300">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-bold italic animate-pulse">Fetching your beauty items...</p>
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400"><Search size={32} /></div>
              <p className="font-bold text-zinc-500 italic">Oops! No beauty matches found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayPosts.map((post: any) => {
                  const isFavorited = favs?.some((f: any) => (f.post_id || f.post?.id || f.id) === post.id);
                  return (
                    <Card key={post.id} className="border-none shadow-none group bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer" onClick={() => navigate(`/detail/${post.id}`)}>
                      <div className="aspect-[4/5] overflow-hidden relative">
                        <img src={post.gambar} alt={post.judul} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        
                        {user?.role === 'admin' ? (
                          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                            <Button size="icon" variant="secondary" className="h-9 w-9 rounded-xl" onClick={(e) => { e.stopPropagation(); navigate(`/edit-post/${post.id}`); }}><Edit size={16}/></Button>
                            <Button size="icon" variant="destructive" className="h-9 w-9 rounded-xl" onClick={(e) => handleDelete(e, post.id)}><Trash2 size={16}/></Button>
                          </div>
                        ) : (
                          <div className="absolute top-4 left-4 z-20">
                            <button 
                              onClick={(e) => { 
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                toggleFavorite.mutate(post.id); 
                              }} 
                              className={`p-2.5 rounded-full shadow-lg transition-all ${isFavorited ? "bg-red-500 text-white" : "bg-white/80 text-zinc-400"}`}
                            >
                              <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
                            </button>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <CardTitle className="text-lg font-bold text-zinc-800 line-clamp-1 uppercase tracking-tighter italic group-hover:text-[#d857a6] transition-colors">{post.judul}</CardTitle>
                        <div className="flex gap-2 items-center mt-1 flex-wrap">
                          {(post.category?.name || post.category_name) && (
                             <span className="text-[9px] bg-purple-50 text-[#967EFA] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                               {post.category?.name || post.category_name}
                             </span>
                          )}
                          {post.suitable_for && (
                            <span className="text-[8px] bg-green-50 text-green-600 px-2 py-0.5 rounded-md font-black uppercase tracking-wider border border-green-100">
                               For {post.suitable_for}
                             </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed">{post.isi}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Tampilkan Pagination hanya jika tidak sedang memfilter/mencari (karena filter menampilkan semua hasil) */}
              {!isFiltering && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16 pb-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl border-purple-100" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={20} /></Button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${currentPage === i + 1 ? "bg-[#967EFA] text-white scale-110" : "text-zinc-400"}`}>{i + 1}</button>
                      ))}
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl border-purple-100" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={20} /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}