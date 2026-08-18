import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, CalendarHeart, CalendarDays } from 'lucide-react';

export interface PackageData {
  id: 'radni-dan' | 'vikend';
  title: string;
  price: string;
  days: string;
  duration: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

interface PackageCardProps {
  pkg: PackageData;
  onSelect: (pkgId: string) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, onSelect }) => {
  const isWeekend = pkg.id === 'vikend';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`relative bg-white/90 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border-4 shadow-xl flex flex-col justify-between ${
        isWeekend ? 'border-[#319795]' : 'border-white'
      }`}
    >
      {pkg.isPopular && (
        <span className="absolute -top-4 right-4 md:right-8 bg-[#319795] text-white text-[10px] md:text-xs font-black px-3 md:px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
          Najtraženije
        </span>
      )}

      <div>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${
              isWeekend ? 'bg-[#EBF8FF] text-[#2B6CB0]' : 'bg-[#E6FFFA] text-[#319795]'
            }`}
          >
            {isWeekend ? <CalendarHeart className="w-5 h-5 md:w-6 md:h-6" /> : <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />}
          </div>
          <div>
            <h3 className="font-display font-semibold text-xl md:text-2xl text-[#2D3748]">{pkg.title}</h3>
            <span className="text-[10px] md:text-xs font-bold text-[#2D3748]/60">{pkg.days}</span>
          </div>
        </div>

        <div className="mb-5 md:mb-6">
          <span className="font-display font-black text-3xl md:text-4xl text-[#2D3748]">{pkg.price}</span>
          <span className="text-xs md:text-sm font-bold text-[#2D3748]/60"> RSD</span>
          <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-black text-[#319795] mt-1">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
            <span>{pkg.duration} osnovni termin + mogućnost produženja</span>
          </div>
        </div>

        <p className="text-xs md:text-sm font-bold text-[#2D3748]/80 mb-5 md:mb-6 leading-relaxed">
          {pkg.description}
        </p>

        <div className="space-y-2.5 md:space-y-3 mb-8">
          {pkg.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm font-bold text-[#2D3748]/80">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#319795] shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSelect(pkg.id)}
        className={`w-full py-3.5 md:py-4 rounded-full font-black text-sm md:text-base transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
          isWeekend
            ? 'bg-[#319795] hover:bg-[#287977] text-white'
            : 'bg-[#2D3748] hover:bg-[#1A202C] text-white'
        }`}
      >
        Zakaži Termin
      </button>
    </motion.div>
  );
};