import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useAdminQueue } from "../../hooks/useAdminQueue";
import { useAuth } from "../../hooks/useAuth";
import { formatDateTime } from "../../lib/format";
import Spinner from "../ui/Spinner";

export default function NotificationBell() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const adminQueue = useAdminQueue();
  const {
    items,
    unread,
    loading,
    error,
    refetch,
    markRead,
    markAllRead,
    remove,
  } = useNotifications();
  const badgeCount = unread + adminQueue.total;
  const showEmpty =
    !loading &&
    !error &&
    items.length === 0 &&
    (!isAdmin ||
      (!adminQueue.loading &&
        !adminQueue.error &&
        adminQueue.items.length === 0));
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        bellRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleOpenItem = (item) => {
    markRead(item.id);
    if (item.link) {
      setOpen(false);
      navigate(item.link);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={bellRef}
        type="button"
        onClick={() => {
          if (!open) {
            refetch();
            if (isAdmin) adminQueue.refetch();
          }
          setOpen((v) => !v);
        }}
        aria-label="Notifikasi"
        aria-expanded={open}
        title="Notifikasi"
        className="relative rounded-full p-2 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-mint"
      >
        <Bell className="h-5 w-5 shrink-0" />
        {badgeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-ink">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-[calc(4rem+env(safe-area-inset-top))] z-50 flex max-h-[calc(100dvh-5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-auto flex-col overflow-hidden rounded-xl border border-ink/10 bg-white text-ink shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[min(27rem,calc(100dvh-5rem))] sm:w-80">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-ink/10 px-4 py-2.5">
            <p className="shrink-0 font-bold">Notifikasi</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-nav-sub hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5 shrink-0" /> Tandai semua
                dibaca
              </button>
            )}
          </div>

          <div className="min-h-0 overflow-y-auto [overflow-wrap:anywhere]">
            {isAdmin &&
              (adminQueue.loading ||
                adminQueue.error ||
                adminQueue.items.length > 0) && (
                <section className="space-y-2 border-b border-ink/10 p-3">
                  <p className="text-sm font-bold">Perlu ditinjau admin</p>

                  {adminQueue.loading ? (
                    <div className="flex justify-center py-3">
                      <Spinner />
                    </div>
                  ) : adminQueue.error ? (
                    <div role="alert" className="text-sm">
                      <p>{adminQueue.error}</p>
                      <button
                        type="button"
                        onClick={adminQueue.refetch}
                        className="font-semibold text-nav-sub underline"
                      >
                        Coba lagi
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {adminQueue.items.map((item) => (
                        <li key={item.key}>
                          <button
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              navigate(item.link);
                            }}
                            className="flex w-full items-center justify-between gap-3 rounded-lg bg-mint/20 p-2 text-left text-sm hover:bg-mint/40"
                          >
                            <span className="min-w-0">{item.title}</span>
                            <span className="shrink-0 rounded-full bg-cta px-2 text-xs font-bold">
                              {item.count}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm">
                <p>{error}</p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 font-semibold text-nav-sub underline"
                >
                  Coba Lagi
                </button>
              </div>
            ) : items.length === 0 ? (
              showEmpty && (
                <p className="p-6 text-center text-sm text-ink/60">
                  Belum ada notifikasi.
                </p>
              )
            ) : (
              <ul className="divide-y divide-ink/10">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-2 p-3 ${n.read_at ? "" : "bg-mint/20"}`}
                  >
                    <button
                      onClick={() => handleOpenItem(n)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p
                        className={`text-sm ${n.read_at ? "font-semibold" : "font-bold"}`}
                      >
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-ink/80">{n.body}</p>
                      <p className="mt-1 text-[10px] text-ink/50">
                        {formatDateTime(n.created_at)}
                      </p>
                    </button>
                    <button
                      onClick={() => remove(n.id)}
                      aria-label="Hapus notifikasi"
                      className="shrink-0 rounded-full p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
