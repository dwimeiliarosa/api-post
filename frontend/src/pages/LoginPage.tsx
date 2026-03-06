import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/validations/auth";
import api from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

// ASSET GAMBAR
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

  // 1. PERBAIKAN: Gunakan fungsi ini supaya tidak ada error "Cannot find name 'toast'"
const showToast = (message: string, type: 'success' | 'error') => {
    Swal.fire({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: type,
      // Width auto supaya kapsulnya tidak kepanjangan/kependekan
      width: 'auto', 
      title: `<div style="font-family: 'Inter', sans-serif; font-weight: 500; color: white; font-size: 14px; padding: 0 10px; white-space: nowrap;">${message}</div>`,
      background: type === 'success' 
        ? 'linear-gradient(to right, #B799FF, #967EFA)' 
        : 'linear-gradient(to right, #ad4141, #a70808)',
      iconColor: '#ffffff',
      customClass: {
        // mt-10 supaya agak turun sedikit dari paling atas layar
        popup: 'rounded-full px-6 py-1 shadow-2xl border-none mt-10 animate__animated animate__fadeInDown',
      }
    });
  };
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

const onSubmit = async (data: LoginFormValues) => {
  // 1. Tambahkan ini untuk memastikan tidak ada reload liar
  // (Walaupun react-hook-form biasanya sudah menangani, ini buat jaga-jaga)
  
  setIsSubmitting(true);
  try {
    const response = await api.post("/login", data);
    
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);

    const loginName = response.data.username || "Glowvers"; 
    showToast(`Login berhasil! Halo, ${loginName}`, "success");
    
    // Biarkan loading sampai pindah halaman
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000); 

  } catch (error: any) {
    console.error("Login Error:", error);

    let errorMessage = "Terjadi kesalahan, coba lagi ya!";
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message?.toLowerCase() || "";

    if (backendMessage.includes("email") || backendMessage.includes("tidak ditemukan") || status === 404) {
      errorMessage = "Email-nya nggak terdaftar nih, ayo registrasi dulu! 📝";
    } 
    else if (status === 401 || backendMessage.includes("password") || backendMessage.includes("salah")) {
      errorMessage = "Yah... :( Password-nya salah, ayo coba lagi! 🔑";
    }

    showToast(errorMessage, "error");
    
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);

  }
};

  return (
    <div className="flex min-h-screen bg-white overflow-hidden font-sans">
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
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-24 left-16 z-20 text-white max-w-lg">
              <h2 className="text-6xl font-serif italic mb-4 leading-none">{slide.title}</h2>
              <p className="text-xl font-light tracking-wide opacity-90 leading-relaxed">{slide.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full lg:w-[40%] flex flex-col justify-center px-12 xl:px-24 bg-[#FDFBF9]">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-serif text-zinc-800 leading-tight">Welcome</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative border-b border-zinc-200 focus-within:border-[#B799FF] transition-all">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                      <Input placeholder="admin@makeup.com" {...field} style={{ paddingLeft: '2.5rem' }} className="h-12 border-none bg-transparent focus-visible:ring-0 shadow-none text-zinc-800 w-full" />
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
                    <div className="relative border-b border-zinc-200 focus-within:border-[#BC9479] transition-all">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                      <Input type="password" placeholder="••••••" {...field} style={{ paddingLeft: '2.5rem' }} className="h-12 border-none bg-transparent focus-visible:ring-0 shadow-none text-zinc-800 w-full" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 text-white font-bold tracking-[0.2em] rounded-none shadow-lg transition-all mt-4 border-none cursor-pointer"
              style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "SIGN IN"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}