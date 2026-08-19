import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { api } from "../../services/api";

interface AdminLoginProps {
  onSuccess: (pin: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const { token } = await api.loginAdmin(pin);
      onSuccess(token);
    } catch (err: any) {
      setError(err.message || "Pogrešan PIN kod. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-900 flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-sm bg-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700 text-center space-y-5 sm:space-y-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#319795]/20 text-[#319795] rounded-2xl flex items-center justify-center mx-auto border border-[#319795]/30">
          <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl">
            Bambino Admin
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unesite PIN kod za pristup panelu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Unesite PIN"
            className="w-full text-center text-xl sm:text-2xl tracking-[0.3em] sm:tracking-[0.5em] font-mono py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#319795] transition-colors"
            autoFocus
          />

          {error && (
            <p className="text-xs font-bold text-rose-400">
              Pogrešan PIN kod. Pokušajte ponovo.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full py-3.5 bg-[#319795] hover:bg-[#2B8280] active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg text-sm"
          >
            {loading ? "Provera..." : "Prijavi se"}
          </button>
        </form>
      </div>
    </div>
  );
};
