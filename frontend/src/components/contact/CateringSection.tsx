import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, ExternalLink, Instagram } from 'lucide-react';

export const CateringSection: React.FC = () => {
  const cateringPostUrl = "https://www.instagram.com/p/DM2FAn4Mz83/?igsh=MW0wN2czZGRmd3h3aw==";
  const cateringProfileUrl = "https://www.instagram.com/tasty_moments_novisad?igsi=MTducTR0cHMwMGptaw%3D%3D&utm_source=qr";

  return (
    <section id="ketering" className="py-12 sm:py-16 px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 shadow-xl border-4 border-white relative overflow-hidden">
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E1306C]/10 rounded-full text-[#E1306C] font-black text-xs uppercase tracking-widest border border-[#E1306C]/20">
                <Utensils className="w-4 h-4" />
                <span>Ukusna Posluženja</span>
              </div>
              
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#2C3E2E]">
                Ketering Za Vaše Proslave
              </h2>
              
              <p className="text-[#2C3E2E]/80 font-medium leading-relaxed text-sm sm:text-base">
                Sarafinsku hranu i posluženja za vaše mališane i goste obezbeđujemo u saradnji sa <strong className="text-[#2C3E2E]">Tasty Moments Novi Sad</strong>.
              </p>

              <div className="pt-2">
                <a
                  href={cateringProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white font-black text-sm rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  <span>@tasty_moments_novisad</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>

            <motion.a
              href={cateringPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-square bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80"
                alt="Tasty Moments Ketering"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Instagram className="w-4 h-4" />
                  <span>Pogledajte ponudu na Instagramu</span>
                </div>
                <p className="text-sm font-black line-clamp-1">Tasty Moments Ketering Novi Sad</p>
              </div>
            </motion.a>
          </div>

        </div>
      </div>
    </section>
  );
};