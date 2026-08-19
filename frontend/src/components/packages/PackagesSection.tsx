import React, { useState } from "react";
import { motion } from "framer-motion";
import type { PartyPackage } from "../../types";
import { PackageCard } from "./PackageCard";
import { DrinksMenuModal } from "./DrinksMenuModal";

interface PackagesSectionProps {
  packages: PartyPackage[];
  onSelectPackage: (pkg?: PartyPackage) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  onSelectPackage,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <section
      id="paketi"
      className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden"
    >
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
            Izaberite tarifu u zavisnosti od dana proslave. Svaki termin možete
            prilagoditi dodatnim vremenom i posebnom dekoracijom.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {packages.map((pkg: PartyPackage) => {
            const isWeekend =
              pkg.name.toLowerCase().includes("vikend") || pkg.id === "vikend";

            return (
              <PackageCard
                key={pkg.id}
                pkg={{
                  id: isWeekend ? "vikend" : "radni-dan",
                  title: pkg.name,
                  price: pkg.price.toLocaleString("sr-RS"),
                  days: isWeekend ? "Subota – Nedelja" : "Ponedeljak – Petak",
                  duration: `${Math.round(pkg.durationMinutes / 60)} sata`,
                  description: pkg.description,
                  features: [
                    "Ekskluzivan zakup celog prostora (2h)",
                    "Mini Maus maskota uključena u cenu",
                    "Postavka sa balonima uključena u cenu (personalizovana uz doplatu)",
                    "Iskusni animatori i nadzor dece",
                    "Kompletan pribor za posluženje",
                    "Slobodno donošenje sopstvene hrane i torte",
                  ],
                  isPopular: isWeekend,
                }}
                onSelect={() => onSelectPackage(pkg)}
              />
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-[#3A5A40]/5 border border-[#3A5A40]/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="font-display font-semibold text-xl text-[#2D3748] mb-2">
              Kutak za roditelje
            </h3>
            <p className="text-sm md:text-base font-bold text-[#2D3748]/70">
              Dok se mališani zabavljaju, opustite se u našem kafeu uz bogat
              izbor pića.
            </p>
          </div>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="shrink-0 px-6 py-3 bg-[#E9C46A] hover:bg-[#D4B055] text-[#2C3E2E] font-black rounded-full shadow-md transition-all hover:scale-105 flex items-center gap-2"
          >
            Pogledajte kartu pića
          </button>
        </motion.div>
      </div>

      <DrinksMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </section>
  );
};

export default PackagesSection;