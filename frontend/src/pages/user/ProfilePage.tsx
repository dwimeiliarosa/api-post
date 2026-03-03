import { useMe } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, ArrowLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useMe();

  const glowGradient = "linear-gradient(to right, #ff99d8, #967EFA)";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fafafa]">
        <div className="animate-pulse font-black italic text-zinc-400">LOADING GLOW...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaff] p-6 md:p-12 font-sans">
      {/* Tombol Back */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-8 hover:bg-white rounded-full px-6 font-bold text-zinc-500 hover:text-[#967EFA] transition-all shadow-sm bg-white/50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      <div className="max-w-2xl mx-auto">
        <Card className="border-none shadow-[0_20px_50px_rgba(150,126,250,0.15)] rounded-[3.5rem] overflow-hidden bg-white/90 backdrop-blur-md">
          
          {/* HEADER DENGAN GRADIENT BARU */}
          <CardHeader className="relative h-40" style={{ background: glowGradient }}>
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="w-28 h-28 rounded-[2.5rem] border-8 border-white bg-zinc-100 flex items-center justify-center overflow-hidden shadow-xl rotate-3">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-zinc-300" />
                  )}
                </div>
                {/* Tombol Ganti Foto dengan Gradient */}
                <button 
                  className="absolute -bottom-1 -right-1 p-2.5 rounded-2xl shadow-lg text-white hover:scale-110 transition-transform"
                  style={{ background: glowGradient }}
                >
                  <Camera size={18} />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-20 pb-12 px-10 text-center">
            <div className="mb-10">
                <CardTitle className="text-4xl font-black text-zinc-800 uppercase italic tracking-tighter">
                  User <span style={{ color: "#967EFA" }}>Profile</span>
                </CardTitle>
                <div className="h-1.5 w-12 mx-auto mt-2 rounded-full" style={{ background: glowGradient }}></div>
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4">
                  Member of Glow Up Space
                </p>
            </div>

            <div className="space-y-4 text-left">
              {/* Item Info 1 */}
              <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 group hover:border-purple-200 transition-colors">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#ff99d8] group-hover:text-[#967EFA] transition-colors">
                  <User size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Username</p>
                  <p className="font-bold text-zinc-700 text-lg">{user?.username || "-"}</p>
                </div>
              </div>

              {/* Item Info 2 */}
              <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 group hover:border-purple-200 transition-colors">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#ff99d8] group-hover:text-[#967EFA] transition-colors">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</p>
                  <p className="font-bold text-zinc-700 text-lg">{user?.email || "-"}</p>
                </div>
              </div>

              {/* Item Info 3 */}
              <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 group hover:border-purple-200 transition-colors">
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

            {/* Tombol Edit dengan Gradient */}
            <Button 
  className="w-full mt-10 text-white rounded-[1.5rem] py-8 font-black uppercase italic tracking-[0.15em] shadow-xl transition-all"
  style={{ background: glowGradient }}
  onClick={() => navigate("/user/profile/edit")} // Pastikan route ini sudah terdaftar
>
  Update My Profile
</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}