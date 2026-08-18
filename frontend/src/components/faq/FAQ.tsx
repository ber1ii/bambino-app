import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Koji je kapacitet igraonice?',
    answer: 'Maksimalan kapacitet je do 30 dece i 40 odraslih osoba.',
  },
  {
    question: 'Da li je potreban depozit za rezervaciju?',
    answer: 'Da, depozit iznosi 5000 din i uplaćuje se u roku od 7-10 dana od dana rezervacije kako bi termin bio osiguran.',
  },
  {
    question: 'Koja je politika otkazivanja?',
    answer: 'Kada se depozit uplati, termin je zvanično rezervisan i nema povrata depozita u slučaju otkazivanja.',
  },
  {
    question: 'Da li možemo doneti sopstvenu hranu ili tortu?',
    answer: 'Naravno! Možete doneti sopstvenu hranu i tortu bez potrebe za prilaganjem deklaracije.',
  },
  {
    question: 'Ima li mesta za parkiranje?',
    answer: 'Nemamo lični parking, ali oko same zgrade je slobodno i besplatno parkiranje.',
  },
  {
    question: 'Da li je moguće produžiti termin proslave?',
    answer: 'Mogućnost produženja postoji: sat vremena je 4000 din, a pola sata 2000 din.',
  },
  {
    question: 'Da li imate opciju dnevne igraonice?',
    answer: 'Da! Dnevna ulaznica iznosi 300 din po satu, dok je celodnevna ulaznica 500 din.',
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-12 sm:py-16 md:py-24 px-4 relative overflow-hidden">
      
      {/* Continuously Shifting & Morphing Olive Green Circle */}
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
        className="absolute top-1/4 -right-12 sm:-right-10 md:right-10 w-36 h-36 sm:w-52 sm:h-52 md:w-72 md:h-72 bg-[#6B8E23] opacity-40 sm:opacity-60 cursor-pointer shadow-2xl z-0 pointer-events-auto"
      />

      <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12 relative z-10">
        <div className="text-center space-y-2 sm:space-y-4">
          <h2 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-[#2C3E2E]">
            Česta pitanja
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={item.question} 
                className={`rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-md transition-all duration-200 overflow-hidden border-2 ${
                  isOpen 
                    ? 'border-[#3A5A40]/40 shadow-lg' 
                    : 'border-[#3A5A40]/20 hover:border-[#3A5A40]/30 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-5 text-left cursor-pointer"
                >
                  <span className="font-black text-sm sm:text-base text-[#2C3E2E]">{item.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#3A5A40]/10 text-[#3A5A40] flex items-center justify-center"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-xs sm:text-sm font-bold text-[#2C3E2E]/80 leading-relaxed border-t border-[#3A5A40]/10 pt-2.5 sm:pt-3">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};