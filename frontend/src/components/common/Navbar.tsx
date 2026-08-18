import React, { useState, useEffect } from 'react';
import { Calendar, Phone, Menu, X } from 'lucide-react';
import logo from '../../photos/logo.png'; 

interface NavbarProps {
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'O nama', href: '#owner-message' },
    { name: 'Paketi', href: '#paketi' },
    { name: 'Galerija', href: '#gallery' },
    { name: 'Kontakt', href: '#kontakt' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3 sm:py-4'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div 
          className={`flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 backdrop-blur-md ${
            isScrolled 
              ? 'bg-white/90 shadow-[0_10px_30px_-10px_rgba(58,90,64,0.15)] border border-[#3A5A40]/20' 
              : 'bg-white/80 shadow-lg border-2 border-[#E9C46A]/40'
          }`}
        >
          {/* Logo Sekcija */}
          <a href="#" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <img 
              src={logo} 
              alt="Bambino Logo" 
              className="w-10 sm:w-12 h-auto mix-blend-multiply object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-display font-bold text-xl sm:text-2xl text-[#2C3E2E] tracking-wide hidden sm:block">
              Bambino
            </span>
          </a>

          {/* Navigacioni Linkovi (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-bold text-[#2C3E2E]/80 hover:text-[#3A5A40] transition-colors text-base"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Akcije (Poziv, Zakaži & Mobile Toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Brzi kontakt dugme */}
            <a
              href="tel:+381600000000"
              className="p-2 sm:px-4 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm text-[#3A5A40] bg-[#3A5A40]/10 hover:bg-[#3A5A40]/20 transition-all flex items-center gap-2"
              title="Pozovite nas"
            >
              <Phone className="w-4 h-4 text-[#3A5A40]" />
              <span className="hidden lg:inline">Kontakt</span>
            </a>

            {/* Dugme za zakazivanje */}
            <button
              onClick={onOpenBooking}
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-black text-xs sm:text-sm text-white bg-[#3A5A40] hover:bg-[#2C3E2E] transition-all shadow-md hover:scale-105 flex items-center gap-1.5 sm:gap-2"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E9C46A]" />
              <span>Zakaži</span>
            </button>

            {/* Mobile Meni Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-full text-[#2C3E2E] hover:bg-[#3A5A40]/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Meni */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-[#3A5A40]/20 shadow-2xl flex flex-col gap-3 sm:gap-4 text-center max-h-[85vh] overflow-y-auto">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-bold text-base sm:text-lg text-[#2C3E2E] hover:text-[#3A5A40] py-2 border-b border-[#3A5A40]/10 last:border-0"
              >
                {link.name}
              </a>
            ))}
            <a
              href="tel:+381600000000"
              className="mt-2 py-3 rounded-2xl font-bold text-sm sm:text-base text-[#3A5A40] bg-[#3A5A40]/10 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#3A5A40]" />
              <span>Pozovi nas odmah</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
};