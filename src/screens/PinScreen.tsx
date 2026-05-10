import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Lock, AlertCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export const PinScreen = () => {
  const { userProfile, unlockWithPin, createPin, logout } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [setupMode] = useState(!userProfile?.pin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupMode) {
      if (pin.length < 4) {
        setError("PIN must be at least 4 digits");
        return;
      }
      await createPin(pin);
    } else {
      const unlocked = unlockWithPin(pin);
      if (!unlocked) {
        setError("Incorrect PIN. Try again.");
        setPin("");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
       <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-sm w-full bg-[#1e293b]/80 border border-slate-700 p-8 rounded-2xl shadow-2xl backdrop-blur-md"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-xl uppercase tracking-widest font-bold text-center text-white mb-2">
          {setupMode ? "Create PIN" : "App Locked"}
        </h2>
        <p className="text-slate-400 text-center mb-6 text-xs font-mono">
           {setupMode 
            ? "Create a 4+ digit PIN to quickly access your POS"
            : `Enter PIN to unlock (${userProfile?.role})`}
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-500/30">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              className="w-full text-center tracking-[1em] text-3xl bg-[#0f172a]/50 border-b-2 border-slate-700 focus:border-blue-500 outline-none text-white py-4 transition-colors font-mono rounded-t-lg"
              value={pin}
              onChange={(e) => {
                setError("");
                setPin(e.target.value);
              }}
              placeholder="••••"
              maxLength={8}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/20 text-xs uppercase tracking-widest"
          >
            {setupMode ? "Set PIN" : "Unlock"}
          </button>
        </form>
        
        <button 
          onClick={logout}
          className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors py-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out completely
        </button>
      </motion.div>
    </div>
  );
};
