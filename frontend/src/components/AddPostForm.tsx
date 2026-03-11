import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface AddPostFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  defaultValues?: any; 
}

export default function AddPostForm({ onSubmit, isLoading, defaultValues }: AddPostFormProps) {
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors } 
  } = useForm({
    // Pastikan defaultValues juga menyertakan suitable_for jika dalam mode edit
    defaultValues: defaultValues
  });

  const { data: categories } = useCategories();

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    register("gambar", { 
      required: defaultValues ? false : "Foto produk wajib diunggah!" 
    });
    // Kita pastikan suitable_for ter-register (sudah otomatis lewat props {...register})
  }, [register, defaultValues]);

  const selectedFile = watch("gambar");

  const handleInternalSubmit = (data: any) => {
    Swal.fire({
      title: defaultValues ? "Simpan perubahan?" : "Posting produk baru?",
      text: "Pastikan data skincare sudah benar ya!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#967EFA",
      cancelButtonColor: "#ff99d8",
      confirmButtonText: "Ya, Gas! 🚀",
      cancelButtonText: "Cek lagi",
      customClass: {
        popup: 'rounded-[2rem]',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Data di sini sekarang akan mengandung: judul, isi, category_id, suitable_for, dan gambar
        onSubmit(data);
      }
    });
  };

  return (
    <form 
      onSubmit={handleSubmit(handleInternalSubmit)} 
      className="space-y-5 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50"
    >
      <div className="space-y-1.5">
        <Label className="text-zinc-700 font-bold ml-1 text-xs uppercase tracking-wider">Nama Produk</Label>
        <Input 
          {...register("judul", { required: "Nama produk harus diisi" })} 
          placeholder="Masukkan nama produk..." 
          className="rounded-xl border-zinc-200 text-zinc-800 focus-visible:ring-[#B799FF]"
        />
        {errors.judul && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.judul.message as string}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-700 font-bold ml-1 text-xs uppercase tracking-wider">Deskripsi</Label>
        <textarea 
          {...register("isi", { required: "Deskripsi harus diisi" })} 
          className="w-full min-h-[120px] p-3 rounded-xl border border-zinc-200 text-sm text-zinc-800 focus:ring-1 focus:ring-[#B799FF] outline-none"
          placeholder="Detail produk..."
        />
        {errors.isi && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.isi.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-zinc-700 font-bold ml-1 text-xs uppercase tracking-wider">Kategori</Label>
          <select 
            {...register("category_id", { required: "Pilih satu kategori" })}
            className="w-full p-2.5 rounded-xl border border-zinc-200 text-sm bg-white text-zinc-900 font-medium outline-none focus:border-[#B799FF]"
          >
            <option value="">-- Pilih Kategori --</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.category_id && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.category_id.message as string}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-zinc-700 font-bold ml-1 text-xs uppercase tracking-wider">Cocok Untuk Kulit</Label>
          <select 
            {...register("suitable_for", { required: "Pilih tipe kulit" })}
            className="w-full p-2.5 rounded-xl border border-zinc-200 text-sm bg-white text-zinc-900 font-medium outline-none focus:border-[#B799FF]"
          >
            <option value="">-- Pilih Jenis --</option>
            <option value="Oily">Oily</option>
            <option value="Dry">Dry</option>
            <option value="Sensitive">Sensitive</option>
            <option value="Combination">Combination</option>
            <option value="Normal">Normal</option>
          </select>
          {errors.suitable_for && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.suitable_for.message as string}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-700 font-bold ml-1 text-xs uppercase tracking-wider">Foto Produk</Label>
        <div className={`border-2 border-dashed rounded-2xl p-4 transition-all ${selectedFile ? 'border-[#B799FF] bg-purple-50/50' : 'border-zinc-200'}`}>
          <Input 
            type="file" 
            accept="image/*"
            className="cursor-pointer border-none shadow-none text-zinc-500"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setValue("gambar", file);
            }}
          />
        </div>
        {errors.gambar && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.gambar.message as string}</p>}
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full text-white font-bold py-6 rounded-2xl shadow-lg transition-all active:scale-95 border-none"
        style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : (defaultValues ? "Simpan Perubahan ✨" : "Posting Produk")}
      </Button>
    </form>
  );
}