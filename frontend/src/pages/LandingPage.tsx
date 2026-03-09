import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Search, 
  MessageSquareHeart, 
  ShieldCheck, 
  ArrowRight,
  Star
} from "lucide-react";
import bg1 from "@/assets/bg1.png"; // Mengambil asset yang sudah ada

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF9] font-sans overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/20 bg-white/30 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff99d8] to-[#967EFA] flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-serif italic font-black tracking-tighter text-zinc-800">GlowUp.Space</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-sm font-bold text-zinc-600 hover:text-[#967EFA]">LOGIN</Button>
          <Button 
            onClick={() => navigate("/register")}
            className="rounded-full px-6 font-bold text-white shadow-lg border-none"
            style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}
          >
            JOIN NOW
          </Button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-[#B799FF]/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute top-40 -right-20 w-72 h-72 bg-[#ff99d8]/20 rounded-full blur-[100px] -z-10" />
        
        <span className="px-4 py-1.5 rounded-full bg-white border border-zinc-100 text-[10px] font-black tracking-[0.3em] uppercase text-[#B799FF] shadow-sm mb-6">
          Your Ultimate Beauty Directory
        </span>
        
        <h1 className="text-6xl md:text-8xl font-serif italic text-zinc-800 leading-[0.9] mb-8">
          Reveal Your <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff99d8] to-[#967EFA]">True Glow.</span>
        </h1>
        
        <p className="max-w-2xl text-zinc-500 text-lg md:text-xl font-light leading-relaxed mb-10">
          Temukan ulasan jujur dari ribuan pecinta beauty. Kelola produk favoritmu dan bagikan perjalanan "glow up" kamu bersama komunitas kami.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate("/register")}
            className="h-16 px-10 rounded-full text-lg font-bold shadow-2xl transition-all hover:scale-105"
            style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}
          >
            Start My Journey <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" onClick={() => navigate("/login")} className="h-16 px-10 rounded-full text-lg font-bold border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all">
            Explore Directory
          </Button>
        </div>

        {/* Floating Product Card Preview */}
        <div className="mt-20 relative w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white">
          <img src={bg1} className="w-full h-full object-cover" alt="App Preview" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-10 left-10 text-white text-left">
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5].map(s => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="font-serif italic text-2xl">"The best place to find skincare reviews!"</p>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Search className="text-white" />} 
            title="Smart Search" 
            desc="Cari produk berdasarkan kategori, brand, atau jenis kulitmu dengan mudah." 
          />
          <FeatureCard 
            icon={<MessageSquareHeart className="text-white" />} 
            title="Honest Reviews" 
            desc="Baca pengalaman asli dari pengguna lain sebelum memutuskan membeli produk." 
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-white" />} 
            title="Curated Lists" 
            desc="Simpan produk favoritmu dan buat koleksi skincare impian dalam satu tempat." 
          />
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <section className="py-16 bg-[#967EFA]">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-around text-center gap-8">
          <div>
            <h4 className="text-4xl font-serif italic text-white mb-1">10k+</h4>
            <p className="text-white/70 text-xs font-bold tracking-widest uppercase">Glowvers Joined</p>
          </div>
          <div>
            <h4 className="text-4xl font-serif italic text-white mb-1">500+</h4>
            <p className="text-white/70 text-xs font-bold tracking-widest uppercase">Premium Brands</p>
          </div>
          <div>
            <h4 className="text-4xl font-serif italic text-white mb-1">50k+</h4>
            <p className="text-white/70 text-xs font-bold tracking-widest uppercase">Real Stories</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 text-center border-t border-zinc-100">
        <h2 className="text-3xl font-serif italic text-zinc-800 mb-6">Ready to glow up, Glowvers</h2>
        <Button 
          onClick={() => navigate("/register")}
          className="rounded-full px-12 h-14 font-bold text-white shadow-xl shadow-purple-200"
          style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}
        >
          CREATE FREE ACCOUNT
        </Button>
        <div className="mt-16 pt-8 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-400 text-[10px] font-bold tracking-widest">
          <p>© 2026 GLOWUP.SPACE DIRECTORY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8 uppercase">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Instagram</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-[2.5rem] bg-[#FDFBF9] border border-zinc-100 transition-all hover:shadow-2xl hover:-translate-y-2">
      <div className="w-12 h-12 rounded-2xl bg-[#967EFA] flex items-center justify-center mb-6 shadow-lg shadow-purple-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-serif italic text-zinc-800 mb-3">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}