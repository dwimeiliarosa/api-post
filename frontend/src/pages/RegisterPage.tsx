import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/lib/validations/auth"; 
import api from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import Swal from "sweetalert2"; // 1. IMPORT SWEETALERT

// 1. IMPORT ASSET GAMBAR
import bg1 from "../assets/bg1.jpg";
import bg2 from "../assets/bg2.jpg";
import bg3 from "../assets/bg3.jpg";
import bg4 from "../assets/bg4.jpg";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. TAMBAHKAN HELPER TOAST CANTIK (Sama dengan Login agar konsisten)
  const showToast = (message: string, type: 'success' | 'error') => {
    Swal.fire({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: type,
      width: 'auto', 
      title: `<div style="font-family: 'Inter', sans-serif; font-weight: 500; color: white; font-size: 14px; padding: 0 10px; white-space: nowrap;">${message}</div>`,
      background: type === 'success' 
        ? 'linear-gradient(to right, #B799FF, #967EFA)' 
        : 'linear-gradient(to right, #ad4141, #a70808)',
      iconColor: '#ffffff',
      customClass: {
        popup: 'rounded-full px-6 py-1 shadow-2xl border-none mt-10 animate__animated animate__fadeInDown',
      }
    });
  };

    const slides = [
        { url: bg1, title: "Your Personal Skin Guide", desc: "Temukan kecocokan produk Glad2Glow melalui tes tipe kulit yang dirancang khusus untukmu." },
        { url: bg2, title: "Smart Product Matching", desc: "Sistem rekomendasi kami bekerja untuk memastikan setiap produk yang kamu pilih memberikan hasil maksimal." },
        { url: bg3, title: "Beauty Review Hub", desc: "Baca pengalaman nyata pengguna Glad2Glow dan bagikan perjalanan skin journey milikmu." },
        { url: bg4, title: "GlowUp.Space Experience", desc: "Solusi modern untuk manajemen perawatan diri dan konsultasi tipe kulit dalam satu platform." }
      ];


  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // 3. UPDATE LOGIKA ONSUBMIT DENGAN POP-UP CANTIK
  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post("/register", data);
      
      // Menggunakan Toast Sukses
      showToast("Registrasi Berhasil! Selamat datang di GlowUp ✨", "success");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Beri jeda agar user bisa melihat pop-up sukses
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registrasi Gagal. Cek kembali data kamu.";
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white overflow-hidden font-sans">
      
      {/* --- SISI KIRI: IMAGE SLIDER (60%) --- */}
      <div className="relative hidden lg:flex lg:w-[60%] bg-zinc-900 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img
              src={slide.url}
              alt="Beauty Background"
              className="h-full w-full object-cover transition-transform duration-[10000ms]"
              style={{ transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)' }}
            />
            
            <div className="absolute bottom-24 left-16 z-20 text-white max-w-lg">
              <p className="text-xs font-bold tracking-[0.4em] uppercase mb-2 text-white/70">
                Glad2Glow Directory
              </p>
              <h2 className="text-6xl font-serif italic mb-4 leading-none">{slide.title}</h2>
              <div className="h-1 w-20 bg-[#D6B4FC] mb-6"></div>
              <p className="text-xl font-light tracking-wide opacity-90 leading-relaxed">{slide.desc}</p>
            </div>
          </div>
        ))}

        <div className="absolute bottom-12 left-16 z-20 flex gap-3">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 transition-all duration-500 rounded-full ${i === currentSlide ? "w-12 bg-white" : "w-4 bg-white/40"}`} 
            />
          ))}
        </div>
      </div>

      {/* --- SISI KANAN: FORM REGISTER (40%) --- */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-12 xl:px-24 bg-[#FDFBF9]">
        
        <div className="mb-12 text-center lg:text-center">
          <p className="text-[11px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: "#B799FF" }}>
            Create Your Account
          </p>
          <h1 className="text-4xl font-serif text-zinc-800 leading-tight">
            Register
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Username</FormLabel>
                  <FormControl>
                    <div className="relative border-b border-zinc-200 focus-within:border-[#B799FF] transition-all">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                      <Input 
                        placeholder="ketik nama mu disini" 
                        {...field} 
                        style={{ paddingLeft: '2.5rem' }}
                        className="h-12 border-none bg-transparent focus-visible:ring-0 shadow-none text-zinc-800 placeholder:text-zinc-300 w-full" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative border-b border-zinc-200 focus-within:border-[#B799FF] transition-all">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                      <Input 
                        placeholder="emailkamu@example.com" 
                        {...field} 
                        style={{ paddingLeft: '2.5rem' }}
                        className="h-12 border-none bg-transparent focus-visible:ring-0 shadow-none text-zinc-800 placeholder:text-zinc-300 w-full" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Password</FormLabel>
                  <FormControl>
                    <div className="relative border-b border-zinc-200 focus-within:border-[#B799FF] transition-all">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                      <Input 
                        type="password" 
                        placeholder="••••••" 
                        {...field} 
                        style={{ paddingLeft: '2.5rem' }}
                        className="h-12 border-none bg-transparent focus-visible:ring-0 shadow-none text-zinc-800 placeholder:text-zinc-300 w-full" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 text-white font-bold tracking-[0.2em] rounded-none shadow-lg transition-all mt-4 border-none"
              style={{
                background: "linear-gradient(to right, #ff99d8, #967EFA)",
                boxShadow: "0 10px 20px -10px rgba(183, 153, 255, 0.5)"
              }}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "SIGN UP"}
            </Button>
          </form>
        </Form>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">
            Already have an account?{" "}
            <span 
              onClick={() => navigate("/login")}
              className="cursor-pointer hover:underline underline-offset-4"
              style={{ color: "#B799FF" }}
            >
              Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}