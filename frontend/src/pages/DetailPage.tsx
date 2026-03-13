import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useReviews, useAddReview, useDeleteReview } from "@/hooks/useReview"; 
import { useComments, useAddComment, useDeleteComment } from "@/hooks/useComments"; 
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, Star, Trash2, Loader2, 
  MessageSquare, Send, User, X 
} from "lucide-react"; 
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

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{id: number, username: string} | null>(null);

  const { data: posts, isLoading: isPostLoading } = usePosts();
  const { data: reviews, isLoading: isReviewLoading } = useReviews(postId);
  const addReviewMutation = useAddReview();
  const deleteReviewMutation = useDeleteReview(postId);

  const { data: comments, isLoading: isCommentLoading } = useComments(postId);
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 1. Decode Token & Fetch Profile
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
            const skinType = result.user?.role || result.user?.skin_type || result.data?.skin_type;
            if (skinType) setUserSkinType(skinType);
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

  // 2. Auto Scroll ke Komentar Spesifik
  useEffect(() => {
    if (!isCommentLoading && comments && comments.length > 0) {
      const hash = window.location.hash; 
      if (hash && hash.startsWith('#comment-')) {
        const timer = setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("ring-2", "ring-pink-400", "ring-offset-8", "rounded-2xl", "bg-pink-50/50");
            setTimeout(() => {
              element.classList.remove("ring-2", "ring-pink-400", "ring-offset-8", "bg-pink-50/50");
            }, 4000);
          }
        }, 800); 
        return () => clearTimeout(timer);
      }
    }
  }, [isCommentLoading, comments]);

  const product = (Array.isArray(posts) ? posts : (posts as any)?.data || [])
    ?.find((p: any) => p.id.toString() === id);

  const isCompatible = Boolean(
    userSkinType && 
    product?.suitable_for && 
    userSkinType.toLowerCase() === product.suitable_for.toLowerCase()
  );

  const handleSubmitReview = () => {
    if (rating === 0) return toast.error("Ratingnya dulu ya, Kak! ⭐");
    const formData = new FormData();
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    formData.append("post_id", postId.toString());
    if (imageFile) formData.append("image", imageFile);

    addReviewMutation.mutate(formData, {
      onSuccess: () => {
        // --- PERBAIKAN: Gunakan queryClient di sini ---
        queryClient.invalidateQueries({ queryKey: ["reviews", postId] });
        setRating(0);
        setComment("");
        setImageFile(null);
        toast.success("Ulasan berhasil dikirim! ✨");
      },
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return toast.error("Komentarnya diisi dulu ya! 💬");
    addCommentMutation.mutate(
      { 
        post_id: postId, 
        isi_komentar: newComment,
        parent_id: replyingTo ? Number(replyingTo.id) : null 
      },
      {
        onSuccess: () => {
          // --- PERBAIKAN: Gunakan queryClient di sini ---
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
          setNewComment("");
          setReplyingTo(null);
          toast.success("Komentar terkirim!");
        },
      }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm("Hapus komentar ini?")) {
      deleteCommentMutation.mutate({ id: commentId, post_id: postId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
      });
    }
  };

  const confirmDelete = () => {
    if (!selectedReviewId) return;
    deleteReviewMutation.mutate(selectedReviewId, {
      onSuccess: () => {
        // --- PERBAIKAN: Gunakan queryClient di sini ---
        queryClient.invalidateQueries({ queryKey: ["reviews", postId] });
        setIsDeleteDialogOpen(false);
        setSelectedReviewId(null);
        toast.success("Ulasan telah dihapus.");
      }
    });
  };

  if (isPostLoading || isReviewLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin text-pink-500" size={40} />
    </div>
  );

  if (!product) return <div className="text-center mt-20 font-bold">Produk tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-fixed bg-center bg-cover pb-20" style={{ backgroundImage: `url(${myBackgroundImage})` }}>
      <div className="max-w-5xl mx-auto pt-10 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-all">
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        {/* Product Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/40 flex flex-col md:flex-row items-start mb-10">
            <div className="w-full md:w-1/2 aspect-square sticky top-0 overflow-hidden bg-zinc-100">
              <img src={product.gambar || "https://via.placeholder.com/600"} alt={product.judul} className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col h-fit">
              <span className="text-pink-500 font-black uppercase tracking-widest text-[10px] mb-2">Product Detail</span>
              <h1 className="text-3xl md:text-4xl font-black text-zinc-800 uppercase italic leading-tight mb-4">{product.judul}</h1>
              
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 w-fit ${isCompatible ? 'bg-green-100 text-green-600' : 'bg-pink-100 text-pink-600'}`}>
                {isCompatible ? "✨ Perfect for your skin" : "⚠️ Check compatibility"}
              </div>

              <div className="bg-white/40 p-6 rounded-[2rem] border border-white/60">
                <p className="text-zinc-600 leading-relaxed text-sm whitespace-pre-line">{product.isi}</p>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Review Input Section */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/40 shadow-lg">
                <h3 className="text-lg font-bold text-zinc-800 mb-4 italic">How's your glow?</h3>
                <div className="flex gap-2 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={24} className={`cursor-pointer transition-colors ${rating >= star ? "fill-pink-400 text-pink-400" : "text-zinc-300"}`} onClick={() => setRating(star)} />
                  ))}
                </div>
                <Textarea placeholder="Tulis ulasanmu..." value={comment} onChange={(e) => setComment(e.target.value)} className="mb-4 bg-white/50 rounded-2xl border-none focus:ring-2 focus:ring-pink-200" />
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-[10px] mb-4 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                <Button onClick={handleSubmitReview} disabled={addReviewMutation.isPending} className="w-full rounded-full bg-gradient-to-r from-pink-400 to-[#967EFA] hover:opacity-90 transition-opacity">
                  {addReviewMutation.isPending ? "SENDING..." : "SUBMIT REVIEW"}
                </Button>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase italic text-zinc-700 px-2">Recent Reviews</h4>
              {reviews?.map((rev: any) => (
                <div key={rev.id} className="bg-white/40 p-4 rounded-2xl border border-white/40 group relative">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-pink-500">{rev.username}</span>
                      <div className="flex italic text-[10px] text-yellow-500">⭐ {rev.rating}</div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-zinc-600 mt-2">{rev.comment}</p>

                  {rev.image_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white shadow-sm max-w-[200px]">
                      <img 
                        src={`http://localhost:3000/api/view-image/${encodeURIComponent(rev.image_url)}`} 
                        alt="Review Attachment" 
                        className="w-full h-auto object-cover hover:scale-105 transition-transform"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                  
                  {(Number(currentUserId) === Number(rev.user_id) || userSkinType?.toLowerCase() === 'admin') && (
                    <button 
                      onClick={() => { setSelectedReviewId(rev.id); setIsDeleteDialogOpen(true); }}
                      className="text-red-400 mt-2 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Discussion Section */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-zinc-800 uppercase italic flex items-center gap-2">
              <MessageSquare className="text-pink-400" size={24} /> Glow Discussion ({comments?.length || 0})
            </h3>

            {/* Input Bar */}
            <div className="sticky top-4 z-10 space-y-2">
                {replyingTo && (
                  <div className="flex items-center justify-between bg-pink-100/90 backdrop-blur-md p-2 rounded-xl border border-pink-200 animate-in slide-in-from-top-2">
                    <p className="text-[10px] text-pink-600 font-bold uppercase tracking-wider pl-2">
                      Membalas @{replyingTo.username}
                    </p>
                    <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-pink-200 rounded-full transition-colors">
                      <X size={14} className="text-pink-600" />
                    </button>
                  </div>
                )}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-3 flex items-center gap-3 border border-white shadow-xl">
                  <input 
                    type="text" 
                    placeholder={replyingTo ? `Balas @${replyingTo.username}...` : "Tanya detail produk di sini..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 outline-none"
                  />
                  <Button onClick={handleSubmitComment} disabled={addCommentMutation.isPending} className="rounded-full bg-zinc-800 w-12 h-10 p-0 hover:bg-zinc-700">
                    {addCommentMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  </Button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-8 mt-6">
              {isCommentLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-pink-400" /></div>
              ) : (
                comments?.filter((com: any) => !com.parent_id).map((com: any) => (
                  <div key={com.id} id={`comment-${com.id}`} className="space-y-4 scroll-mt-28 transition-all duration-500">
                    <div className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-white border border-pink-100 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                        {com.avatar ? <img src={com.avatar} className="object-cover w-full h-full" alt="avatar" /> : <User size={20} className="text-zinc-300" />}
                      </div>
                      <div className="flex-1 bg-white/50 backdrop-blur-sm p-4 rounded-2xl rounded-tl-none border border-white/40 shadow-sm relative group">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-black text-zinc-800 uppercase italic">{com.username}</span>
                          {(Number(currentUserId) === Number(com.user_id) || userSkinType?.toLowerCase() === 'admin') && (
                            <button onClick={() => handleDeleteComment(com.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-zinc-600">{com.isi_komentar}</p>
                        <div className="flex gap-4 mt-2">
                          <button 
                            onClick={() => {
                                setReplyingTo({id: com.id, username: com.username});
                                window.scrollTo({ top: 150, behavior: 'smooth' }); 
                            }}
                            className="text-[10px] font-black text-pink-500 hover:text-pink-700 uppercase tracking-widest"
                          >
                            Balas
                          </button>
                          <span className="text-[8px] text-zinc-400 uppercase font-bold self-center">
                            {new Date(com.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {comments.filter((reply: any) => reply.parent_id === com.id).map((reply: any) => (
                      <div key={reply.id} id={`comment-${reply.id}`} className="flex gap-3 ml-12 scroll-mt-28 group transition-all duration-500">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex-shrink-0 overflow-hidden border border-white shadow-sm">
                          <img src={reply.avatar || "https://github.com/shadcn.png"} className="object-cover w-full h-full" alt="avatar" />
                        </div>
                        <div className="flex-1 bg-zinc-100/50 backdrop-blur-sm p-3 rounded-2xl border border-zinc-200/30 shadow-sm relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-zinc-700 uppercase">{reply.username}</span>
                            {(Number(currentUserId) === Number(reply.user_id) || userSkinType?.toLowerCase() === 'admin') && (
                              <button onClick={() => handleDeleteComment(reply.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 italic">"{reply.isi_komentar}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Review Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none bg-white/90 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black italic uppercase text-zinc-800">Hapus Ulasan?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Tindakan ini tidak bisa dibatalkan. Ulasan kamu akan hilang selamanya dari komunitas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full border-zinc-200">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={deleteReviewMutation.isPending}
              className="rounded-full bg-red-500 hover:bg-red-600"
            >
              {deleteReviewMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}