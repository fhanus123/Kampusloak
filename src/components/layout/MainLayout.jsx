import { Outlet, useMatch } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useCategories } from "../../hooks/useCategories";
import VerificationBanner from "./VerificationBanner";

export default function MainLayout() {
  const categories = useCategories();
  const isChat = Boolean(useMatch("/chat/*"));
  const hasThread = Boolean(useMatch("/chat/:conversationId"));

  return (
    <div
      className={`flex flex-col ${isChat ? `h-dvh ${hasThread ? "overflow-hidden" : "overflow-y-auto"}` : "min-h-screen"}`}
    >
      <div className={`shrink-0 ${hasThread ? "hidden lg:block" : ""}`}>
        <Navbar categories={categories} />
        <VerificationBanner />
      </div>
      <main
        className={`mx-auto w-full max-w-7xl flex-1 ${
          hasThread
            ? "flex min-h-0 flex-col overflow-hidden p-0 lg:px-4 lg:py-6"
            : isChat
              ? "flex min-h-64 flex-col overflow-hidden px-4 py-3 sm:py-6"
              : "px-4 py-6"
        }`}
      >
        <Outlet context={{ categories }} />
      </main>
      {!isChat && <Footer />}
    </div>
  );
}
