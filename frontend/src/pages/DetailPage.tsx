import { useParams, useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import myBackgroundImage from "@/assets/bg-dashboard.png";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: posts, isLoading } = usePosts();

  // Cari produk spesifik berdasarkan ID dari URL
  const product = (Array.isArray(posts) ? posts : (posts as any)?.data || [])
    ?.find((p: any) => p.id.toString() === id);

  if (isLoading) return <div className="text-center mt-20">Loading...</div>;
  if (!product) return <div className="text-center mt-20">Produk tidak ditemukan.</div>;

  return (
    <div 
      className="min-h-screen bg-fixed bg-center bg-cover pb-20"
      style={{ backgroundImage: `url(${myBackgroundImage})` }}
    >
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 bg-white/60 backdrop-blur-md rounded-full"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/40 flex flex-col md:flex-row">
          {/* Bagian Gambar */}
          <div className="md:w-1/2 aspect-square">
            <img 
              src={product.gambar || "https://via.placeholder.com/600"} 
              alt={product.judul} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bagian Teks Lengkap */}
          <div className="md:w-1/2 p-10 flex flex-col">
            <span className="text-pink-500 font-black uppercase tracking-widest text-xs mb-2">
              Product Detail
            </span>
            <h1 className="text-4xl font-black text-zinc-800 uppercase italic leading-none mb-6">
              {product.judul}
            </h1>
            
            <div className="flex-grow">
              <h3 className="font-bold text-zinc-700 mb-2 uppercase text-sm tracking-tighter">Deskripsi Lengkap:</h3>
              {/* Di sini deskripsi panjangnya akan muncul semua tanpa terpotong */}
              <p className="text-zinc-600 leading-relaxed text-justify">
                {product.isi}
              </p>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}