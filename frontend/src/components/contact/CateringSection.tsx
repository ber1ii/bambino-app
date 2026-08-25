import React from "react";
import { motion } from "framer-motion";
import { Utensils, ExternalLink, Instagram } from "lucide-react";
import keteringPhoto from "../../photos/ketering2.jpeg";

export const CateringSection: React.FC = () => {
  const cateringPostUrl =
    "https://www.instagram.com/p/DM2FAn4Mz83/?igsh=MW0wN2czZGRmd3h3aw==";
  const cateringProfileUrl =
    "https://www.instagram.com/tasty_moments_novisad?igsi=MTducTR0cHMwMGptaw%3D%3D&utm_source=qr";

  return (
    <section id="ketering" className="py-8 sm:py-16 px-3 sm:px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 md:p-10 shadow-xl border-2 sm:border-4 border-white relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Details Column */}
            <div className="space-y-3 sm:space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 bg-[#E1306C]/10 rounded-full text-[#E1306C] font-black text-[11px] sm:text-xs uppercase tracking-wider border border-[#E1306C]/20">
                <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Ukusna Posluženja</span>
              </div>

              <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#2C3E2E] leading-tight">
                Ketering Za Vaše Proslave
              </h2>

              <p className="text-[#2C3E2E]/80 font-medium leading-relaxed text-xs sm:text-base">
                Vrhunsku hranu i posluženje za vaše mališane i goste
                obezbeđujemo u saradnji sa{" "}
                <strong className="text-[#2C3E2E]">
                  Tasty Moments Novi Sad
                </strong>
                .
              </p>

              {/* Full-width CTA button on mobile for better touch targets */}
              <div className="pt-2 flex justify-center md:justify-start">
                <a
                  href={cateringProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white font-black text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  <Instagram className="w-4 h-4 shrink-0" />
                  <span className="truncate">@tasty_moments_novisad</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 shrink-0" />
                </a>
              </div>
            </div>

            {/* Media Card */}
            <motion.a
              href={cateringPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group rounded-xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[16/10] sm:aspect-square bg-slate-100 flex items-center justify-center cursor-pointer w-full"
            >
              <img
                src={keteringPhoto}
                alt="Tasty Moments Ketering"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 transition-opacity" />

              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-amber-300">
                  <Instagram className="w-3.5 h-3.5 shrink-0" />
                  <span>Pogledajte ponudu na Instagramu</span>
                </div>
                <p className="text-xs sm:text-sm font-black line-clamp-1">
                  Tasty Moments Ketering Novi Sad
                </p>
              </div>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
};
