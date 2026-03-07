import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useReviews, useAddReview } from "@/hooks/useReview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Star, Trash2 } from "lucide-react";
import myBackgroundImage from "@/assets/bg-dashboard.png";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// IMPORT ALERT DIALOG COMPONENTS
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);
  const queryClient = useQueryClient();

  // --- AUTH CONTEXT ---
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // STATE UNTUK ALERT DIALOG
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); 
    
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        setCurrentUserId(Number(payload.id));
        console.log("✅ User ID terdeteksi:", payload.id);
      } catch (e) {
        console.error("❌ Gagal decode token:", e);
      }
    }
  }, []);

  // --- DATA HOOKS ---
  const { data: posts, isLoading: isPostLoading } = usePosts();
  const { data: reviews, isLoading: isReviewLoading } = useReviews(postId);
  const addReviewMutation = useAddReview();

  // --- LOCAL STATE ---
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const product = (Array.isArray(posts) ? posts : (posts as any)?.data || [])
    ?.find((p: any) => p.id.toString() === id);

  // --- HANDLER: TAMBAH REVIEW ---
  const handleSubmitReview = () => {
    if (rating === 0) return toast.error("Ratingnya dulu ya, Kak! ⭐");

    const formData = new FormData();
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    formData.append("post_id", postId.toString());

    if (imageFile) {
      formData.append("image", imageFile);
    }

    addReviewMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Review berhasil dikirim! ✨");
        setRating(0);
        setComment("");
        setImageFile(null);
        const fileInput = document.getElementById('review-image') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        queryClient.invalidateQueries({ queryKey: ["reviews", postId] });
      },
    });
  };

  // --- HANDLER: HAPUS REVIEW (LOGIC FIX) ---
  const confirmDelete = async () => {
    if (!selectedReviewId) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3000/api/reviews/${selectedReviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Ulasan berhasil dihapus! 🗑️");
        queryClient.invalidateQueries({ queryKey: ["reviews", postId] });
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal menghapus.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedReviewId(null);
    }
  };

  if (isPostLoading) return <div className="text-center mt-20 font-serif italic text-zinc-500 text-xl">Loading...</div>;
  if (!product) return <div className="text-center mt-20">Produk tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-fixed bg-center bg-cover pb-20" style={{ backgroundImage: `url(${myBackgroundImage})` }}>
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-all">
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        {/* CARD UTAMA PRODUK */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/40 flex flex-col md:flex-row mb-10">
          <div className="md:w-1/2 aspect-square">
            <img src={product.gambar || "https://via.placeholder.com/600"} alt={product.judul} className="w-full h-full object-cover" />
          </div>
          <div className="md:w-1/2 p-10 flex flex-col">
            <span className="text-pink-500 font-black uppercase tracking-widest text-xs mb-2">Product Detail</span>
            <h1 className="text-4xl font-black text-zinc-800 uppercase italic leading-tight mb-6">{product.judul}</h1>
            <div className="flex-grow">
              <h3 className="font-bold text-zinc-700 mb-2 uppercase text-sm tracking-tighter border-b border-zinc-200 pb-1 w-fit">Deskripsi:</h3>
              <p className="text-zinc-600 leading-relaxed text-sm text-justify pt-2">{product.isi}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Review */}
          <div className="md:col-span-1 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/40 shadow-lg h-fit">
            <h3 className="text-lg font-bold text-zinc-800 mb-4 italic">How's your glow?</h3>
            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={24} className={`cursor-pointer transition-all ${rating >= star ? "fill-pink-400 text-pink-400" : "text-zinc-300 hover:text-pink-200"}`} onClick={() => setRating(star)} />
              ))}
            </div>
            <Textarea placeholder="Tulis ulasanmu..." value={comment} onChange={(e) => setComment(e.target.value)} className="mb-4 bg-white/50 rounded-2xl border-none focus-visible:ring-pink-300 min-h-[120px] p-4 text-sm" />
            <div className="mb-6">
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block tracking-widest">Upload Foto Bukti</label>
              <input id="review-image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-[10px] text-zinc-500 w-full" />
            </div>
            <Button onClick={handleSubmitReview} disabled={addReviewMutation.isPending} className="w-full rounded-full bg-gradient-to-r from-pink-400 to-[#967EFA] font-bold shadow-lg shadow-pink-200">
              {addReviewMutation.isPending ? "SENDING..." : "SUBMIT REVIEW"}
            </Button>
          </div>

          {/* List Reviews */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-zinc-800 uppercase italic tracking-tighter">Glow Stories ({reviews?.length || 0})</h3>
            
            {isReviewLoading ? (
              <p className="italic text-zinc-500">Loading reviews...</p>
            ) : !reviews || reviews.length === 0 ? (
              <div className="text-zinc-500 italic bg-white/30 p-6 rounded-2xl">Belum ada review. ✨</div>
            ) : (
              reviews.map((rev: any) => (
                <div key={rev.id} className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-6 border border-white/20 shadow-sm relative group transition-all hover:bg-white/60">
                  
                  {/* --- TOMBOL HAPUS: Muncul saat hover kartu milik user --- */}
                  {Number(currentUserId) === Number(rev.user_id) && (
                    <button 
                      onClick={() => {
                        setSelectedReviewId(rev.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 z-20 bg-white/80 rounded-full shadow-sm"
                      title="Hapus Ulasan"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <img src={rev.avatar || "https://github.com/shadcn.png"} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" alt={rev.username} />
                    <div>
                      <p className="text-sm font-bold text-zinc-800 leading-none">{rev.username}</p>
                      <div className="flex gap-0.5 mt-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={`${i < rev.rating ? "fill-pink-400 text-pink-400" : "text-zinc-300"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-600 text-sm italic mb-4 leading-relaxed">"{rev.comment}"</p>
                  
                  {rev.image_url && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-white/40 shadow-sm max-w-[250px]">
                      <img 
                        src={`http://localhost:3000/api/view-image/${encodeURIComponent(rev.image_url)}`} 
                        className="w-full h-auto object-cover max-h-[300px]" 
                        alt="Bukti" 
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- ESTETIK ALERT DIALOG COMPONENT --- */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-white/40 bg-white/90 backdrop-blur-xl shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black italic text-zinc-800 uppercase tracking-tighter flex items-center gap-2">
              Hapus Ceritamu? <Trash2 className="text-rose-500" size={24} />
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-sm leading-relaxed pt-2">
              Tindakan ini tidak bisa dibatalkan. Ulasan dan foto buktimu akan hilang dari Glow Stories selamanya. Yakin nih?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
            <AlertDialogCancel className="rounded-full border-none bg-zinc-100 font-bold text-zinc-500 hover:bg-zinc-200 px-6">
              BATAL
            </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={confirmDelete}
                      // Ganti bg-gradient-to-r dengan kode hex yang kamu minta
                      className="rounded-full font-bold text-white shadow-lg shadow-pink-200 hover:opacity-90 px-6 border-none transition-all active:scale-95"
                      style={{ 
                        background: "linear-gradient(90deg, #ff99d8 0%, #967EFA 100%)" 
                      }}
                    >
                      YA, HAPUS SEKARANG
                    </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}