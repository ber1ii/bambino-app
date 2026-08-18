import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Jelena R.',
    text: 'Najlepša igraonica u gradu! Deca su bila oduševljena podmornicom i kućicom, a mi roditelji kafićem. Sve pohvale za animatore!',
    color: 'bg-[#EBF8FF]',
    borderColor: 'border-[#63B3ED]',
    rotation: 'md:-rotate-2'
  },
  {
    name: 'Marko S.',
    text: 'Proslavili smo 5. rođendan, organizacija je bila besprekorna. Prostor je neverovatno čist i prilagođen deci. Vidimo se opet!',
    color: 'bg-[#F0FFF4]',
    borderColor: 'border-[#4CAF50]',
    rotation: 'md:rotate-2'
  },
  {
    name: 'Ana M.',
    text: 'Prelepo dizajniran prostor, nismo ni morali da ukrašavamo puno jer je igraonica sama po sebi prelepa. Deca su uživala 100%!',
    color: 'bg-[#FFFFF0]',
    borderColor: 'border-[#F6E05E]',
    rotation: 'md:-rotate-1'
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 md:mb-16">
          <h2 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-[#2D3748] title-shadow">
            Šta kažu roditelji?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`${review.color} ${review.rotation} p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border-4 ${review.borderColor} shadow-xl hover:rotate-0 transition-transform duration-300`}
            >
              <div className="flex gap-1 mb-4 sm:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-[#F6E05E] fill-current drop-shadow-sm" />
                ))}
              </div>
              <p className="font-bold text-[#2D3748]/80 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
                "{review.text}"
              </p>
              <div className="font-display font-bold text-xl sm:text-2xl text-[#2D3748]">
                {review.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};