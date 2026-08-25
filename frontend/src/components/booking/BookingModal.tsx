import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Smile,
  Cake,
  MessageSquare,
  Check,
  AlertCircle,
  Loader2,
  PlusCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { api, type Package, type TimeSlot } from "../../services/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const springConfig = { type: "spring", stiffness: 300, damping: 30 };
const CLEANING_BUFFER_MINS = 15; // Buffer to prevent back-to-back bookings with zero prep time

const toLocalISOString = (dateStr: string, timeStr: string) => {
  const date = new Date(`${dateStr}T${timeStr}:00`);
  const offsetMinutes = date.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMins = Math.abs(offsetMinutes % 60);
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${dateStr}T${timeStr}:00${sign}${pad(offsetHours)}:${pad(offsetMins)}`;
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [dbPackages, setDbPackages] = useState<Package[]>([]);
  const [reservedSlots, setReservedSlots] = useState<TimeSlot[]>([]);

  // Form Field States
  const [extraTimeMinutes, setExtraTimeMinutes] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [parentName, setParentName] = useState<string>("");
  const [childName, setChildName] = useState<string>("");
  const [childAge, setChildAge] = useState<number | "">(5);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // UI Feedback States
  const [slotConflict, setSlotConflict] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Automatic Day Type Detection
  const getDayType = (dateStr: string): "radni-dan" | "vikend" | null => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6 ? "vikend" : "radni-dan";
  };

  const currentDayType = getDayType(selectedDate);

  // Compute dynamic slot times adjusted for preceding cleaning buffers
  const getDynamicSlots = () => {
    const baseSlots =
      currentDayType === "vikend"
        ? ["10:30 - 12:30", "13:00 - 15:00", "15:30 - 17:30", "18:00 - 20:00"]
        : ["15:30 - 17:30", "18:00 - 20:00"];

    if (!selectedDate || reservedSlots.length === 0) {
      return baseSlots.map((s) => ({ slotString: s, isShifted: false }));
    }

    return baseSlots.map((slot) => {
      const [baseStartStr, baseEndStr] = slot.split(" - ");
      const baseStart = new Date(`${selectedDate}T${baseStartStr}:00`);
      const baseEnd = new Date(`${selectedDate}T${baseEndStr}:00`);

      let adjustedStart = new Date(baseStart);

      // Check if any reservation's end time + buffer spills into this slot's base start
      reservedSlots.forEach((s) => {
        const resEndWithBuffer = new Date(
          new Date(s.end_time).getTime() + CLEANING_BUFFER_MINS * 60 * 1000,
        );
        if (resEndWithBuffer > adjustedStart && resEndWithBuffer < baseEnd) {
          adjustedStart = resEndWithBuffer;
        }
      });

      if (adjustedStart.getTime() === baseStart.getTime()) {
        return { slotString: slot, isShifted: false };
      }

      // Maintain base slot duration (2h) from adjusted start
      const baseDurationMs = baseEnd.getTime() - baseStart.getTime();
      const adjustedEnd = new Date(adjustedStart.getTime() + baseDurationMs);

      const formatTime = (d: Date) => {
        const h = String(d.getHours()).padStart(2, "0");
        const m = String(d.getMinutes()).padStart(2, "0");
        return `${h}:${m}`;
      };

      const slotString = `${formatTime(adjustedStart)} - ${formatTime(adjustedEnd)}`;
      return { slotString, isShifted: true };
    });
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      api
        .getPackages()
        .then((pkgs) => setDbPackages(pkgs))
        .catch((err) => console.error("Failed to load packages:", err));
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const calculateTotalDuration = () => 120 + extraTimeMinutes;

  const calculateTotalPrice = () => {
    const basePrice = currentDayType === "vikend" ? 16000 : 13000;
    const extraPrice =
      extraTimeMinutes === 30 ? 2000 : extraTimeMinutes === 60 ? 4000 : 0;
    return basePrice + extraPrice;
  };

  const checkSlotConflict = (
    date: string,
    slot: string,
    extraMins: number,
    slots: TimeSlot[],
  ) => {
    if (!date || !slot) {
      setSlotConflict(false);
      return;
    }
    const [startStr] = slot.split(" - ");
    const proposedStart = new Date(`${date}T${startStr}:00`);
    const totalDuration = 120 + extraMins;
    const proposedEndWithBuffer = new Date(
      proposedStart.getTime() +
        (totalDuration + CLEANING_BUFFER_MINS) * 60 * 1000,
    );

    const hasConflict = slots.some((s) => {
      const slotStart = new Date(s.start_time);
      const slotEndWithBuffer = new Date(
        new Date(s.end_time).getTime() + CLEANING_BUFFER_MINS * 60 * 1000,
      );
      return (
        proposedStart < slotEndWithBuffer && proposedEndWithBuffer > slotStart
      );
    });

    setSlotConflict(hasConflict);
  };

  const isTimeSlotOccupied = (slot: string) => {
    if (!selectedDate || reservedSlots.length === 0) return false;
    const [startStr, endStr] = slot.split(" - ");
    const checkStart = new Date(`${selectedDate}T${startStr}:00`);
    const checkEnd = new Date(`${selectedDate}T${endStr}:00`);

    return reservedSlots.some((s) => {
      const slotStart = new Date(s.start_time);
      const slotEndWithBuffer = new Date(
        new Date(s.end_time).getTime() + CLEANING_BUFFER_MINS * 60 * 1000,
      );
      return checkStart < slotEndWithBuffer && checkEnd > slotStart;
    });
  };

  const fetchAvailability = async (date: string) => {
    if (!date) {
      setReservedSlots([]);
      setSlotConflict(false);
      return;
    }
    try {
      const slots = await api.getAvailability(date);
      setReservedSlots(slots);
      checkSlotConflict(date, selectedSlot, extraTimeMinutes, slots);
    } catch (err) {
      console.error("Failed to check availability:", err);
    }
  };

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate, selectedSlot, extraTimeMinutes]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    setSelectedSlot("");
    setSlotConflict(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!selectedDate || !selectedSlot) {
      setSubmitError("Molimo izaberite datum i termin.");
      return;
    }

    if (slotConflict) {
      setSubmitError(
        "Izabrani termin je već zauzet. Molimo izaberite drugo vreme.",
      );
      return;
    }

    const searchStr = currentDayType === "vikend" ? "vikend" : "radni";
    const pkg = dbPackages.find((p: any) =>
      (p.title || p.name || "").toLowerCase().includes(searchStr),
    );
    const finalPackageId = pkg ? pkg.id : (currentDayType ?? "radni-dan");

    const [startStr] = selectedSlot.split(" - ");
    const startISO = toLocalISOString(selectedDate, startStr);

    const startDateTime = new Date(`${selectedDate}T${startStr}:00`);
    const endDateTime = new Date(
      startDateTime.getTime() + calculateTotalDuration() * 60 * 1000,
    );
    const endHours = String(endDateTime.getHours()).padStart(2, "0");
    const endMins = String(endDateTime.getMinutes()).padStart(2, "0");
    const endISO = toLocalISOString(selectedDate, `${endHours}:${endMins}`);

    const formattedNotes =
      extraTimeMinutes > 0
        ? `[Dodatno vreme: +${extraTimeMinutes} min] ${notes}`.trim()
        : notes;

    setIsSubmitting(true);

    try {
      await api.createReservation({
        package_id: finalPackageId,
        parent_name: parentName,
        child_name: childName,
        child_age: Number(childAge) || 1,
        phone_number: phoneNumber,
        email: email,
        notes: formattedNotes,
        start_time: startISO,
        end_time: endISO,
      });

      await fetchAvailability(selectedDate);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setSubmitError(err.message || "Greška pri slanju rezervacije.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dynamicSlots = getDynamicSlots();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2D3748]/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={springConfig}
            className="relative w-full max-w-3xl max-h-[92vh] bg-[#F5F2EB] border-2 sm:border-4 border-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10"
          >
            {/* Header */}
            <div className="px-4 sm:px-8 py-3.5 sm:py-5 bg-[#E8EED8]/80 border-b border-[#DCE6C8] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] sm:text-[11px] font-black text-[#319795] uppercase tracking-widest bg-white/80 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#319795]/20">
                  Online Rezervacija
                </span>
                <h3 className="font-display font-semibold text-xl sm:text-2xl text-[#2D3748] mt-1">
                  Rezervišite Proslavu
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 sm:p-2.5 bg-white rounded-full text-[#2D3748]/60 hover:text-[#2D3748] hover:bg-[#319795]/20 transition-all shadow-md"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
              {submitSuccess ? (
                <div className="py-8 sm:py-12 text-center space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-display font-bold text-[#2D3748]">
                    Zahtev Uspešno Poslat!
                  </h4>
                  <p className="text-[#2D3748]/70 font-bold text-sm sm:text-base max-w-md mx-auto">
                    Hvala Vam! Vaša rezervacija je zabeležena. Kontaktiraćemo
                    Vas uskoro radi potvrde.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  {submitError && (
                    <div className="p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-xs sm:text-sm">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Pricing Info Banner */}
                  <div className="bg-white/80 border border-[#DCE6C8] rounded-2xl p-3 sm:p-4 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-[#2D3748]">
                      <Sparkles className="w-4 h-4 text-[#319795]" />
                      <span className="font-bold">
                        Cene paketa (2h proslave):
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="bg-[#E6FFFA] text-[#319795] font-black px-2.5 py-1 rounded-lg border border-[#319795]/20">
                        Radni dan: 13.000 RSD
                      </span>
                      <span className="bg-[#EBF8FF] text-[#2B6CB0] font-black px-2.5 py-1 rounded-lg border border-[#2B6CB0]/20">
                        Vikend: 16.000 RSD
                      </span>
                    </div>
                  </div>

                  {/* 1. Datum i Izbor Sata */}
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                        Izaberite Datum
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#319795]" />
                        <input
                          type="date"
                          required
                          value={selectedDate}
                          onChange={handleDateChange}
                          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 border-[#DCE6C8] focus:border-[#319795] rounded-xl sm:rounded-2xl outline-none font-bold text-xs sm:text-sm text-[#2D3748] transition-all shadow-sm"
                        />
                      </div>
                      {selectedDate && (
                        <p className="text-[11px] font-bold text-[#319795] mt-1 pl-1">
                          {currentDayType === "vikend"
                            ? "✨ Izabran je vikend (Tarifa: 16.000 RSD)"
                            : "📅 Izabran je radni dan (Tarifa: 13.000 RSD)"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#319795]" />
                          Izaberite Termin
                        </span>
                      </label>

                      {selectedDate ? (
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                          {dynamicSlots.map(({ slotString }) => {
                            const occupied = isTimeSlotOccupied(slotString);
                            const isSelected = selectedSlot === slotString;
                            return (
                              <button
                                key={slotString}
                                type="button"
                                disabled={occupied}
                                onClick={() => setSelectedSlot(slotString)}
                                className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl border-2 font-display font-bold text-[10.5px] sm:text-xs transition-all text-center ${
                                  occupied
                                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                    : isSelected
                                      ? "border-[#319795] bg-[#319795]/10 text-[#319795] shadow-sm scale-[1.02]"
                                      : "border-[#DCE6C8] bg-white text-[#2D3748]/70 hover:border-[#319795]/40 hover:bg-[#319795]/5"
                                }`}
                              >
                                {slotString} {occupied ? "(Zauzeto)" : "h"}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-[60px] sm:h-[88px] flex items-center justify-center p-3 bg-white/60 border-2 border-dashed border-[#DCE6C8] rounded-xl sm:rounded-2xl text-center text-[#2D3748]/40 text-[10px] sm:text-xs font-bold">
                          Prvo izaberite datum u kalendaru
                        </div>
                      )}

                      {slotConflict && (
                        <p className="text-[11px] font-bold text-red-500 mt-1 pl-1">
                          ⚠️ Izabrani termin se preklapa sa postojećom
                          rezervacijom.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. Dodatno Vreme (Opciono) */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#319795]" />
                      Dodatno Vreme Proslave (Opciono)
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { mins: 0, label: "Standard (2h)", price: "+0 RSD" },
                        { mins: 30, label: "+30 Minuta", price: "+2.000 RSD" },
                        { mins: 60, label: "+1 Sat", price: "+4.000 RSD" },
                      ].map((opt) => (
                        <button
                          key={opt.mins}
                          type="button"
                          onClick={() => setExtraTimeMinutes(opt.mins)}
                          className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all ${
                            extraTimeMinutes === opt.mins
                              ? "border-[#319795] bg-white font-bold text-[#319795] shadow-sm"
                              : "border-white bg-white/60 text-[#2D3748]/70 hover:bg-white"
                          }`}
                        >
                          <div className="text-[11px] sm:text-xs font-black leading-tight">
                            {opt.label}
                          </div>
                          <div className="text-[9px] sm:text-[10px] opacity-80 mt-0.5">
                            {opt.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="bg-amber-50/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200/80 flex gap-2.5 sm:gap-3 items-start">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10.5px] sm:text-xs text-amber-800 font-medium leading-relaxed">
                      <strong className="font-bold">
                        Želite dužu proslavu?
                      </strong>{" "}
                      Moguće je produžiti termin za 30 minuta ili sat vremena
                      iznad ili napomenuti Nadi prilikom direktnog dogovora.
                    </p>
                  </div>

                  {/* 3. Podaci o Roditelju i Detetu */}
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-5 pt-2">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                        Ime Roditelja
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#319795]" />
                        <input
                          type="text"
                          placeholder="Petar Petrović"
                          required
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 border-[#DCE6C8] focus:border-[#319795] rounded-xl sm:rounded-2xl outline-none font-bold text-xs sm:text-sm text-[#2D3748] shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                        Broj Telefona
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#319795]" />
                        <input
                          type="tel"
                          placeholder="+381 64 1234567"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 border-[#DCE6C8] focus:border-[#319795] rounded-xl sm:rounded-2xl outline-none font-bold text-xs sm:text-sm text-[#2D3748] shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                        Ime Slavljenika/ce
                      </label>
                      <div className="relative">
                        <Smile className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#319795]" />
                        <input
                          type="text"
                          placeholder="Marko"
                          required
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 border-[#DCE6C8] focus:border-[#319795] rounded-xl sm:rounded-2xl outline-none font-bold text-xs sm:text-sm text-[#2D3748] shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      <div className="space-y-1.5 sm:space-y-2 col-span-1">
                        <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                          Uzrast
                        </label>
                        <div className="relative">
                          <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#319795]" />
                          <input
                            type="number"
                            min={1}
                            max={17}
                            required
                            value={childAge}
                            onChange={(e) =>
                              setChildAge(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            className="w-full pl-9 pr-2 py-2.5 sm:py-3 bg-white border-2 border-[#DCE6C8] focus:border-[#319795] rounded-xl sm:rounded-2xl outline-none font-bold text-xs sm:text-sm text-[#2D3748] shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2 col-span-2">
                        <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#319795]" />
                          <input
                            type="email"
                            placeholder="mail@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-white border-2 border-[#DCE6C8] focus:border-[#319795] rounded-xl sm:rounded-2xl outline-none font-bold text-xs sm:text-sm text-[#2D3748] shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dodatne Napomene */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                      Dodatne Napomene / Specijalni Zahtevi
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-[#319795]" />
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Željena tema, specifične alergije, uzrast gostiju, dekoracija, itd..."
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 border-[#DCE6C8] focus:border-[#319795] rounded-xl sm:rounded-2xl outline-none font-bold text-xs sm:text-sm text-[#2D3748] transition-all resize-none shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || slotConflict}
                    className="w-full py-3.5 sm:py-4 bg-[#319795] hover:bg-[#287977] disabled:bg-gray-400 text-white rounded-full font-black text-base sm:text-lg tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Slanje rezervacije...</span>
                      </>
                    ) : (
                      <span>
                        Pošalji Upit
                        {selectedDate
                          ? ` (${calculateTotalPrice().toLocaleString("sr-RS")} RSD)`
                          : ""}
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
