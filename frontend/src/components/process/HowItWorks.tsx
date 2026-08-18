import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, PhoneCall, Sparkles, PartyPopper } from 'lucide-react';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Izaberite paket & termin',
    description: 'Pregledajte naše pakete i pronađite slobodan termin koji vam najviše odgovara.',
    icon: CalendarCheck,
    color: '#00BBF9',
  },
  {
    number: '02',
    title: 'Brza rezervacija',
    description: 'Popunite online formu ili nas pozovite. Potvrda stiže u roku od nekoliko minuta.',
    icon: PhoneCall,
    color: '#FF477E',
  },
  {
    number: '03',
    title: 'Personalizacija teme',
    description: 'Dogovaramo omiljenu temu slavljenika, dekoraciju, balone i posebne želje.',
    icon: Sparkles,
    color: '#9B5DE5',
  },
  {
    number: '04',
    title: 'Uživajte u žurci!',
    description: 'Sve je spremno za vas. Opustite se u roditeljskom kutku dok se deca zabavljaju.',
    icon: PartyPopper,
    color: '#00D9B5',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-24 px-4 relative overflow-hidden sprinkle-bg">
      
      {/* Continuously Morphing Olive Green Circle Layered Behind Process Steps */}
      <motion.div
        animate={{
          y: [0, -60, 40, 0],
          x: [0, -70, 30, 0],
          scale: [1, 1.1, 0.9, 1],
          borderRadius: [
            "50% 50% 50% 50% / 50% 50% 50% 50%",
            "35% 65% 60% 40% / 50% 35% 65% 50%",
            "60% 40% 35% 65% / 40% 60% 40% 60%",
            "45% 55% 70% 30% / 60% 40% 50% 50%",
            "50% 50% 50% 50% / 50% 50% 50% 50%",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.15,
          transition: { duration: 0.4 }
        }}
        className="absolute top-1/3 -right-10 sm:right-1/6 w-40 h-40 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-[#6B8E23] opacity-45 cursor-pointer shadow-2xl z-0 pointer-events-auto"
      />

      <div className="max-w-4xl mx-auto space-y-10 sm:space-y-16 md:space-y-20 relative z-10">
        
        <div className="text-center space-y-2 sm:space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-[#2D1B4E] tracking-tight candy-title"
          >
            Kako funkcioniše?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#2D1B4E]/80 font-bold max-w-xl mx-auto text-base sm:text-lg"
          >
            Do savršene proslave deli vas samo 4 laka koraka.
          </motion.p>
        </div>

        <div className="relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-7 sm:left-1/2 top-0 bottom-0 w-1 sm:-ml-px border-l-4 border-dashed border-[#2D1B4E]/10 z-0" />

          <div className="space-y-8 sm:space-y-16 md:space-y-24 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Text Content */}
                  <div className={`sm:w-1/2 ${isEven ? 'sm:text-left' : 'sm:text-right'} pl-18 sm:pl-0 z-10`}>
                    <h3 className="font-display font-semibold text-xl sm:text-2xl text-[#2D1B4E] mb-1 sm:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#2D1B4E]/70 font-bold text-sm sm:text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-0 sm:relative sm:left-auto flex flex-col items-center justify-center z-10">
                    <div
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white shadow-xl ring-4 sm:ring-8 ring-[var(--bg-cream)] z-10"
                      style={{ backgroundColor: step.color }}
                    >
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden sm:block sm:w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};