import { useMyFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Heart, ChevronLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { data: favs, isLoading } = useMyFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();

  const API_BASE_URL = "http://localhost:3000/api";

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <header className="p-6 bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full"><ChevronLeft /></Button>
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
             <p className="text-zinc-500">Belum ada favorit.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {favs.map((post: any) => (
              <Card key={post.id} className="group rounded-[2.5rem] overflow-hidden border-none bg-white shadow-sm">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={`${API_BASE_URL}/view-image/${post.gambar}`}
                    alt={post.judul}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(post.id)}
                    className="absolute top-4 right-4 p-3 rounded-full bg-white text-red-500 shadow-xl"
                  >
                    {/* Di halaman favorit, semua tombol pasti merah (fill) */}
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-black italic uppercase">{post.judul}</h3>
                  <p className="text-zinc-400 text-xs mt-2 font-bold uppercase">{post.category_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}