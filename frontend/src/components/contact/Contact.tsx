import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <section id="kontakt" className="py-12 sm:py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-[#319795]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-60 h-60 sm:w-96 sm:h-96 bg-[#4CAF50]/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-white rounded-full text-[#319795] font-black text-xs sm:text-sm uppercase tracking-widest shadow-sm border border-[#319795]/20"
          >
            Tu smo za vas
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl text-[#2C3E2E]"
          >
            Kontaktirajte Nas
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* Kontakt Informacije Kartica */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/90 backdrop-blur-md rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-12 shadow-xl border-4 border-white relative overflow-hidden flex flex-col justify-center"
          >
            {/* Dekorativni akcent u uglu */}
            <div className="absolute -top-12 -right-12 w-24 h-24 sm:w-32 sm:h-32 bg-[#F6E05E]/30 rounded-full blur-2xl" />

            <div className="space-y-6 sm:space-y-8 relative z-10">
              
              {/* Lokacija */}
              <div className="flex items-start gap-3.5 sm:gap-5">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#319795]/10 text-[#319795] flex items-center justify-center shrink-0 border border-[#319795]/20">
                  <MapPin className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h4 className="font-black text-base sm:text-lg text-[#2C3E2E] mb-0.5 sm:mb-1">Naša Lokacija</h4>
                  <p className="text-[#2C3E2E]/70 font-bold text-sm sm:text-base leading-relaxed">
                    Vaselina Masleše 32a<br />
                    Nova Detelinara, Novi Sad
                  </p>
                </div>
              </div>

              {/* Telefon */}
              <div className="flex items-start gap-3.5 sm:gap-5">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#4CAF50]/10 text-[#4CAF50] flex items-center justify-center shrink-0 border border-[#4CAF50]/20">
                  <Phone className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h4 className="font-black text-base sm:text-lg text-[#2C3E2E] mb-0.5 sm:mb-1">Telefon</h4>
                  <a href="tel:+381642745930" className="text-[#2C3E2E]/70 font-bold text-sm sm:text-base hover:text-[#4CAF50] transition-colors">
                    +381 64 2745930
                  </a>
                </div>
              </div>

              {/* Radno vreme */}
              <div className="flex items-start gap-3.5 sm:gap-5">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F6E05E]/20 text-[#D69E2E] flex items-center justify-center shrink-0 border border-[#F6E05E]/40">
                  <Clock className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h4 className="font-black text-base sm:text-lg text-[#2C3E2E] mb-0.5 sm:mb-1">Radno Vreme</h4>
                  <p className="text-[#2C3E2E]/70 font-bold text-sm sm:text-base leading-relaxed">
                    Ponedeljak - Nedelja<br />
                    Zakazivanje po dogovoru
                  </p>
                </div>
              </div>

            </div>

            {/* Dugme za brzi poziv */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-gray-100 relative z-10">
              <a 
                href="tel:+381642745930"
                className="w-full py-3.5 sm:py-4 bg-[#319795] hover:bg-[#287977] text-white rounded-full font-black text-base sm:text-lg tracking-wide transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 sm:gap-3"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                Pozovite nas odmah
              </a>
            </div>
          </motion.div>

          {/* Google Mapa Kartica */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/90 rounded-3xl sm:rounded-[3rem] p-2 sm:p-3 shadow-xl border-4 border-white h-[300px] sm:h-[400px] lg:h-auto min-h-[300px] sm:min-h-[400px] overflow-hidden relative"
          >
            <div className="w-full h-full rounded-2xl sm:rounded-[2.2rem] overflow-hidden bg-gray-100 relative">
              <iframe 
                src="https://maps.google.com/maps?q=Vaselina%20Maslese%2032a,%20Novi%20Sad&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bambino Igraonica Lokacija"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};