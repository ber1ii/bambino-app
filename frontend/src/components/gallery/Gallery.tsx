import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

import zamena1 from "../../photos/zamena_za_1.jpg";
import zamena2 from "../../photos/zamena_za_2.jpg";
import kucica from "../../photos/kucica.jpg";

const OTHER_NUMBERS = [
  15, 16, 17, 18, 19, 20, 21, 22, 25, 26, 28, 29,
];

const ALL_IMAGES = [
  zamena1,
  zamena2,
  ...OTHER_NUMBERS.map((num) => new URL(`../../photos/${num}.jpeg`, import.meta.url).href),
  kucica,
];

const HIGHLIGHTS = [
  {
    src: new URL("../../photos/20.jpeg", import.meta.url).href,
    alt: "Bazen sa lopticama i žuta podmornica",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    src: kucica,
    alt: "Zelena kućica za igru",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    src: new URL("../../photos/28.jpeg", import.meta.url).href,
    alt: "Kafić za roditelje",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    src: zamena1,
    alt: "Igraonica detalj",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    src: new URL("../../photos/26.jpeg", import.meta.url).href,
    alt: "Prostor za rođendane",
    span: "md:col-span-2 md:row-span-1",
  },
];

export const Gallery: React.FC = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  const openLightbox = (highlightSrc: string) => {
    const filename = highlightSrc.split("/").pop()?.split("?")[0];
    const index = ALL_IMAGES.findIndex((src) => src.includes(filename || ""));
    setSelectedImageIndex(index !== -1 ? index : 0);
  };

  const handleNext = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prev) => (prev! + 1) % ALL_IMAGES.length);
    }
  }, [selectedImageIndex]);

  const handlePrev = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        (prev) => (prev! - 1 + ALL_IMAGES.length) % ALL_IMAGES.length,
      );
    }
  }, [selectedImageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setSelectedImageIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, handleNext, handlePrev]);

  return (
    <section id="gallery" className="py-12 sm:py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-2 sm:space-y-4 mb-8 sm:mb-12">
          <h2 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-[#2D3748] title-shadow">
            Zavirite u naš prostor
          </h2>
          <p className="text-[#2D3748]/70 font-bold text-base sm:text-xl">
            Sve je podređeno savršenoj zabavi!
          </p>
        </div>

        {/* Grid Istaknutih Slika */}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[200px] sm:auto-rows-[220px] md:auto-rows-[250px] gap-4 sm:gap-6">
          {HIGHLIGHTS.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl sm:rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl border-4 border-white ${img.span}`}
              onClick={() => openLightbox(img.src)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#319795]/0 group-hover:bg-[#319795]/40 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 w-8 h-8 sm:w-12 sm:h-12 scale-50 group-hover:scale-100 drop-shadow-lg" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dugme za otvaranje cele galerije */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <button
            onClick={() => setSelectedImageIndex(0)}
            className="cloud-btn px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg"
          >
            Otvori celu galeriju
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#2D3748]/95 backdrop-blur-md select-none"
            onClick={() => setSelectedImageIndex(null)}
          >
            {/* Brojač slika */}
            <div className="fixed top-4 left-4 sm:top-6 sm:left-6 text-white font-display font-bold text-xs sm:text-base bg-black/50 backdrop-blur-sm px-3.5 py-2 rounded-full border border-white/20 z-[10000] pointer-events-none">
              {selectedImageIndex + 1} / {ALL_IMAGES.length}
            </div>

            {/* Strelica Levo */}
            <button
              type="button"
              aria-label="Prethodna slika"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="fixed left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 p-2.5 sm:p-4 rounded-full transition-all z-[10000] border border-white/10"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Prikazana slika */}
            <motion.img
              key={selectedImageIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              src={ALL_IMAGES[selectedImageIndex]}
              alt={`Galerija slika ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[75vh] sm:max-h-[85vh] rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-white object-contain my-auto"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Strelica Desno */}
            <button
              type="button"
              aria-label="Sledeća slika"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 p-2.5 sm:p-4 rounded-full transition-all z-[10000] border border-white/10"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};