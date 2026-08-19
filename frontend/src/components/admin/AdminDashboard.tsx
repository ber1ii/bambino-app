import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  ShieldAlert,
  TrendingUp,
  DollarSign,
  Search,
  RefreshCw,
  AlertCircle,
  LogOut,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  MessageSquare,
  Archive,
} from "lucide-react";
import { api } from "../../services/api";
import type { ReservationStatus } from "../../types";

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onOpenArchive: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  onLogout,
  onOpenArchive,
}) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"LIST" | "BLOCK">("LIST");

  // Block Slot Form State
  const [blockDate, setBlockDate] = useState("");
  const [blockStartTime, setBlockStartTime] = useState("10:00");
  const [blockEndTime, setBlockEndTime] = useState("12:00");
  const [blockReason, setBlockReason] = useState(
    "Privatni Događaj / Održavanje",
  );
  const [blockMessage, setBlockMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminReservations(token, page, 10);

      if (Array.isArray(res)) {
        setReservations(res);
        setTotalPages(1);
      } else {
        setReservations(res.data || []);
        setTotalPages(Math.min(res.total_pages || 1, 5));
      }
    } catch (err: any) {
      setError(err.message || "Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page]);

  // Quick Revenue & Booking Metrics Calculation
  const metrics = useMemo(() => {
    let confirmedRev = 0;
    let potentialRev = 0;
    let pendingCount = 0;

    reservations.forEach((r: any) => {
      const itemPrice = r.price || r.Price || 0;
      const st = (r.status || "").toUpperCase();

      if (st === "COMPLETED") {
        confirmedRev += itemPrice;
      } else if (st === "CONFIRMED") {
        potentialRev += itemPrice;
      } else if (st === "PENDING") {
        potentialRev += itemPrice;
        pendingCount += 1;
      }
    });

    return {
      confirmedRev,
      potentialRev,
      pendingCount,
      totalCount: reservations.length,
    };
  }, [reservations]);

  // Filtered List
  const filteredReservations = useMemo(() => {
    return reservations.filter((r: any) => {
      const childName = r.child_name || r.childName || "";
      const parentName = r.parent_name || r.parentName || "";
      const phone = r.phone_number || r.phone || "";
      const st = (r.status || "").toUpperCase();

      const matchesSearch =
        childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm);

      const matchesStatus = statusFilter === "ALL" || st === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, statusFilter]);

  const handleStatusChange = async (
    id: string,
    newStatus: ReservationStatus,
  ) => {
    const sendEmail = window.confirm(
      `Da li želite da pošaljete automatsko email obaveštenje klijentu o promeni statusa u "${newStatus}"?`,
    );

    try {
      await api.updateReservationStatus(id, newStatus, sendEmail, token);
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus.toLowerCase() } : r,
        ),
      );
    } catch (err: any) {
      alert(err.message || "Neuspešna izmena statusa.");
    }
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBlockMessage(null);
      await api.blockTimeSlot(
        {
          date: blockDate,
          startTime: blockStartTime,
          endTime: blockEndTime,
          reason: blockReason,
        },
        token,
      );
      setBlockMessage({ type: "success", text: "Termin je uspešno blokiran!" });
      fetchReservations();
    } catch (err: any) {
      setBlockMessage({
        type: "error",
        text: err.message || "Greška pri blokiranju.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#2D3748] pb-20">
      {/* Top Navbar */}
      <header className="bg-[#2D3748] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#319795] p-2 rounded-xl text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl leading-tight">
                Bambino Admin Panel
              </h1>
              <p className="text-xs text-white/70">Upravljanje rezervacijama</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={fetchReservations}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
              title="Osveži podatke"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* Arhiva Button */}
            <button
              onClick={onOpenArchive}
              className="flex items-center gap-2 px-3 py-2 bg-[#319795] hover:bg-[#2B8280] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Arhiva</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/80 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Odjava</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Metric Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ostvareni Prihod
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-800">
              {metrics.confirmedRev.toLocaleString("sr-RS")} RSD
            </p>
            <p className="text-[11px] font-bold text-emerald-600 mt-1">
              Završeno
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-purple-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Očekivani Prihod
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-800">
              {metrics.potentialRev.toLocaleString("sr-RS")} RSD
            </p>
            <p className="text-[11px] font-bold text-purple-600 mt-1">
              Uključuje "Na čekanju & Potvrđeno"
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-amber-500 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Na Čekanju
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-800">
              {metrics.pendingCount}
            </p>
            <p className="text-[11px] font-bold text-amber-600 mt-1">
              Zahtevaju potvrdu
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ukupno Termina
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-800">
              {metrics.totalCount}
            </p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              Svi evidentirani termini
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/80 p-1.5 rounded-2xl max-w-md">
          <button
            onClick={() => setActiveTab("LIST")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "LIST"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pregled Rezervacija
          </button>
          <button
            onClick={() => setActiveTab("BLOCK")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "BLOCK"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Blokiraj Termin
          </button>
        </div>

        {/* TAB 1: Reservation List */}
        {activeTab === "LIST" && (
          <div className="space-y-4">
            {/* Search & Status Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pretraži po imenu deteta, roditelja ili telefonu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#319795]"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 shrink-0">
                {["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shrink-0 transition-all ${
                        statusFilter === st
                          ? "bg-[#2D3748] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st === "ALL"
                        ? "Sve"
                        : st === "PENDING"
                          ? "Čekanje"
                          : st === "CONFIRMED"
                            ? "Potvrđeno"
                            : st === "CANCELLED"
                              ? "Otkazano"
                              : "Završeno"}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Error view */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reservation Cards */}
            {filteredReservations.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-600">
                  Nema pronađenih rezervacija.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredReservations.map((item: any) => {
                    const rawStart =
                      item.start_time || item.startTime || item.booking_range;
                    const rawEnd = item.end_time || item.endTime;

                    const startDate = rawStart
                      ? new Date(rawStart)
                      : new Date();
                    const endDate = rawEnd ? new Date(rawEnd) : new Date();

                    const formattedDate = startDate.toLocaleDateString(
                      "sr-RS",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    );

                    const formattedTime = `${startDate.toLocaleTimeString(
                      "sr-RS",
                      { hour: "2-digit", minute: "2-digit" },
                    )} - ${endDate.toLocaleTimeString("sr-RS", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`;

                    const childName =
                      item.child_name || item.childName || "N/A";
                    const childAge = item.child_age ?? item.childAge;
                    const packageName =
                      item.package_name || item.packageName || "Standard Paket";
                    const parentName =
                      item.parent_name || item.parentName || "N/A";
                    const phone =
                      item.phone_number || item.phone || "Nije navedeno";
                    const price = item.price ?? item.Price ?? 0;
                    const currentStatus = (
                      item.status || ""
                    ).toUpperCase() as ReservationStatus;

                    return (
                      <div
                        key={item.id}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-black text-lg text-slate-800">
                              {formattedDate} ({formattedTime})
                            </span>
                          </div>
                          <StatusBadge status={currentStatus} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {/* Child & Package */}
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Slavljenik & Paket
                            </p>
                            <p className="font-extrabold text-slate-800 text-base mt-0.5">
                              {childName}{" "}
                              {childAge !== undefined && childAge !== null
                                ? `(${childAge} god)`
                                : ""}
                            </p>
                            <p className="text-xs font-bold text-[#319795]">
                              {packageName}
                            </p>
                            <p className="text-xs font-black text-slate-700 mt-1">
                              {price.toLocaleString("sr-RS")} RSD
                            </p>
                          </div>

                          {/* Parent Info & Quick Contact */}
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Roditelj / Kontakt
                            </p>
                            <p className="font-bold text-slate-800 mt-0.5">
                              {parentName}
                            </p>
                            <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#319795]" />
                              <span>{phone}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <a
                                href={`tel:${phone}`}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1 border border-emerald-200"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Pozovi</span>
                              </a>
                              <a
                                href={`viber://chat?number=${encodeURIComponent(
                                  phone,
                                )}`}
                                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg flex items-center gap-1 border border-purple-200"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Viber</span>
                              </a>
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Napomene
                            </p>
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic mt-1">
                              {item.notes ||
                                "Nema posebnih napomena od strane klijenta."}
                            </p>
                          </div>
                        </div>

                        {/* Status Toggle Actions */}
                        <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                          {currentStatus === "COMPLETED" && (
                            <span className="text-xs font-bold text-slate-400 italic">
                              Termin je završen i zaključan
                            </span>
                          )}

                          {currentStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "CONFIRMED")
                                }
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                              >
                                Potvrdi
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "CANCELLED")
                                }
                                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors"
                              >
                                Otkaži
                              </button>
                            </>
                          )}

                          {currentStatus === "CONFIRMED" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "COMPLETED")
                                }
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                              >
                                Završi
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "CANCELLED")
                                }
                                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors"
                              >
                                Otkaži
                              </button>
                            </>
                          )}

                          {currentStatus === "CANCELLED" && (
                            <button
                              onClick={() =>
                                handleStatusChange(item.id, "CONFIRMED")
                              }
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                            >
                              Vrati u Potvrđeno
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Bar */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mt-6">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors"
                    >
                      Prethodna
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pNum) => (
                          <button
                            key={pNum}
                            onClick={() => setPage(pNum)}
                            className={`w-8 h-8 rounded-xl font-black text-xs transition-all ${
                              page === pNum
                                ? "bg-[#2D3748] text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {pNum}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors"
                    >
                      Sledeća
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: Block Date / Private Event Tool */}
        {activeTab === "BLOCK" && (
          <div className="max-w-xl bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">
                Blokiranje Slobodnog Termina
              </h2>
              <p className="text-xs text-slate-500">
                Onemogućite klijentima da rezervišu određeno vreme na sajtu.
              </p>
            </div>

            {blockMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold ${
                  blockMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {blockMessage.text}
              </div>
            )}

            <form onSubmit={handleBlockSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#319795]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Početak
                  </label>
                  <input
                    type="time"
                    required
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#319795]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Kraj
                  </label>
                  <input
                    type="time"
                    required
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#319795]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Razlog Blokade
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. Privatna proslava, renoviranje..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#319795]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#319795] hover:bg-[#2B8280] text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
              >
                Blokiraj Ovaj Termin
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const st = (status || "").toUpperCase();
  switch (st) {
    case "CONFIRMED":
      return (
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-[11px] uppercase tracking-wider rounded-lg flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Potvrđeno
        </span>
      );
    case "PENDING":
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-black text-[11px] uppercase tracking-wider rounded-lg flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Na Čekanju
        </span>
      );
    case "COMPLETED":
      return (
        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-black text-[11px] uppercase tracking-wider rounded-lg flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Završeno
        </span>
      );
    case "CANCELLED":
      return (
        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-black text-[11px] uppercase tracking-wider rounded-lg flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" /> Otkazano
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-black text-[11px] uppercase tracking-wider rounded-lg">
          {st || "PENDING"}
        </span>
      );
  }
};