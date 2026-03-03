import { useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import AddPostForm from "@/components/AddPostForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles } from "lucide-react";

// 1. IMPORT BACKGROUND YANG SAMA DENGAN DASHBOARD
import myBackgroundImage from "@/assets/bg-dashboard.png"; 

export default function CreatePost() {
  const navigate = useNavigate();
  const { createPost, isCreating } = usePosts();

  const handleAddPost = (data: any) => {
    const formData = new FormData();
    
    // 1. Pastikan nama field ini sama dengan di Controller Backend
    formData.append("judul", data.judul);
    formData.append("isi", data.isi);
    
    // 2. Kirim ID sebagai string
    formData.append("category_id", data.category_id.toString());
    
    // 3. KUNCI UTAMA: Menggunakan field "gambar" sesuai log backend kamu
    if (data.gambar) {
      formData.append("gambar", data.gambar); 
    }

    createPost(formData, {
      onSuccess: () => navigate("/dashboard"),
      onError: (error: any) => {
        console.error("Cek nama field di backend:", error.response?.data);
      }
    });
  };

  return (
    <div 
      className="min-h-screen font-sans pb-20 bg-fixed bg-center bg-cover flex flex-col items-center relative"
      style={{ backgroundImage: `url(${myBackgroundImage})` }}
    >
      {/* OVERLAY BIAR BACKGROUND AGAK SOFT */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl px-6 mt-10">
        
        {/* TOMBOL KEMBALI: Ganti hover ke Purple */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")} 
          className="mb-6 bg-white/60 backdrop-blur-md text-zinc-700 hover:text-[#967EFA] rounded-full px-6 shadow-sm border border-white/50 transition-all hover:scale-105"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
        </Button>
        
        {/* HEADER SECTION: Ganti Pink ke Lavender */}
        <div className="bg-white/60 backdrop-blur-md px-6 py-5 rounded-[2rem] border border-white/40 shadow-xl mb-6 flex flex-col items-center text-center">
          {/* Icon Kecil di Tengah - Lavender Gradient */}
          <div 
            className="p-2 rounded-xl text-white shadow-lg mb-2"
            style={{ background: "linear-gradient(135deg, #D6B4FC 0%, #B799FF 100%)", boxShadow: "0 4px 12px rgba(183, 153, 255, 0.4)" }}
          >
            <Sparkles size={18} />
          </div>
          
          {/* Teks Tengah Rapat */}
          <div>
            <h1 className="text-xl font-black text-zinc-800 tracking-tighter uppercase italic leading-none">
              Tambah <span style={{ color: "#B799FF" }}>Produk</span> Baru
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium italic mt-1.5 opacity-80">
              Update koleksi katalog cantikmu
            </p>
          </div>
        </div>

        {/* FORM DENGAN EFEK TRANSPARAN */}
        <div className="drop-shadow-2xl">
          <AddPostForm onSubmit={handleAddPost} isLoading={isCreating} />
        </div>

      </div>
    </div>
  );
}