// src/pages/EditPost.tsx
import { useNavigate, useParams } from "react-router-dom";
import AddPostForm from "@/components/AddPostForm"; 
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import myBackgroundImage from "@/assets/bg-dashboard.png"; 

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // GUNAKAN STATE LOKAL UNTUK LOADING UPDATE
  const [isUpdating, setIsUpdating] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        // Jika response.data berisi { data: [...] }, sesuaikan path-nya
        setInitialData(response.data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleUpdatePost = async (data: any) => {
  setIsUpdating(true);
  const formData = new FormData();
  formData.append("judul", data.judul);
  formData.append("isi", data.isi);
  formData.append("category_id", data.category_id.toString());
  
  // Kirim file hanya jika ada file baru yang dipilih
  if (data.gambar instanceof File) {
    formData.append("gambar", data.gambar);
  }

  try {
    // Gunakan PUT ke endpoint yang sudah kita buat tadi
    await api.put(`/posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    alert("Produk berhasil diperbarui! ✨");
    navigate("/dashboard"); // Kembali ke dashboard untuk melihat hasilnya
  } catch (error) {
    console.error("Update gagal:", error);
    alert("Gagal mengupdate produk.");
  } finally {
    setIsUpdating(false);
  }
};

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <Loader2 className="animate-spin text-[#B799FF]" size={48} />
    </div>
  );

  return (
    <div 
      className="min-h-screen font-sans pb-20 bg-fixed bg-center bg-cover flex flex-col items-center"
      style={{ backgroundImage: `url(${myBackgroundImage})` }}
    >
      <div className="relative z-10 w-full max-w-2xl px-6 mt-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")} 
          className="mb-6 bg-white/60 backdrop-blur-md rounded-full px-6 shadow-sm border border-white/50"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Batal
        </Button>

        <AddPostForm 
          onSubmit={handleUpdatePost} 
          isLoading={isUpdating} 
          defaultValues={initialData} 
        />
      </div>
    </div>
  );
}