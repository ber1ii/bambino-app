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
  CalendarDays,
  CalendarHeart,
  Check,
  AlertCircle,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { api, type Package, type TimeSlot } from "../../services/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: { id: string; name: string } | null;
}

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

const AVAILABLE_HOURS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

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
  selectedPackage,
}) => {
  const [dbPackages, setDbPackages] = useState<Package[]>([]);
  const [reservedSlots, setReservedSlots] = useState<TimeSlot[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Form Field States
  const [dayType, setDayType] = useState<"radni-dan" | "vikend">("radni-dan");
  const [extraTimeMinutes, setExtraTimeMinutes] = useState<number>(0); // 0, 30, or 60 min
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("15:00");
  const [parentName, setParentName] = useState<string>("");
  const [childName, setChildName] = useState<string>("");
  const [childAge, setChildAge] = useState<number | "">(5);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // UI Feedback States
  const [dateError, setDateError] = useState<string>("");
  const [slotConflict, setSlotConflict] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (
      selectedPackage?.id === "vikend" ||
      selectedPackage?.id === "radni-dan"
    ) {
      setDayType(selectedPackage.id as "radni-dan" | "vikend");
    }
  }, [selectedPackage]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setLoadingPackages(true);
      api
        .getPackages()
        .then((pkgs) => setDbPackages(pkgs))
        .catch((err) => console.error("Failed to load packages:", err))
        .finally(() => setLoadingPackages(false));
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDate) {
      setReservedSlots([]);
      setSlotConflict(false);
      return;
    }

    api
      .getAvailability(selectedDate)
      .then((slots) => {
        setReservedSlots(slots);
        checkSlotConflict(selectedDate, startTime, extraTimeMinutes, slots);
      })
      .catch((err) => console.error("Failed to check availability:", err));
  }, [selectedDate, startTime, extraTimeMinutes]);

  const calculateTotalDuration = () => {
    return 120 + extraTimeMinutes; // 2 hours base + extra time
  };

  const calculateTotalPrice = () => {
    const basePrice = dayType === "radni-dan" ? 13000 : 16000;
    const extraPrice =
      extraTimeMinutes === 30 ? 2000 : extraTimeMinutes === 60 ? 4000 : 0;
    return basePrice + extraPrice;
  };

  const checkSlotConflict = (
    date: string,
    time: string,
    extraMins: number,
    slots: TimeSlot[],
  ) => {
    if (!date || !time) return;
    const proposedStart = new Date(`${date}T${time}:00`);
    const totalDuration = 120 + extraMins;
    const proposedEnd = new Date(
      proposedStart.getTime() + totalDuration * 60 * 1000,
    );

    const hasConflict = slots.some((slot) => {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);
      // Use < and > so exact boundary end times (e.g. 19:00) remain selectable
      return proposedStart < slotEnd && proposedEnd > slotStart;
    });

    setSlotConflict(hasConflict);
  };

  const isTimeSlotOccupied = (timeStr: string) => {
    if (!selectedDate || reservedSlots.length === 0) return false;
    const checkStart = new Date(`${selectedDate}T${timeStr}:00`);
    const checkEnd = new Date(
      checkStart.getTime() + calculateTotalDuration() * 60 * 1000,
    );

    return reservedSlots.some((slot) => {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);
      // Use < and > so 19:00 is available when a 17:00-19:00 booking exists
      return checkStart < slotEnd && checkEnd > slotStart;
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
      checkSlotConflict(date, startTime, extraTimeMinutes, slots);
    } catch (err) {
      console.error("Failed to check availability:", err);
    }
  };

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate, startTime, extraTimeMinutes]);

  const handleDayTypeChange = (type: "radni-dan" | "vikend") => {
    setDayType(type);
    setSelectedDate("");
    setDateError("");
    setSlotConflict(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setSelectedDate("");
      setDateError("");
      return;
    }

    const [year, month, day] = val.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (dayType === "vikend" && !isWeekend) {
      setDateError("Za vikend tarifu možete izabrati samo Subotu ili Nedelju.");
      setSelectedDate("");
      return;
    }

    if (dayType === "radni-dan" && isWeekend) {
      setDateError(
        "Za tarifu radnog dana možete izabrati samo Ponedeljak – Petak.",
      );
      setSelectedDate("");
      return;
    }

    setDateError("");
    setSelectedDate(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!selectedDate) {
      setDateError("Molimo izaberite odgovarajući datum.");
      return;
    }

    if (slotConflict) {
      setSubmitError(
        "Izabrani termin je već zauzet. Molimo izaberite drugo vreme.",
      );
      return;
    }

    const searchStr = dayType === "radni-dan" ? "radni" : "vikend";
    const pkg = dbPackages.find((p: any) =>
      (p.title || p.name || "").toLowerCase().includes(searchStr),
    );
    const finalPackageId = pkg ? pkg.id : dayType;

    if (!/^[0-9a-fA-F-]{36}$/.test(finalPackageId)) {
      setSubmitError(
        "Greška: Nije moguće pronaći ID paketa. Osvežite stranicu.",
      );
      return;
    }

    // Calculate start and end strings in local ISO format (+ offset)
    const startISO = toLocalISOString(selectedDate, startTime);

    // Calculate end time
    const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
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

      // Refetch slots immediately so the newly booked slot gets disabled instantly
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

                  {/* 1. Odabir Tarife/Paketa */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                      1. Izaberite Paket / Dan Proslave
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => handleDayTypeChange("radni-dan")}
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all text-center ${
                          dayType === "radni-dan"
                            ? "border-[#319795] bg-[#E6FFFA] shadow-md scale-[1.01]"
                            : "border-white bg-white/80 hover:border-[#319795]/30"
                        }`}
                      >
                        <CalendarDays
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${dayType === "radni-dan" ? "text-[#319795]" : "text-[#2D3748]/40"}`}
                        />
                        <span className="font-display font-bold text-sm sm:text-base text-[#2D3748]">
                          Radni dan
                        </span>
                        <span className="text-[10px] sm:text-xs text-[#2D3748]/70 font-semibold leading-tight">
                          2h igraonice & animacije
                        </span>
                        <span className="font-black text-[#319795] text-xs sm:text-sm mt-0.5">
                          13.000 RSD
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDayTypeChange("vikend")}
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all text-center ${
                          dayType === "vikend"
                            ? "border-[#2B6CB0] bg-[#EBF8FF] shadow-md scale-[1.01]"
                            : "border-white bg-white/80 hover:border-[#2B6CB0]/30"
                        }`}
                      >
                        <CalendarHeart
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${dayType === "vikend" ? "text-[#2B6CB0]" : "text-[#2D3748]/40"}`}
                        />
                        <span className="font-display font-bold text-sm sm:text-base text-[#2D3748]">
                          Vikend
                        </span>
                        <span className="text-[10px] sm:text-xs text-[#2D3748]/70 font-semibold leading-tight">
                          2h igraonice & animacije
                        </span>
                        <span className="font-black text-[#2B6CB0] text-xs sm:text-sm mt-0.5">
                          16.000 RSD
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Dodatno Vreme (Opciono) */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#319795]" />
                      2. Dodatno Vreme Proslave (Opciono)
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

                  {/* 3. Datum i Izbor Sata */}
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                        Datum (
                        {dayType === "vikend"
                          ? "Subota / Nedelja"
                          : "Ponedeljak – Petak"}
                        )
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#319795]" />
                        <input
                          type="date"
                          required
                          value={selectedDate}
                          onChange={handleDateChange}
                          className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 rounded-xl sm:rounded-2xl outline-none font-bold text-xs sm:text-sm text-[#2D3748] transition-all shadow-sm ${
                            dateError
                              ? "border-red-500"
                              : "border-[#DCE6C8] focus:border-[#319795]"
                          }`}
                        />
                      </div>
                      {dateError && (
                        <p className="text-[11px] font-bold text-red-500 mt-1 pl-1">
                          {dateError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[11px] sm:text-xs font-black text-[#2D3748]/80 uppercase tracking-wider">
                        Izaberite Sat Početka
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#319795]" />
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 border-[#DCE6C8] focus:border-[#319795] rounded-xl sm:rounded-2xl outline-none font-bold text-xs sm:text-sm text-[#2D3748] transition-all shadow-sm appearance-none"
                        >
                          {AVAILABLE_HOURS.map((hr) => {
                            const occupied = isTimeSlotOccupied(hr);
                            return (
                              <option key={hr} value={hr} disabled={occupied}>
                                {hr} {occupied ? "(Zauzeto)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      {slotConflict && (
                        <p className="text-[11px] font-bold text-red-500 mt-1 pl-1">
                          ⚠️ Izabrani termin preklapa sa postojećom
                          rezervacijom.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. Podaci o Roditelju i Detetu */}
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
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
                        Ime Slavljenika
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

                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 sm:gap-3">
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

                  {/* Dodatni Zahtevi / Napomene */}
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
                        Pošalji Upit (
                        {calculateTotalPrice().toLocaleString("sr-RS")} RSD)
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
