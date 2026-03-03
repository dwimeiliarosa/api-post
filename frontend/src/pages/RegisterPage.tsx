import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, User, Mail, Lock, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

// SESUAIKAN IMPORT INI:
import api from "@/api/axiosInstance"; 
import myBackgroundImage from "@/assets/bg_makeup.png"; 

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/register", formData);
      alert("Registrasi Berhasil! Silakan Login.");
      navigate("/login");
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.message || "Registrasi Gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed p-4 relative"
      style={{ backgroundImage: `url(${myBackgroundImage})` }}
    >
      {/* Overlay Soft */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>

      <Card className="relative z-10 w-full max-w-md border-none bg-white/90 backdrop-blur-2xl shadow-3xl rounded-[3rem] overflow-hidden">
        
        {/* Tombol Kembali (Floating Top Left inside Card) */}
        <button 
          onClick={() => navigate("/login")}
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-zinc-100 transition-colors group"
          title="Kembali ke Login"
        >
          <ArrowLeft size={20} className="text-zinc-400 group-hover:text-[#d857a6] transition-colors" />
        </button>

        <CardHeader className="pt-12 pb-2 text-center">
          {/* ICON BOX: Warna #d857a6 */}
          <div 
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 rotate-3 shadow-lg"
            style={{ 
              backgroundColor: "#d857a6",
              boxShadow: "0 10px 20px -5px rgba(216, 87, 166, 0.4)" 
            }}
          >
            <ShoppingBag size={32} />
          </div>
          
          <CardTitle className="text-3xl font-black text-zinc-800 tracking-tighter italic uppercase">
            Join <span style={{ color: "#d857a6" }}>Glow Up</span>
          </CardTitle>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mt-2">
            Mulai katalog cantikmu sekarang
          </p>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Username"
                  className="pl-10 bg-white/50 border-zinc-200 rounded-xl focus-visible:ring-[#d857a6]"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="pl-10 bg-white/50 border-zinc-200 rounded-xl focus-visible:ring-[#d857a6]"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10 bg-white/50 border-zinc-200 rounded-xl focus-visible:ring-[#d857a6]"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* SUBMIT BUTTON: Warna #d857a6 */}
            <Button 
              type="submit" 
              className="w-full text-white rounded-xl py-6 shadow-lg transition-all font-bold uppercase italic tracking-wider border-none"
              style={{ 
                backgroundColor: "#d857a6",
                boxShadow: "0 10px 15px -3px rgba(216, 87, 166, 0.3)"
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#bc468f")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#d857a6")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <>Daftar Sekarang <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-500 font-medium">
              Sudah punya akun?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="font-black hover:underline underline-offset-4"
                style={{ color: "#d857a6" }}
              >
                LOGIN DISINI
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}