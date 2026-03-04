import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, Mail, Loader2 } from "lucide-react";

// 1. Import toast dari sonner
import { toast } from "sonner";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: isFetching } = useProfile();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: user?.id,
      username: formData.username,
      email: formData.email,
    };

    // 1. Buat loading toast dan simpan ID-nya
    const toastId = toast.loading('Updating your beauty identity...');

    // 2. Langsung panggil mutate
    updateProfile.mutate(payload, {
      onSuccess: () => {
        // Update toast jadi sukses
        toast.success('Profile updated successfully! ✨', { id: toastId });
        
        // PINDAH HALAMAN: Gunakan navigate bawaan react-router-dom
        // replace: true akan menghapus halaman edit dari history agar tidak perlu klik back 2x
        navigate("/user/profile", { replace: true });
      },
      onError: (err: any) => {
        // Update toast jadi error
        toast.error(err?.response?.data?.message || 'Gagal update profil', { id: toastId });
      }
    });
  };

  const glowGradient = "linear-gradient(to right, #ff99d8, #967EFA)";

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fcfaff]">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaff] p-6 md:p-12">
      <div className="max-w-xl mx-auto">
        <Button 
  variant="ghost" 
  onClick={() => window.location.href = "/user/profile"} 
  className="mb-6 hover:bg-white rounded-full font-bold text-zinc-400 transition-all"
>
  <ArrowLeft className="mr-2 h-4 w-4" /> Batal
</Button>

        <Card className="border-none shadow-[0_20px_50px_rgba(150,126,250,0.12)] rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-md">
          <CardHeader className="pb-2 pt-10 px-10">
            <CardTitle className="text-3xl font-black text-zinc-800 uppercase italic leading-none">
              Edit <span style={{ color: "#967EFA" }}>Profile</span>
            </CardTitle>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              Update your beauty identity
            </p>
          </CardHeader>

          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-zinc-400">Username</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#967EFA] transition-colors" size={18} />
                  <Input 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="pl-12 py-7 rounded-2xl border-zinc-100 bg-zinc-50/50 focus-visible:ring-[#967EFA] focus-visible:ring-offset-0 focus-visible:border-[#967EFA] transition-all"
                    placeholder="Enter new username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-zinc-400">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#967EFA] transition-colors" size={18} />
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-12 py-7 rounded-2xl border-zinc-100 bg-zinc-50/50 focus-visible:ring-[#967EFA] focus-visible:ring-offset-0 focus-visible:border-[#967EFA] transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={updateProfile.isPending}
                className="w-full mt-6 text-white rounded-2xl py-8 font-black uppercase italic tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-95 border-none"
                style={{ 
                  background: glowGradient,
                  boxShadow: "0 10px 25px -5px rgba(150, 126, 250, 0.4)" 
                }}
              >
                {updateProfile.isPending ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  <Save className="mr-2" size={20} />
                )}
                {updateProfile.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}