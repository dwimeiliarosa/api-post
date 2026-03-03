import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/validations/auth";
import api from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";

// 1. IMPORT ASSET GAMBAR (Gunakan path relatif agar tidak error)
import bg1 from "../assets/bg1.png";
import bg2 from "../assets/bg2.png";
import bg3 from "../assets/bg3.png";
import bg4 from "../assets/bg4.png";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function LoginPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data Slider dengan nuansa Aurora Beauty
  const slides = [
    { url: bg1, title: "Welcome Back", desc: "Discover the magic in every touch of your beauty directory." },
    { url: bg2, title: "Define Your Glow", desc: "Manage your premium beauty products with an elegant system." },
    { url: bg3, title: "Pure Elegance", desc: "A modern and intuitive admin experience for beauty experts." },
    { url: bg4, title: "GlowUp.Space Portal", desc: "Your gateway to professional content management." }
  ];

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Logika Auto-Slide setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      // Sesuaikan endpoint backend kamu (/login atau /auth/login)
      const response = await api.post("/login", data);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/dashboard");
    } catch (error: any) {
      alert(error.response?.data?.message || "Login Gagal. Cek kembali email & password kamu.");
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
            {/* Overlay Gelap agar teks terbaca */}
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img
              src={slide.url}
              alt="Beauty Background"
              className="h-full w-full object-cover transition-transform duration-[10000ms]"
              style={{ transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)' }}
            />
            
            {/* Konten Teks di Atas Gambar */}
            <div className="absolute bottom-24 left-16 z-20 text-white max-w-lg">
              <p className="text-xs font-bold tracking-[0.4em] uppercase mb-2 text-white/70">
                Glow Up.Space Directory
              </p>
              <h2 className="text-6xl font-serif italic mb-4 leading-none">{slide.title}</h2>
              <div className="h-1 w-20 bg-[#D6B4FC] mb-6"></div>
              <p className="text-xl font-light tracking-wide opacity-90 leading-relaxed">{slide.desc}</p>
            </div>
          </div>
        ))}

        {/* Indikator Titik Slider */}
        <div className="absolute bottom-12 left-16 z-20 flex gap-3">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 transition-all duration-500 rounded-full ${i === currentSlide ? "w-12 bg-white" : "w-4 bg-white/40"}`} 
            />
          ))}
        </div>
      </div>

      {/* --- SISI KANAN: FORM LOGIN (40%) --- */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-12 xl:px-24 bg-[#FDFBF9]">
        
        <div className="mb-12 text-center lg:text-center">
          <p className="text-[11px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: "#B799FF" }}>
  Administration Portal
</p>
          <h1 className="text-4xl font-serif text-zinc-800 leading-tight">
            Welcome
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Field Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative border-b border-zinc-200 focus-within:border-[#B799FF] transition-all">
                      {/* Icon */}
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                      {/* Input dengan style padding-left manual */}
                      <Input 
                        placeholder="admin@makeup.com" 
                        {...field} 
                        style={{ paddingLeft: '2.5rem' }} // Memaksa jarak 40px dari kiri
                        className="h-12 border-none bg-transparent focus-visible:ring-0 shadow-none text-zinc-800 placeholder:text-zinc-300 w-full" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* Field Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Password</FormLabel>
                  <FormControl>
                    <div className="relative border-b border-zinc-200 focus-within:border-[#BC9479] transition-all">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                      <Input 
                        type="password" 
                        placeholder="••••••" 
                        {...field} 
                        style={{ paddingLeft: '2.5rem' }} // Memaksa jarak 40px dari kiri
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
    // Gradasi dari Ungu Muda ke Lavender sesuai gambar bg-dashboard
    background: "linear-gradient(to right, #ff99d8, #967EFA)",
    boxShadow: "0 10px 20px -10px rgba(183, 153, 255, 0.5)"
  }}
>
  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "SIGN IN"}
</Button>
          </form>
        </Form>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">
            Don't have an account?{" "}
           {/* Ganti warna text-[#BC9479] pada bagian Create Account di footer */}
<span 
  onClick={() => navigate("/register")}
  className="cursor-pointer hover:underline underline-offset-4"
  style={{ color: "#B799FF" }}
>
  Create Account
</span>
          </p>
        </div>
      </div>
    </div>
  );
}