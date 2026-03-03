import * as React from "react"
import { usePosts } from "@/hooks/usePosts"
import { Heart, MessageSquare, Share2 } from "lucide-react"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  CardDescription
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Post {
  id: number;
  title: string;
  content: string;
  favoritesCount?: number;
  isFavorited?: boolean;
}

export const PostCard = ({ post }: { post: Post }) => {
  // Panggil toggleFavorite dari hook yang kita buat tadi
  const { toggleFavorite, isFavoriting } = usePosts();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Biar gak trigger link/card click
    toggleFavorite(post.id);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">
          {post.title}
        </CardTitle>
        <CardDescription>Baru saja diperbarui</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {post.content}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4 bg-slate-50/50">
        <div className="flex items-center gap-4">
          
          {/* TOMBOL LOVE */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleLike} 
              disabled={isFavoriting} 
              className={cn(
                "p-2 rounded-full transition-all active:scale-150 disabled:opacity-50",
                post.isFavorited ? "bg-red-100/50" : "hover:bg-slate-200"
              )}
            >
              <Heart 
                className={cn(
                  "transition-colors",
                  post.isFavorited 
                    ? "fill-red-500 text-red-500" 
                    : "text-slate-500 hover:text-red-400"
                )} 
                size={20}
              />
            </button>
            <span className={cn(
              "text-sm font-bold",
              post.isFavorited ? "text-red-500" : "text-slate-600"
            )}>
              {post.favoritesCount || 0}
            </span>
          </div>

          <button className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <MessageSquare size={20} />
          </button>
        </div>

        <button className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
          <Share2 size={20} />
        </button>
      </CardFooter>
    </Card>
  )
}