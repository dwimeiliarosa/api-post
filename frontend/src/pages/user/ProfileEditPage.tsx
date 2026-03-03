import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, Mail, Loader2 } from "lucide-react";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: isFetching } = useProfile();
  const updateProfile = useUpdateProfile();

  // State local untuk form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  // Isi form saat data user berhasil dimuat
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
  
  // Pastikan ID disertakan dalam payload
  const payload = {
    id: user?.id, // ID dari data useProfile
    username: formData.username,
    email: formData.email,
  };

  updateProfile.mutate(payload, {
    onSuccess: () => {
      navigate("/user/profile");
    },
  });
};

  const glowGradient = "linear-gradient(to right, #ff99d8, #967EFA)";

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaff] p-6 md:p-12">
      <div className="max-w-xl mx-auto">
        {/* Tombol Kembali */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 hover:bg-white rounded-full font-bold text-zinc-500 transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Batal
        </Button>

        <Card className="border-none shadow-[0_20px_50px_rgba(150,126,250,0.15)] rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-md">
          <CardHeader className="pb-2 pt-10 px-10">
            <CardTitle className="text-3xl font-black text-zinc-800 uppercase italic">
              Edit <span style={{ color: "#967EFA" }}>Profile</span>
            </CardTitle>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Update your beauty identity</p>
          </CardHeader>

          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Username */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Username</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <Input 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="pl-12 py-6 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:ring-[#967EFA]"
                    placeholder="Enter new username"
                  />
                </div>
              </div>

              {/* Input Email */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-12 py-6 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:ring-[#967EFA]"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Tombol Simpan */}
              <Button 
                type="submit"
                disabled={updateProfile.isPending}
                className="w-full mt-6 text-white rounded-2xl py-7 font-black uppercase italic tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: glowGradient }}
              >
                {updateProfile.isPending ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Save className="mr-2" size={18} />
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