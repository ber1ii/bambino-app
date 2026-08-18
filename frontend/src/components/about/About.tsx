import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Palette, Users, type LucideIcon } from 'lucide-react';

interface AboutItem {
  icon: LucideIcon;
  color: string;
  title: string;
  text: string;
}

const ITEMS: AboutItem[] = [
  {
    icon: ShieldCheck,
    color: '#00BBF9',
    title: 'Bezbedno okruženje',
    text: 'Podovi sa mekom oblogom i stalni nadzor osoblja tokom cele proslave.',
  },
  {
    icon: Palette,
    color: '#FF477E',
    title: 'Tematska dekoracija',
    text: 'Prilagođavamo boje i ukrase omiljenoj temi vašeg deteta.',
  },
  {
    icon: Users,
    color: '#9B5DE5',
    title: 'Iskusni animatori',
    text: 'Ekipa koja zna kako da zabavi decu svih uzrasta, bez pauze za dosadu.',
  },
];

export const About: React.FC = () => {
  return (
    <section id="about" className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 relative overflow-hidden">
      {/* Zamagljena polutransparentna pozadina umesto čvrste bele kako bi drvo ostalo vidljivo iza */}
      <div className="max-w-6xl mx-auto bg-white/40 backdrop-blur-md border border-white/60 shadow-xl rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-16 relative overflow-hidden">
        {/* Soft Background Accent Inside the Box */}
        <div className="absolute -top-40 -right-40 w-72 h-72 sm:w-96 sm:h-96 bg-[#00D9B5]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 relative z-10">
          {/* Left Side: Sticky Header */}
          <div className="lg:sticky lg:top-32 h-fit text-center lg:text-left">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-[#2D1B4E] tracking-tight candy-title mb-4 sm:mb-6"
            >
              Mesto gde mašta postaje stvarnost.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#2D1B4E]/80 font-bold text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Bambino nije samo igraonica. To je pažljivo osmišljen prostor dizajniran da pruži maksimalnu zabavu deci i potpuni mir roditeljima.
            </motion.p>
          </div>

          {/* Right Side: Feature Rows */}
          <div className="space-y-6 sm:space-y-10 lg:space-y-12">
            {ITEMS.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="flex gap-4 sm:gap-6 items-start group"
              >
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl shrink-0 flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 group-hover:-rotate-3"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl sm:text-2xl text-[#2D1B4E] mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-[#2D1B4E]/80 font-bold text-sm sm:text-base leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};