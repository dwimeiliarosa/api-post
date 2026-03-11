import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useReviews, useAddReview } from "@/hooks/useReview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Star, Trash2, Loader2, Sparkles, AlertCircle } from "lucide-react"; 
import myBackgroundImage from "@/assets/bg-dashboard.png";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userSkinType, setUserSkinType] = useState<string | null>(null);
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

        const fetchProfile = async () => {
          try {
            const response = await fetch("http://localhost:3000/api/auth/me", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            
            if (result.user) {
              setUserSkinType(result.user.skin_type);
            } else if (result.data) {
              setUserSkinType(result.data.skin_type);
            }
          } catch (err) {
            console.error("Gagal mengambil data profil:", err);
          }
        };
        fetchProfile();
      } catch (e) {
        console.error("❌ Gagal decode token:", e);
      }
    }
  }, []);

  const { data: posts, isLoading: isPostLoading } = usePosts();
  const { data: reviews, isLoading: isReviewLoading } = useReviews(postId);
  const addReviewMutation = useAddReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const product = (Array.isArray(posts) ? posts : (posts as any)?.data || [])
    ?.find((p: any) => p.id.toString() === id);

  // LOGIKA MATCHING (Glow-Check)
  const isCompatible = Boolean(
    userSkinType && 
    product?.suitable_for && 
    userSkinType.toLowerCase() === product.suitable_for.toLowerCase()
  );

  // Pindahkan log ke sini agar variabel sudah didefinisikan
  console.log("DEBUG GLOW-CHECK:", {
    userSkin: userSkinType,
    productSuitable: product?.suitable_for,
    matched: isCompatible
  });

  const handleSubmitReview = () => {
    if (rating === 0) return toast.error("Ratingnya dulu ya, Kak! ⭐");
    const formData = new FormData();
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    formData.append("post_id", postId.toString());
    if (imageFile) formData.append("image", imageFile);

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

  const confirmDelete = async () => {
    if (!selectedReviewId) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3000/api/reviews/${selectedReviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Ulasan berhasil dihapus! 🗑️");
        queryClient.invalidateQueries({ queryKey: ["reviews", postId] });
      } else {
        toast.error("Gagal menghapus ulasan.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedReviewId(null);
    }
  };

  if (isPostLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin text-pink-500" size={40} />
    </div>
  );

  if (!product) return <div className="text-center mt-20">Produk tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-fixed bg-center bg-cover pb-20" style={{ backgroundImage: `url(${myBackgroundImage})` }}>
      <div className="max-w-5xl mx-auto pt-10 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-all">
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/40 flex flex-col md:flex-row items-start mb-10">
          <div className="w-full md:w-1/2 aspect-square sticky top-0 overflow-hidden bg-zinc-100">
            <img 
              src={product.gambar || "https://via.placeholder.com/600"} 
              alt={product.judul} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
            />
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col h-fit">
            <span className="text-pink-500 font-black uppercase tracking-widest text-[10px] mb-2">Product Detail</span>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-800 uppercase italic leading-tight mb-4 break-words">
              {product.judul}
            </h1>

            {/* MAGIC GLOW-CHECK */}
            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
              {userSkinType && product.suitable_for ? (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                  isCompatible 
                  ? "bg-green-50/50 border-green-200 text-green-700" 
                  : "bg-amber-50/50 border-amber-200 text-amber-700"
                }`}>
                  {isCompatible ? (
                    <>
                      <div className="bg-green-500 p-2 rounded-full text-white shadow-lg shadow-green-200">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Glow-Check: MATCH! ✨</p>
                        <p className="text-sm font-medium">Cocok banget buat kulit <span className="font-bold underline">{userSkinType}</span> kamu!</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-amber-500 p-2 rounded-full text-white shadow-lg shadow-amber-200">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Glow-Check: BE CAREFUL!</p>
                        <p className="text-sm font-medium">Ini untuk kulit <span className="font-bold">{product.suitable_for}</span>, kulitmu <span className="font-bold">{userSkinType}</span>.</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-50/50 text-zinc-500 text-[11px] italic border border-zinc-200 flex items-center gap-2">
                  <Sparkles size={14} className="text-zinc-400" />
                  Lengkapi profil skin type kamu untuk aktifkan fitur Glow-Check!
                </div>
              )}
            </div>
            
            <div className="bg-white/40 p-6 rounded-[2rem] border border-white/60">
              <h3 className="font-bold text-zinc-400 mb-3 uppercase text-[10px] tracking-widest border-b border-zinc-200 pb-1 w-fit">
                Deskripsi Produk
              </h3>
              <p className="text-zinc-600 leading-relaxed text-sm text-justify whitespace-pre-line break-words">
                {product.isi}
              </p>
            </div>
          </div>
        </div>

        {/* REVIEW SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-zinc-800 uppercase italic tracking-tighter">Glow Stories ({reviews?.length || 0})</h3>
            {isReviewLoading ? (
              <p className="italic text-zinc-500">Loading reviews...</p>
            ) : !reviews || reviews.length === 0 ? (
              <div className="text-zinc-500 italic bg-white/30 p-6 rounded-2xl">Belum ada review. ✨</div>
            ) : (
              reviews.map((rev: any) => (
                <div key={rev.id} className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-6 border border-white/20 shadow-sm relative group transition-all hover:bg-white/60">
                  {Number(currentUserId) === Number(rev.user_id) && (
                    <button onClick={() => { setSelectedReviewId(rev.id); setIsDeleteDialogOpen(true); }} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 z-20 bg-white/80 rounded-full shadow-sm">
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
                  <p className="text-zinc-600 text-sm italic mb-4 leading-relaxed break-words">"{rev.comment}"</p>
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
            <AlertDialogAction onClick={confirmDelete} className="rounded-full font-bold text-white shadow-lg shadow-pink-200 hover:opacity-90 px-6 border-none transition-all active:scale-95" style={{ background: "linear-gradient(90deg, #ff99d8 0%, #967EFA 100%)" }}>
              YA, HAPUS SEKARANG
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}