import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';

interface StickyBookBarProps {
  onOpenBooking: () => void;
}

export const StickyBookBar: React.FC<StickyBookBarProps> = ({ onOpenBooking }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const isPastHero = scrollY > windowHeight * 0.8;
      const isNearBottom = documentHeight - (scrollY + windowHeight) < 350;

      setVisible(isPastHero && !isNearBottom);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full sm:w-auto flex justify-center pointer-events-none"
        >
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 cloud-btn flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer pointer-events-auto shadow-2xl"
          >
            <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-[#F6E05E] drop-shadow-md shrink-0" />
            <span className="text-base sm:text-lg">Zakaži Rođendan</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};