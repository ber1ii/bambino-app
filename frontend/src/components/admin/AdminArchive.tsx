import React, { useState, useEffect, useMemo } from "react";
import {
  Archive,
  Search,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  Filter,
} from "lucide-react";
import { api } from "../../services/api";

interface AdminArchiveProps {
  token: string;
  onBack?: () => void;
  onOpenArchive?: () => void; // Made optional
}

export const AdminArchive: React.FC<AdminArchiveProps> = ({
  token,
  onBack,
}) => {
  const [archivedReservations, setArchivedReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchArchive = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminReservations(token, page, 15);

      if (Array.isArray(res)) {
        setArchivedReservations(res);
        setTotalPages(1);
      } else {
        setArchivedReservations(res.data || []);
        setTotalPages(Math.min(res.total_pages || 1, 10));
      }
    } catch (err: any) {
      setError(err.message || "Greška pri učitavanju arhive.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, [page]);

  // Derived available years for filtering based on loaded data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    archivedReservations.forEach((r) => {
      const rawStart = r.start_time || r.startTime || r.booking_range;
      if (rawStart) {
        years.add(new Date(rawStart).getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [archivedReservations]);

  // Filtered Archive List
  const filteredArchive = useMemo(() => {
    return archivedReservations.filter((r: any) => {
      const childName = r.child_name || r.childName || "";
      const parentName = r.parent_name || r.parentName || "";
      const phone = r.phone_number || r.phone || "";
      const st = (r.status || "").toUpperCase();

      const rawStart = r.start_time || r.startTime || r.booking_range;
      const resDate = rawStart ? new Date(rawStart) : null;

      const matchesSearch =
        childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "COMPLETED" && st === "COMPLETED") ||
        (statusFilter === "CANCELLED" && st === "CANCELLED");

      const matchesYear =
        selectedYear === "ALL" ||
        (resDate && resDate.getFullYear().toString() === selectedYear);

      const matchesMonth =
        selectedMonth === "ALL" ||
        (resDate && (resDate.getMonth() + 1).toString() === selectedMonth);

      return matchesSearch && matchesStatus && matchesYear && matchesMonth;
    });
  }, [
    archivedReservations,
    searchTerm,
    statusFilter,
    selectedYear,
    selectedMonth,
  ]);

  // Archive Metrics
  const archiveMetrics = useMemo(() => {
    let totalRevenue = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    filteredArchive.forEach((r: any) => {
      const st = (r.status || "").toUpperCase();
      const price = r.price || r.Price || 0;

      if (st === "COMPLETED") {
        totalRevenue += price;
        completedCount++;
      } else if (st === "CANCELLED") {
        cancelledCount++;
      }
    });

    return {
      totalRevenue,
      completedCount,
      cancelledCount,
      totalCount: filteredArchive.length,
    };
  }, [filteredArchive]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#2D3748] pb-20">
      {/* Header */}
      <header className="bg-[#2D3748] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#319795] p-2 rounded-xl text-white">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl leading-tight">
                Arhiva Rezervacija
              </h1>
              <p className="text-xs text-white/70">
                Pregled i istorija svih prošlih proslava
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={fetchArchive}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
              title="Osveži podatke"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors"
              >
                Nazad na Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Archive Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ukupan Arhiviran Prihod
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800">
              {archiveMetrics.totalRevenue.toLocaleString("sr-RS")} RSD
            </p>
            <p className="text-[11px] font-bold text-emerald-600 mt-1">
              Iz realizovanih rođendana
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Završene Proslave
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800">
              {archiveMetrics.completedCount}
            </p>
            <p className="text-[11px] font-bold text-blue-600 mt-1">
              Uspešno održani termini
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-rose-500 mb-2">
              <XCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Otkazani Termini
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800">
              {archiveMetrics.cancelledCount}
            </p>
            <p className="text-[11px] font-bold text-rose-500 mt-1">
              Evidentirano u istoriji
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pretraži arhivu po detetu, roditelju ili telefonu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#319795]"
              />
            </div>

            {/* Status Selector */}
            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 shrink-0">
              {["ALL", "COMPLETED", "CANCELLED"].map((st) => (
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
                    : st === "COMPLETED"
                      ? "Završeno"
                      : "Otkazano"}
                </button>
              ))}
            </div>
          </div>

          {/* Date Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Filter className="w-4 h-4" />
              <span>Period:</span>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#319795]"
            >
              <option value="ALL">Sve Godine</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}. godina
                </option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#319795]"
            >
              <option value="ALL">Svi Meseci</option>
              <option value="1">Januar</option>
              <option value="2">Februar</option>
              <option value="3">Mart</option>
              <option value="4">April</option>
              <option value="5">Maj</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Avgust</option>
              <option value="9">Septembar</option>
              <option value="10">Oktobar</option>
              <option value="11">Novembar</option>
              <option value="12">Decembar</option>
            </select>

            {(selectedYear !== "ALL" || selectedMonth !== "ALL") && (
              <button
                onClick={() => {
                  setSelectedYear("ALL");
                  setSelectedMonth("ALL");
                }}
                className="text-[#319795] hover:underline ml-auto"
              >
                Poništi filtere datuma
              </button>
            )}
          </div>
        </div>

        {/* Error View */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Archive List */}
        {filteredArchive.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Archive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-600">
              Nema arhiviranih stavki za izabrane filtere.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {filteredArchive.map((item: any) => {
                const rawStart =
                  item.start_time || item.startTime || item.booking_range;
                const rawEnd = item.end_time || item.endTime;

                const startDate = rawStart ? new Date(rawStart) : new Date();
                const endDate = rawEnd ? new Date(rawEnd) : new Date();

                const formattedDate = startDate.toLocaleDateString("sr-RS", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });

                const formattedTime = `${startDate.toLocaleTimeString("sr-RS", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${endDate.toLocaleTimeString("sr-RS", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;

                const childName = item.child_name || item.childName || "N/A";
                const childAge = item.child_age ?? item.childAge;
                const packageName =
                  item.package_name || item.packageName || "Standard Paket";
                const parentName = item.parent_name || item.parentName || "N/A";
                const phone =
                  item.phone_number || item.phone || "Nije navedeno";
                const price = item.price ?? item.Price ?? 0;
                const isCompleted =
                  (item.status || "").toUpperCase() === "COMPLETED";

                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#319795]" />
                        <span className="font-display font-black text-slate-800">
                          {formattedDate} ({formattedTime})
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 font-black text-[11px] uppercase tracking-wider rounded-lg flex items-center gap-1 w-fit ${
                          isCompleted
                            ? "bg-blue-100 text-blue-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Završeno
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Otkazano
                          </>
                        )}
                      </span>
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

                      {/* Parent / Contact */}
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
                      </div>

                      {/* Notes */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Beleške / Napomene
                        </p>
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic mt-1">
                          {item.notes || "Nema sačuvanih napomena."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
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
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors"
                >
                  Sledeća
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
