import { useParams, useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, ShoppingBag } from "lucide-react";
import myBackgroundImage from "@/assets/bg-dashboard.png";

export default function CategoryPage() {
  const { id } = useParams(); // Ambil ID kategori dari URL
  const navigate = useNavigate();
  const { data: posts, isLoading } = usePosts();
  const { data: categories } = useCategories();

  // 1. Cari nama kategori berdasarkan ID untuk judul halaman
  const currentCategory = categories?.find((cat: any) => cat.id.toString() === id);

  // 2. Filter produk yang punya category_id sama dengan ID di URL
  const filteredPosts = (Array.isArray(posts) ? posts : (posts as any)?.data || [])
    ?.filter((post: any) => post.category_id.toString() === id);

  return (
    <div 
      className="min-h-screen font-sans pb-20 bg-fixed bg-center bg-cover"
      style={{ backgroundImage: `url(${myBackgroundImage})` }}
    >
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-pink-100 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")} 
            className="text-zinc-600 hover:text-pink-600 rounded-full"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <h1 className="text-xl font-black text-zinc-800 uppercase italic">
            Category: <span className="text-pink-500">{currentCategory?.name || "Loading..."}</span>
          </h1>
          <div className="w-10"></div> {/* Spacer balance */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10 px-4">
        <section className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-white/40">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-pink-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p>Mencari produk...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredPosts.map((post: any) => (
  <Card 
    key={post.id} 
    onClick={() => navigate(`/detail/${post.id}`)} // Pindah ke sini
    className="bg-white rounded-[2rem] overflow-hidden shadow-sm border-none cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
  >
    <div className="aspect-[4/5]">
      <img 
        src={post.gambar || "https://via.placeholder.com/400x500"} 
        alt={post.judul} 
        className="w-full h-full object-cover" 
      />
    </div>
    <CardContent className="p-5">
      <CardTitle className="text-lg font-bold uppercase italic text-zinc-800 line-clamp-1">
        {post.judul}
      </CardTitle>
      <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
        {post.isi}
      </p>
    </CardContent>
  </Card>
))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 italic font-medium">Yah, belum ada produk di kategori ini...</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}