import React from 'react';
import { motion } from 'framer-motion';
import { CalendarHeart, Sparkles, MapPin } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
}

const heroImg = new URL('../../photos/20.jpeg', import.meta.url).href;

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center pt-32 md:pt-40 pb-12 md:pb-16 overflow-hidden">
      
      {/* Continuously Shifting & Morphing Olive Green Element */}
      <motion.div
        animate={{
          y: [0, -35, 25, 0],
          x: [0, 25, -20, 0],
          scale: [1, 1.06, 0.95, 1],
          borderRadius: [
            "50% 50% 50% 50% / 50% 50% 50% 50%",
            "40% 60% 70% 30% / 40% 50% 60% 50%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "35% 65% 50% 50% / 50% 30% 70% 50%",
            "50% 50% 50% 50% / 50% 50% 50% 50%",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.12,
          transition: { duration: 0.4 }
        }}
        className="absolute top-1/4 -right-16 sm:-right-10 md:right-10 w-40 h-40 sm:w-52 sm:h-52 md:w-72 md:h-72 bg-[#6B8E23] opacity-60 cursor-pointer shadow-2xl z-0 pointer-events-auto"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-12 items-center">
          
          {/* Tekstualni deo */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/90 border-2 border-[#F6E05E] text-[#2D3748] font-black shadow-lg backdrop-blur-sm text-xs sm:text-sm md:text-base"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F6E05E] fill-current" />
              <span>Dobrodošli u svet mašte!</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-semibold text-4xl sm:text-5xl lg:text-7xl text-[#2D3748] leading-[1.1] title-shadow"
            >
              Igraonica & <br />
              <span className="text-[#319795]">Rođendaonica</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-xl font-bold text-[#2D3748]/80 max-w-lg mx-auto lg:mx-0 px-2 sm:px-0"
            >
              Moderan i bezbedan prostor za igru, istraživanje i najlepše rođendanske uspomene.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 px-4 sm:px-0"
            >
              <button onClick={onOpenBooking} className="cloud-btn w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3">
                <CalendarHeart className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                Zakaži proslavu
              </button>
              <a 
                href="#paketi" 
                className="w-full sm:w-auto text-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-black text-[#2D3748] bg-white border-4 border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-all shadow-lg hover:scale-105 text-base sm:text-lg"
              >
                Pogledaj pakete
              </a>
            </motion.div>
          </div>

          {/* Povećana Hero Slika sa Lokacijom Ispod */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="lg:col-span-6 relative flex flex-col items-center justify-center gap-4 mt-6 lg:mt-0"
          >
            {/* Pozadinska sjajna mrlja */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F6E05E]/40 via-[#63B3ED]/30 to-[#4CAF50]/30 rounded-[2rem] sm:rounded-[3rem] blur-xl sm:blur-2xl transform rotate-6 scale-105 pointer-events-none" />

            {/* Povećan ram slike (max-w-2xl) */}
            <div className="relative z-10 rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-4 sm:border-8 border-white shadow-2xl aspect-[4/3] w-full max-w-md sm:max-w-2xl mx-auto transform hover:rotate-1 transition-transform duration-300">
              <img 
                src={heroImg} 
                alt="Bambino Igraonica Podmornica" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Lokacija izmeštena ISPOD slike */}
            <div className="relative z-10 inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 border-[#63B3ED]/30 text-[#2D3748] shadow-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#F6E05E] fill-current" />
              <p className="font-display font-bold text-xs sm:text-base">Nova Detelinara, Novi Sad</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};