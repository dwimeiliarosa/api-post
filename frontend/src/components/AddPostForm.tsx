import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";

// 1. Definisikan Interface Props agar TypeScript tidak error
interface AddPostFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  defaultValues?: any; // Data awal untuk mode Edit
}

export default function AddPostForm({ onSubmit, isLoading, defaultValues }: AddPostFormProps) {
  // 2. Inisialisasi useForm dengan defaultValues
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: defaultValues
  });

  const { data: categories } = useCategories();

  // 3. Efek untuk mengisi form saat data awal (Edit Mode) tersedia
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  // 4. Daftarkan field gambar (Required hanya jika mode Tambah)
  useEffect(() => {
    register("gambar", { 
      required: defaultValues ? false : "Foto produk wajib diunggah!" 
    });
  }, [register, defaultValues]);

  const selectedFile = watch("gambar");

  const handleInternalSubmit = (data: any) => {
    console.log("Data yang akan diproses:", data); 
    onSubmit(data);
  };

  return (
    <form 
      onSubmit={handleSubmit(handleInternalSubmit)} 
      className="space-y-5 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50"
    >
      
      {/* NAMA PRODUK */}
      <div className="space-y-1.5">
        <Label className="text-zinc-700 font-bold ml-1 text-xs uppercase tracking-wider">Nama Produk</Label>
        <Input 
          {...register("judul", { required: "Nama produk harus diisi" })} 
          placeholder="Masukkan nama produk..." 
          className="rounded-xl border-zinc-200 text-zinc-800 focus-visible:ring-[#B799FF]"
        />
        {errors.judul && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.judul.message as string}</p>}
      </div>

      {/* DESKRIPSI */}
      <div className="space-y-1.5">
        <Label className="text-zinc-700 font-bold ml-1 text-xs uppercase tracking-wider">Deskripsi</Label>
        <textarea 
          {...register("isi", { required: "Deskripsi harus diisi" })} 
          className="w-full min-h-[80px] p-3 rounded-xl border border-zinc-200 text-sm text-zinc-800 focus:ring-1 focus:ring-[#B799FF] outline-none"
          placeholder="Detail produk..."
        />
        {errors.isi && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.isi.message as string}</p>}
      </div>

      {/* KATEGORI */}
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

      {/* FOTO PRODUK */}
      <div className="space-y-1.5">
        <Label className="text-zinc-700 font-bold ml-1 text-xs uppercase tracking-wider">
          Foto Produk {defaultValues && <span className="text-[10px] text-zinc-400 normal-case">(Kosongkan jika tidak diganti)</span>}
        </Label>
        <div className={`border-2 border-dashed rounded-2xl p-4 transition-all ${selectedFile ? 'border-[#B799FF] bg-purple-50/50' : 'border-zinc-200'}`}>
          <Input 
            type="file" 
            accept="image/*"
            className="cursor-pointer border-none shadow-none text-zinc-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-[#967EFA] hover:file:bg-purple-100"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setValue("gambar", file);
            }}
          />
          {selectedFile && (
            <p className="text-[10px] text-[#967EFA] font-bold mt-2 truncate">
              ✓ {selectedFile instanceof File ? selectedFile.name : "File tersimpan"}
            </p>
          )}
          {errors.gambar && <p className="text-[10px] text-red-500 font-bold mt-2">{errors.gambar.message as string}</p>}
        </div>
      </div>

      {/* TOMBOL SUBMIT */}
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full text-white font-bold py-6 rounded-2xl shadow-lg transition-all active:scale-95 border-none"
        style={{ background: "linear-gradient(to right, #ff99d8, #967EFA)" }}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          defaultValues ? "Simpan Perubahan ✨" : "Posting Produk"
        )}
      </Button>
    </form>
  );
}