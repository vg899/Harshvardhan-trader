import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Wrench } from "lucide-react";
import { motion } from "framer-motion";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError("Invalid credentials. Please contact Administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Wrench className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-xl uppercase tracking-widest font-bold text-center text-white mb-2">Harshvardhan Traders</h1>
        <p className="text-slate-400 text-center mb-8 text-xs font-mono">Hardware Shop POS System</p>
        
        {error && <div className="p-3 mb-4 bg-red-500/10 text-red-500 rounded border border-red-500/30 text-[10px] uppercase font-bold tracking-wider text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Email / Username</label>
            <input
              type="email"
              required
              className="w-full bg-[#0f172a]/50 border border-slate-700 focus:border-blue-500 rounded-lg px-4 py-3 text-sm text-white outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shop.com"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-[#0f172a]/50 border border-slate-700 focus:border-blue-500 rounded-lg px-4 py-3 text-sm text-white outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
        
        <p className="text-center text-[10px] font-mono text-slate-500 mt-6 uppercase tracking-wider">
          Authorized personnel only. IP Access tracked.
        </p>
      </motion.div>
    </div>
  );
};
