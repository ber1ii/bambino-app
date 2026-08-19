import React, { useState, useEffect } from "react";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { StickyBookBar } from "./components/common/StickyBookBar";
import { Hero } from "./components/hero/Hero";
import { About } from "./components/about/About";
import { OwnerMessage } from "./components/owner/OwnerMessage";
import { HowItWorks } from "./components/process/HowItWorks";
import { PackagesSection } from "./components/packages/PackagesSection";
import { Gallery } from "./components/gallery/Gallery";
import { Testimonials } from "./components/testimonials/Testimonials";
import { FAQ } from "./components/faq/FAQ";
import { BookingModal } from "./components/booking/BookingModal";
import type { PartyPackage } from "./types";
import { api, toPartyPackage } from "./services/api";

import treeTop from "./photos/tree-top.png";
import treeTrunk from "./photos/tree-trunk.png";
import treeRoot from "./photos/tree-root.png";
import { Contact } from "./components/contact/Contact";
import { MascotSection } from "./components/mascot/MascotSection";

// Admin Imports
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminArchive } from "./components/admin/AdminArchive";
import { AdminLogin } from "./components/admin/AdminLogin";
import { CateringSection } from "./components/contact/CateringSection";

export const App: React.FC = () => {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [adminPin, setAdminPin] = useState<string | null>(
    localStorage.getItem("bambino_admin_pin"),
  );
  const [adminView, setAdminView] = useState<"dashboard" | "archive">(
    "dashboard",
  );

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [packages, setPackages] = useState<PartyPackage[]>([]);

  useEffect(() => {
    // Check if URL is /admin
    if (window.location.pathname.startsWith("/admin")) {
      setIsAdminRoute(true);
    }

    api
      .getPackages()
      .then((pkgs) => setPackages(pkgs.map(toPartyPackage)))
      .catch((err) => console.error("Failed to load packages:", err));
  }, []);

  const handleAdminLoginSuccess = (pin: string) => {
    localStorage.setItem("bambino_admin_pin", pin);
    setAdminPin(pin);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("bambino_admin_pin");
    setAdminPin(null);
  };

  // If on /admin route, render Admin views
  if (isAdminRoute) {
    if (!adminPin) {
      return <AdminLogin onSuccess={handleAdminLoginSuccess} />;
    }

    if (adminView === "archive") {
      return (
        <AdminArchive
          token={adminPin}
          onBack={() => setAdminView("dashboard")}
        />
      );
    }

    return (
      <AdminDashboard
        token={adminPin}
        onLogout={handleAdminLogout}
        onOpenArchive={() => setAdminView("archive")}
      />
    );
  }

  const handleOpenBooking = () => {
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => setIsBookingOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F2EB] via-[#E8EED8] to-[#DCE6C8] text-[#2C3E2E] overflow-x-hidden">
      <Navbar onOpenBooking={handleOpenBooking} isGalleryOpen={isGalleryOpen} />

      <main className="relative z-10">
        <Hero onOpenBooking={handleOpenBooking} />

        <div className="relative">
          <div className="absolute -left-16 sm:left-0 top-0 bottom-0 w-40 sm:w-80 md:w-[480px] lg:w-[540px] pointer-events-none z-0 opacity-25 sm:opacity-40 mix-blend-multiply flex flex-col">
            <div
              className="w-full shrink-0 relative z-10 translate-x-[9%]"
              style={{
                aspectRatio: "1 / 1.1",
                backgroundImage: `url(${treeTop})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div
              className="w-full flex-grow bg-repeat-y bg-top relative z-0 -mt-1 -mb-1"
              style={{
                backgroundImage: `url(${treeTrunk})`,
                backgroundSize: "100% auto",
              }}
            />
            <div
              className="w-full shrink-0 relative z-10 translate-x-[10%]"
              style={{
                aspectRatio: "2 / 1",
                backgroundImage: `url(${treeRoot})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "bottom",
              }}
            />
          </div>

          <div className="relative z-10">
            <About />
            <OwnerMessage />
            <HowItWorks />

            <PackagesSection
              packages={packages}
              onSelectPackage={handleOpenBooking}
            />
            <MascotSection />
            <Testimonials />
            <Gallery onLightboxToggle={(isOpen) => setIsGalleryOpen(isOpen)} />
            <CateringSection />
            <Contact />
            <FAQ />
            <Footer />
          </div>
        </div>
      </main>

      <StickyBookBar onOpenBooking={handleOpenBooking} />

      <BookingModal isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </div>
  );
};

export default App;
