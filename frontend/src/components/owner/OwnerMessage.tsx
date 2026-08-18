import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Quote } from 'lucide-react';

const ownerPhoto = new URL('../../photos/29.jpeg', import.meta.url).href;

export const OwnerMessage: React.FC = () => {
  return (
    <section 
      id="owner-message" 
      className="py-12 sm:py-16 md:py-24 px-4 relative overflow-hidden"
    >
      {/* Suptilni dekorativni prirodni krugovi */}
      <div className="absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-[#E9C46A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-[#588157]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Slika */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <div className="absolute w-full h-full bg-gradient-to-tr from-[#3A5A40]/20 via-[#588157]/30 to-[#E9C46A]/30 rounded-[2rem] sm:rounded-[3rem] transform -rotate-2 scale-105 -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] w-full max-w-xs sm:max-w-md lg:max-w-lg mx-auto"
          >
            <img
              src={ownerPhoto}
              alt="Bambino kutak za igru"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Tekstualni sadržaj */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#3A5A40]/10 text-[#3A5A40] font-black text-xs uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-[#E9C46A] fill-current" />
            <span>Reč osnivača</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 sm:space-y-6 text-[#2C3E2E]/90 font-bold text-base sm:text-lg md:text-xl leading-relaxed relative"
          >
            <Quote className="w-8 h-8 sm:w-12 sm:h-12 text-[#588157]/20 absolute -top-4 -left-2 sm:-top-6 sm:-left-6 -z-10" />
            <p>
              Već četiri godine pravimo čistu magiju. Pretvaramo dečije snove u najlepše rođendanske uspomene. Kroz kreativne igre, puno mašte sklapamo najlepša drugarstva i vraćamo osmehe na lica naših najmlađih mališana.
            </p>
            <p className="text-[#3A5A40]">
              Hvala vam što najlepše trenutke i sreću vaših mališana delite sa nama. 💛🎈
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-4 sm:pt-6 flex items-center justify-center lg:justify-start gap-3 sm:gap-4 border-t border-[#3A5A40]/15"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#3A5A40] text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shrink-0">
              N
            </div>
            <div className="text-left">
              <h4 className="font-display font-bold text-lg sm:text-xl text-[#2C3E2E]">Nada Šakan</h4>
              <p className="text-xs sm:text-sm font-bold text-[#588157]">Osnivač & vlasnica Bambino igraonice</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};