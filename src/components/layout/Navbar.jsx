import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Heart,
  MessageCircle,
  ChevronDown,
  Check,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Star,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import NotificationBell from "./NotificationBell";

export default function Navbar({ categories }) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const unread = useUnreadCount();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const routeCategory = searchParams.get("category") ?? "";
  const userMenuRef = useRef(null);
  const navbarRef = useRef(null);
  const categoryTriggerRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const categoryOptionRefs = useRef([]);
  const searchInputRef = useRef(null);
  const [categoryFocus, setCategoryFocus] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categoryMenuIndex, setCategoryMenuIndex] = useState(0);
  const [pendingCategory, setPendingCategory] = useState(null);
  const selectedCategory =
    pendingCategory?.locationKey === location.key
      ? pendingCategory.value
      : routeCategory;
  const categoryOptions = [
    { slug: "", name: "Semua" },
    ...categories.map((item) => ({ slug: item.slug, name: item.name })),
  ];
  const selectedCategoryIndex = Math.max(
    0,
    categoryOptions.findIndex((item) => item.slug === selectedCategory),
  );
  const selectedCategoryName = categoryOptions[selectedCategoryIndex].name;

  useEffect(() => {
    const closeOutside = (event) => {
      const menu = userMenuRef.current;
      if (menu?.open && !menu.contains(event.target)) menu.open = false;
    };
    const closeOnEscape = (event) => {
      const menu = userMenuRef.current;
      if (event.key === "Escape" && menu?.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!categoryFocus) return;

    const closeOutside = (event) => {
      if (!navbarRef.current?.contains(event.target)) setCategoryFocus(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setCategoryFocus(false);
        categoryTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [categoryFocus]);

  useEffect(() => {
    if (!categoryMenuOpen) return;

    categoryOptionRefs.current[categoryMenuIndex]?.focus();

    const closeOutside = (event) => {
      if (
        !categoryTriggerRef.current?.contains(event.target) &&
        !categoryMenuRef.current?.contains(event.target)
      ) {
        setCategoryMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setCategoryMenuOpen(false);
        categoryTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [categoryMenuOpen, categoryMenuIndex]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q")?.toString().trim();
    const selectedCategory = formData.get("category")?.toString() ?? "";
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    setCategoryFocus(false);
    setCategoryMenuOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  const openCategoryMenu = () => {
    setCategoryMenuIndex(selectedCategoryIndex);
    setCategoryMenuOpen(true);
  };

  const handleCategoryTriggerKeyDown = (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    openCategoryMenu();
  };

  const handleCategoryOptionKeyDown = (event, index) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setCategoryMenuIndex(
        (index + direction + categoryOptions.length) % categoryOptions.length,
      );
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setCategoryMenuIndex(event.key === "Home" ? 0 : categoryOptions.length - 1);
    }
  };

  const handleCategorySelect = (slug) => {
    setPendingCategory({ locationKey: location.key, value: slug });
    setCategoryMenuOpen(false);
    setCategoryFocus(true);
    searchInputRef.current?.focus();
  };

  return (
    <>
      {categoryFocus && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 bg-black/15"
        />
      )}
      <header ref={navbarRef} className="relative z-50 shrink-0 bg-nav text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-3 py-3 sm:gap-x-4 sm:px-4 md:grid-cols-[minmax(150px,0.55fr)_minmax(280px,2fr)_auto]">
        <Link
          to="/"
          className="min-w-0 text-base font-extrabold tracking-tight sm:text-xl"
        >
          Kampus<span className="text-cta">Loak</span>
        </Link>

        <div className="relative col-span-2 order-3 w-full md:col-span-1 md:order-0">
          <form
            key={`${location.pathname}${location.search}`}
            onSubmit={handleSearch}
            className="flex w-full overflow-hidden rounded-lg bg-white"
          >
            <input type="hidden" name="category" value={selectedCategory} />
            <button
              ref={categoryTriggerRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={categoryMenuOpen}
              aria-controls={
                categoryMenuOpen ? "navbar-category-menu" : undefined
              }
              onClick={() =>
                categoryMenuOpen
                  ? setCategoryMenuOpen(false)
                  : openCategoryMenu()
              }
              onKeyDown={handleCategoryTriggerKeyDown}
              className="flex max-w-36 min-w-[6.5rem] shrink-0 items-center justify-between gap-1 border-r border-ink/10 bg-page px-2 py-2.5 text-left text-sm text-ink transition-colors duration-150 hover:bg-brand/10 active:bg-brand/15 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand motion-reduce:transition-none"
            >
              <span className="truncate">{selectedCategoryName}</span>
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${
                  categoryMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <input
              ref={searchInputRef}
              name="q"
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="Cari buku, laptop, perabot kos..."
              className={`min-w-0 flex-1 px-3 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset ${
                categoryFocus ? "ring-2 ring-brand ring-inset" : ""
              }`}
            />
            <button
              type="submit"
              aria-label="Cari"
              className="bg-cta px-4 text-ink hover:brightness-95"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
          {categoryMenuOpen && (
            <div
              ref={categoryMenuRef}
              id="navbar-category-menu"
              role="menu"
              aria-label="Pilih kategori"
              className="absolute left-0 top-full z-[60] mt-2 max-h-72 min-w-56 overflow-y-auto rounded-xl border border-ink/15 bg-white p-1.5 text-ink shadow-xl animate-[category-menu-in_140ms_ease-out] motion-reduce:animate-none"
            >
              {categoryOptions.map((option, index) => {
                const isSelected = option.slug === selectedCategory;
                return (
                  <button
                    key={option.slug || "all"}
                    ref={(element) => {
                      categoryOptionRefs.current[index] = element;
                    }}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    tabIndex={categoryMenuIndex === index ? 0 : -1}
                    onClick={() => handleCategorySelect(option.slug)}
                    onKeyDown={(event) =>
                      handleCategoryOptionKeyDown(event, index)
                    }
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-page hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[-2px] active:bg-brand/15 motion-reduce:transition-none ${
                      isSelected
                        ? "bg-nav-sub/10 font-semibold text-nav-sub hover:bg-nav-sub/15"
                        : ""
                    }`}
                  >
                    {option.name}
                    {isSelected && (
                      <Check
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <nav className="justify-self-end flex items-center gap-1 text-sm sm:gap-3">
          <Link
            to={user ? "/saved" : "/login"}
            aria-label="Barang tersimpan"
            title="Barang tersimpan"
            className="rounded-full p-2 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-mint"
          >
            <Heart className="h-5 w-5" />
          </Link>
          {user && <NotificationBell />}
          <Link
            to={user ? "/chat" : "/login"}
            aria-label="Chat"
            title="Chat"
            className="relative rounded-full p-2 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-mint"
          >
            <MessageCircle className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-ink">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          {user ? (
            <details
              ref={userMenuRef}
              className="group relative"
              onClick={(event) => {
                if (event.target.closest("a, button")) {
                  event.currentTarget.open = false;
                }
              }}
            >
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-2 transition hover:bg-white/10 hover:text-mint [&::-webkit-details-marker]:hidden">
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden max-w-24 truncate sm:inline">
                  {profile?.full_name?.split(" ")[0] ?? "Akun"}
                </span>
                <ChevronDown className="h-4 w-4 transition duration-200 group-open:rotate-180" />
              </summary>

              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink/10 bg-white py-2 text-ink shadow-xl">
                <div className="border-b border-ink/10 px-4 pb-2 mb-1">
                  <p className="text-xs text-ink/55">Masuk sebagai</p>
                  <Link
                    to={`/users/${user.id}`}
                    className="block truncate font-bold hover:text-brand"
                  >
                    {profile?.full_name ?? user.email}
                  </Link>
                </div>
                <Link
                  to={`/users/${user.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-page hover:text-brand"
                >
                  <Star className="h-4 w-4" aria-hidden="true" />
                  Profil &amp; ulasan saya
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-page hover:text-brand"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                <Link
                  to="/verification"
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-page hover:text-brand"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verifikasi akun
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-page hover:text-brand"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </details>
          ) : (
            <Link
              to="/register"
              className="rounded-lg bg-cta px-4 py-2 font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-gold"
            >
              Daftar
            </Link>
          )}
        </nav>
      </div>
      </header>
    </>
  );
}
