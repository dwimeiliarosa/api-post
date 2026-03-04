import { useState, useRef } from "react";
import { useMe } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, ArrowLeft, Camera, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance"; 
import { toast } from "sonner";
import Swal from "sweetalert2"; // Import SweetAlert2 yang baru kamu install

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: user, isLoading, refetch } = useMe();
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const glowGradient = "linear-gradient(to right, #ff99d8, #967EFA)";

  const displayName = user?.username || "Kak";

  // ================= 1. FUNGSI UPLOAD =================
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error(`Ukuran foto maksimal 2MB ya, ${displayName}!`);
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploading(true);
      toast.loading(`Lagi memproses foto baru ${displayName}... ✨`, { id: "upload-toast" });

      const response = await api.patch("/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success(`Foto profil ${displayName} berhasil di-Glow Up! 😍`, { id: "upload-toast" });
        refetch(); 
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error("Gagal upload foto, coba lagi ya.", { id: "upload-toast" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ================= 2. FUNGSI HAPUS (FIX TYPESCRIPT ERROR) =================
  const handleDeleteAvatar = async () => {
    const result = await Swal.fire({
      title: 'Hapus Foto?',
      text: `Yakin mau balik ke icon default, ${displayName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#967EFA', // Warna Ungu
      cancelButtonColor: '#ff99d8',  // Warna Pink
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Gak Jadi',
      reverseButtons: true,
      background: '#ffffff',
      // borderRadius dihapus dari sini karena bikin error TypeScript
      customClass: {
        // Kita pindahkan styling bulatnya ke sini pakai class Tailwind
        popup: 'rounded-[2rem] font-sans border-none shadow-2xl',
        title: 'font-black italic uppercase tracking-tighter text-zinc-800',
        confirmButton: 'rounded-2xl px-8 py-3 font-black uppercase italic tracking-widest transition-all hover:scale-105 ml-3',
        cancelButton: 'rounded-2xl px-8 py-3 font-black uppercase italic tracking-widest transition-all hover:scale-105'
      }
    });

    if (result.isConfirmed) {
      try {
        setIsUploading(true);
        toast.loading("Lagi menghapus foto kamu... 🗑️", { id: "delete-toast" });

        const response = await api.delete("/delete-avatar");

        if (response.status === 200) {
          toast.success("Foto profil berhasil dihapus! ✨", { id: "delete-toast" });
          refetch(); 
        }
      } catch (error: any) {
        console.error("Delete Error:", error);
        toast.error(error.response?.data?.message || "Gagal hapus foto", { id: "delete-toast" });
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fafafa]">
        <div className="animate-pulse font-black italic text-zinc-400">LOADING GLOW...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaff] p-6 md:p-12 font-sans">
      
      <input 
        type="file" 
        id="avatar-upload"
        key="avatar-input-key"
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      <Button 
        variant="ghost" 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          navigate("/dashboard", { replace: true });
        }} 
        className="mb-8 hover:bg-white rounded-full px-6 font-bold text-zinc-500 hover:text-[#967EFA] transition-all shadow-sm bg-white/50 cursor-pointer relative z-50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      <div className="max-w-2xl mx-auto">
        <Card className="border-none shadow-[0_20px_50_rgba(150,126,250,0.15)] rounded-[3.5rem] overflow-hidden bg-white/90 backdrop-blur-md">
          
          <CardHeader className="relative h-40" style={{ background: glowGradient }}>
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className={`w-28 h-28 rounded-[2.5rem] border-8 border-white bg-zinc-100 flex items-center justify-center overflow-hidden shadow-xl rotate-3 transition-opacity ${isUploading ? 'opacity-50' : ''}`}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" key={user.avatar} />
                  ) : (
                    <User size={48} className="text-zinc-300" />
                  )}
                </div>

                <button 
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-2.5 rounded-2xl shadow-lg text-white hover:scale-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer z-20"
                  style={{ background: glowGradient }}
                >
                  <Camera size={18} />
                </button>

                {/* TOMBOL HAPUS CANTIK */}
                {user?.avatar && (
                  <button 
                    type="button"
                    disabled={isUploading}
                    onClick={handleDeleteAvatar}
                    className="absolute -top-1 -right-1 p-1.5 rounded-xl bg-white border border-zinc-200 shadow-md text-red-400 hover:text-red-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer z-20"
                    title="Hapus Foto"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-20 pb-12 px-10 text-center">
            <div className="mb-10">
                <CardTitle className="text-4xl font-black text-zinc-800 uppercase italic tracking-tighter">
                  User <span style={{ color: "#967EFA" }}>Profile</span>
                </CardTitle>
                <div className="h-1.5 w-12 mx-auto mt-2 rounded-full" style={{ background: glowGradient }}></div>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 group">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#ff99d8]">
                  <User size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Username</p>
                  <p className="font-bold text-zinc-700 text-lg">{user?.username || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 group">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#ff99d8]">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</p>
                  <p className="font-bold text-zinc-700 text-lg">{user?.email || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 group">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#967EFA]">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Status</p>
                  <p className="font-bold text-purple-500 italic flex items-center gap-2">
                    Verified Member <span className="text-[10px] not-italic bg-purple-100 px-2 py-0.5 rounded-full">Pro</span>
                  </p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full mt-10 text-white rounded-[1.5rem] py-8 font-black uppercase italic tracking-[0.15em] shadow-xl transition-all hover:opacity-90 cursor-pointer"
              style={{ background: glowGradient }}
              onClick={() => navigate("/user/profile/edit")}
            >
              Update My Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}