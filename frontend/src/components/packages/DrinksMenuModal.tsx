import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import karta1 from "../../photos/karta_pica1.jpg";
import karta2 from "../../photos/karta_pica2.jpg";

interface DrinksMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrinksMenuModal: React.FC<DrinksMenuModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [karta1, karta2];

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 pt-14 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2C3E2E]/85 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-3.5 sm:py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-display font-semibold text-lg sm:text-xl text-[#2D3748]">
                Karta Pića ({currentIndex + 1}/2)
              </h3>
              <button
                onClick={onClose}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-full transition-all text-gray-700 shrink-0 flex items-center justify-center min-w-[40px] min-h-[40px]"
                aria-label="Zatvori"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Image Container with Swipe Gesture */}
            <div className="relative flex-1 overflow-hidden bg-gray-50 flex items-center justify-center p-2 sm:p-4 touch-pan-y">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  alt={`Karta pića strana ${currentIndex + 1}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -50) nextImage();
                    if (info.offset.x > 50) prevImage();
                  }}
                  className="max-w-full h-auto max-h-[58vh] sm:max-h-[66vh] object-contain rounded-lg shadow-sm cursor-grab active:cursor-grabbing select-none"
                />
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-4 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="pointer-events-auto p-2.5 sm:p-3 bg-white/90 hover:bg-white active:scale-95 text-[#3A5A40] rounded-full shadow-lg transition-all"
                  aria-label="Prethodna strana"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="pointer-events-auto p-2.5 sm:p-3 bg-white/90 hover:bg-white active:scale-95 text-[#3A5A40] rounded-full shadow-lg transition-all"
                  aria-label="Sledeća strana"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="p-3.5 flex justify-center gap-2 bg-white shrink-0 border-t border-gray-50">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${idx === currentIndex ? "w-8 bg-[#3A5A40]" : "w-2.5 bg-gray-300"}`}
                  aria-label={`Strana ${idx + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
