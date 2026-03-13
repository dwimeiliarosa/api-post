import { useNavigate } from "react-router-dom";
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead, 
  Notification 
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, Bell, MessageCircle, Star, 
  Info, Loader2 
} from "lucide-react";
import myBackgroundImage from "@/assets/bg-dashboard.png";

export default function NotificationPage() {
  const navigate = useNavigate();
  
  // 1. Deklarasi Hooks
  const { data: notifications, isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllMutation = useMarkAllAsRead();

  // 2. Logika Navigasi & Klik
  const handleNotificationClick = (notif: Notification) => {
    // Tandai dibaca jika statusnya masih false
    if (!notif.is_read) {
      markAsReadMutation.mutate(notif.id);
    }
    
    // Arahkan ke detail postingan/produk
    if (notif.post_id) {
      navigate(`/detail/${notif.post_id}`);
    }
  };

  // 3. Helper UI (Icon)
  const getIcon = (type: string) => {
    switch (type) {
      case 'reply': return <MessageCircle className="text-pink-500" size={18} />;
      case 'review': return <Star className="text-amber-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div 
      className="min-h-screen bg-fixed bg-center bg-cover pb-20" 
      style={{ backgroundImage: `url(${myBackgroundImage})` }}
    >
      <div className="max-w-3xl mx-auto pt-10 px-4">
        {/* Tombol Kembali */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-all"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden">
          {/* Header Bagian Notifikasi */}
          <div className="p-8 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black italic text-zinc-800 uppercase tracking-tighter flex items-center gap-3">
                <Bell className="text-pink-500" /> Notifications
              </h1>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Jangan lewatkan update terbaru dari GlowUp Community!
              </p>
            </div>

            <Button 
              variant="outline" 
              className="rounded-full text-[10px] font-bold uppercase border-pink-200 text-pink-600 hover:bg-pink-50"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending || notifications?.length === 0}
            >
              {markAllMutation.isPending ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : null}
              Tandai Semua Dibaca
            </Button>
          </div>

          {/* List Notifikasi */}
          <div className="divide-y divide-zinc-50">
            {isLoading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="animate-spin text-pink-500" size={32} />
              </div>
            ) : notifications?.length === 0 ? (
              <div className="p-20 text-center text-zinc-400 italic">
                Belum ada notifikasi masuk ✨
              </div>
            ) : (
              notifications?.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-6 flex gap-4 transition-all cursor-pointer hover:bg-pink-50/30 ${
                    !notif.is_read ? 'bg-pink-50/50 border-l-4 border-l-pink-400' : ''
                  }`}
                >
                  {/* Icon Container */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    !notif.is_read ? 'bg-white shadow-sm' : 'bg-zinc-100'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  
                  {/* Content Container */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-sm font-bold truncate ${!notif.is_read ? 'text-zinc-800' : 'text-zinc-500'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-medium uppercase shrink-0">
                        {new Date(notif.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-zinc-600 mt-1 leading-relaxed line-clamp-2">
                      <span className="font-bold text-pink-600">
                        {notif.sender_name || 'System'}
                      </span> {notif.message}
                    </p>
                  </div>

                  {/* Dot Indikator Belum Dibaca */}
                  {!notif.is_read && (
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}