import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Camera, Heart } from 'lucide-react';
import mascot from '../../photos/mascot.jpg';

export const MascotSection: React.FC = () => {
  return (
    <section className="py-12 md:py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-transparent via-slate-100/60 to-transparent">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#319795]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          {/* Image Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 flex justify-center md:justify-end"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-white/60 backdrop-blur-sm rounded-[2.5rem] rotate-3 transform origin-bottom-left -z-10 border border-white/80 shadow-sm"></div>
              <div className="absolute -inset-4 bg-gradient-to-br from-white/80 to-[#319795]/10 rounded-[2.5rem] -rotate-2 transform origin-top-right -z-10 shadow-lg"></div>
              
              <img 
                src={mascot} 
                alt="Minnie Mouse Maskota" 
                className="relative z-10 w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] rounded-3xl shadow-2xl object-cover object-center border-4 border-white/90"
              />
              
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-5 left-2 sm:-left-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-2.5 sm:gap-3 z-20 border border-[#319795]/20"
              >
                <div className="bg-[#319795]/10 p-2 sm:p-2.5 rounded-xl text-[#319795]">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="font-bold text-[#2D3748] text-xs sm:text-sm">Slike za pamćenje</p>
                  <p className="text-[10px] sm:text-xs text-[#2D3748]/60 font-semibold">Uključeno u cenu</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 space-y-5 sm:space-y-6 text-center md:text-left mt-4 md:mt-0"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50/90 backdrop-blur-sm rounded-full text-[#2D3748] font-black text-xs md:text-sm uppercase tracking-widest shadow-sm border border-pink-100">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Specijalan Gost</span>
            </div>

            <h2 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-[#2D3748] leading-tight">
              <span className="text-[#319795]">Iznenađenje koje</span> <br className="hidden md:block" />
              <span className="text-pink-500">mališani obožavaju</span>
            </h2>

            <p className="text-base md:text-lg font-bold text-[#2D3748]/75 max-w-xl mx-auto md:mx-0">
              Učinite rođendan još magičnijim! Naša Mini Maus maskota je uključena u cenu proslave da iznenadi slavljenika, donese tortu i napravi nezaboravne fotografije sa svim drugarima.
            </p>

            <ul className="space-y-3 pt-2 text-left inline-block md:block">
              {[
                'Maskota Minnie Mouse je uključena u cenu proslave',
                'Ples, animacija i slikanje sa decom',
                'Zajedničko duvanje svećica i uručenje torte'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm md:text-base font-bold text-[#2D3748]/85">
                  <div className="p-1 rounded-full bg-[#319795]/10 text-[#319795]">
                    <Heart className="w-4 h-4 fill-[#319795]/20" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
};