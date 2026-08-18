import React from 'react';
import logo from '../../photos/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="relative pt-10 pb-8 md:pt-16 md:pb-12 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-8 mb-8 md:mb-12">
          
          {/* Brend sekcija */}
          <div className="space-y-3 md:space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
            <a href="#" className="flex items-center gap-2.5 sm:gap-3">
              <img 
                src={logo} 
                alt="Bambino Logo" 
                className="w-12 sm:w-16 h-auto mix-blend-multiply object-contain" 
              />
              <span className="font-display font-bold text-2xl sm:text-3xl text-[#2C3E2E]">Bambino</span>
            </a>
            <p className="text-[#2C3E2E]/80 font-bold max-w-xs text-xs sm:text-sm leading-relaxed">
              Mesto gde nastaju najlepše uspomene. Vaša omiljena igraonica i rođendaonica na Novoj Detelinari.
            </p>
          </div>

          {/* Brzi linkovi */}
          <div className="text-center md:text-left space-y-2.5 md:space-y-3">
            <h4 className="font-display font-bold text-base sm:text-lg text-[#2C3E2E]">Navigacija</h4>
            <ul className="space-y-2 font-bold text-xs sm:text-sm text-[#2C3E2E]/80">
              <li><a href="#about" className="hover:text-[#3A5A40] transition-colors">O nama</a></li>
              <li><a href="#paketi" className="hover:text-[#3A5A40] transition-colors">Paketi</a></li>
              <li><a href="#galerija" className="hover:text-[#3A5A40] transition-colors">Galerija</a></li>
              <li><a href="#kontakt" className="hover:text-[#3A5A40] transition-colors">Kontakt</a></li>
            </ul>
          </div>

          {/* Informacije */}
          <div className="text-center md:text-left space-y-2.5 md:space-y-3">
            <h4 className="font-display font-bold text-base sm:text-lg text-[#2C3E2E]">Lokacija & Kontakt</h4>
            <p className="font-bold text-xs sm:text-sm text-[#2C3E2E]/80">Vaselina Masleše 32a</p>
            <p className="font-bold text-xs sm:text-sm text-[#2C3E2E]/80">Nova Detelinara, Novi Sad</p>
            <p className="font-bold text-xs sm:text-sm text-[#3A5A40]">+381 64 2745930</p>
          </div>

        </div>

        {/* Autorska prava / Bottom bar */}
        <div className="pt-6 md:pt-8 border-t border-[#3A5A40]/20 text-center font-bold text-[11px] sm:text-xs text-[#2C3E2E]/60">
          <p>© {new Date().getFullYear()} Bambino Igraonica. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  );
};