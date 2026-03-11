import { useMyFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Heart, ChevronLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { data: favs, isLoading } = useMyFavorites();
  const toggleFavorite = useToggleFavorite();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-[#967EFA]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <header className="p-6 bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="rounded-full">
              <ChevronLeft />
            </Button>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">
              My <span style={{ color: "#967EFA" }}>Favorites</span> ✨
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="rounded-full">
            <ShoppingBag className="mr-2 h-4 w-4" /> let's explore again
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10 px-6">
        {!favs || favs.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-zinc-100">
            <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                <Heart size={32} />
            </div>
            <p className="text-zinc-500 font-bold italic">Belum ada produk favorit.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {favs.map((item: any) => {
              const post = item.post || item;
              const rawImage = post.gambar || post.image || post.image_url;
              
              // --- PERBAIKAN URL DI SINI ---
              // 1. Gunakan port 3000 sesuai log terminal
              // 2. Gunakan endpoint /api/view-image/ sesuai log rute aktif
              const imageUrl = rawImage?.startsWith('http') 
                ? rawImage 
                : rawImage 
                  ? `http://localhost:3000/api/view-image/${rawImage}`
                  : "https://placehold.co/400x500?text=No+Image";

              return (
                <Card 
                  key={item.id} 
                  className="group rounded-[2.5rem] overflow-hidden border-none bg-white shadow-sm hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate(`/detail/${post.id}`)}
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-zinc-100">
                    <img
                      src={imageUrl}
                      alt={post.judul}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x500?text=Image+Not+Found";
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite.mutate(post.id);
                      }}
                      className="absolute top-4 right-4 p-3 rounded-full bg-white text-red-500 shadow-xl hover:scale-110 transition-all"
                    >
                      <Heart size={20} fill="currentColor" />
                    </button>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black italic uppercase line-clamp-1">
                      {post.judul || "Tanpa Nama"}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-purple-50 text-[#967EFA] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                        {post.category?.name || post.category_name || "Beauty"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}