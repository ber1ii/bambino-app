import React from 'react';
import { motion } from 'framer-motion';
import type { PartyPackage } from '../../types';
import { PackageCard } from './PackageCard';

interface PackagesSectionProps {
  packages: PartyPackage[];
  onSelectPackage: (pkg?: PartyPackage) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  onSelectPackage,
}) => {
  return (
    <section id="paketi" className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center space-y-3 md:space-y-4 mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 md:px-6 md:py-2 bg-white rounded-full text-[#319795] font-black text-xs md:text-sm uppercase tracking-widest shadow-sm border border-[#319795]/20"
          >
            Prilagođeno Vama
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-[#2D3748]"
          >
            Rođendanski Paketi
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg font-bold text-[#2D3748]/70 max-w-xl mx-auto px-2"
          >
            Izaberite tarifu u zavisnosti od dana proslave. Svaki termin možete prilagoditi dodatnim vremenom i posebnom dekoracijom.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {packages.map((pkg: PartyPackage) => (
            <PackageCard
              key={pkg.id}
              pkg={{
                id: pkg.id as 'radni-dan' | 'vikend',
                title: pkg.name,
                price: pkg.price.toLocaleString('sr-RS'),
                days: pkg.id === 'vikend' ? 'Subota – Nedelja' : 'Ponedeljak – Petak',
                duration: `${pkg.durationMinutes / 60} sata`,
                description: pkg.description,
                features: [
                  'Ekskluzivan zakup celog prostora (2h)',
                  'Iskusni animatori i nadzor dece',
                  'Kompletan pribor za posluženje',
                  'Mogućnost dodavanja dodatnog vremena (+30 min / +1h)',
                  'Slobodno donošenje sopstvene hrane i torte',
                ],
                isPopular: pkg.id === 'vikend',
              }}
              onSelect={() => onSelectPackage(pkg)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;