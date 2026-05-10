import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import { Customer } from "../types";
import { Search, UserPlus, Phone, IndianRupee } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const CustomersScreen = () => {
  const { customers, addCustomer, updateCustomer } = useData();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  ).sort((a, b) => b.totalSpent - a.totalSpent); // Sort by highest spender

  const [formData, setFormData] = useState({ name: "", phone: "", dues: 0, totalSpent: 0 });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCustomer(formData as any);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1e293b]/40 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/30">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Customer Directory</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs w-full sm:w-64 focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
            <button
              onClick={() => { setFormData({ name: "", phone: "", dues: 0, totalSpent: 0 }); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors whitespace-nowrap shadow-lg shadow-blue-500/20"
            >
              + Add Customer
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Customer Info</th>
                <th className="px-4 py-3 text-right">Total Spend</th>
                <th className="px-4 py-3 text-right">Pending Dues</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-xs">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="px-4 py-3">
                     <p className="font-semibold text-white">{customer.name}</p>
                     <p className="text-slate-400 font-mono text-[10px] mt-0.5">+91 {customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">{formatCurrency(customer.totalSpent || 0)}</td>
                  <td className="px-4 py-3 text-right">
                      {(customer.dues || 0) > 0 ? (
                        <span className="font-bold text-red-500">{formatCurrency(customer.dues || 0)}</span>
                      ) : (
                        <span className="text-slate-500 font-mono">₹0.00</span>
                      )}
                  </td>
                  <td className="px-4 py-3">
                     <div className="flex gap-2 justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                           className="p-1 px-3 text-[10px] uppercase font-bold tracking-wider bg-slate-700 text-slate-300 hover:text-white rounded disabled:opacity-50"
                           disabled={(customer.dues || 0) <= 0}
                           onClick={() => {
                              const amount = prompt("Enter amount paid:");
                              if(amount && !isNaN(Number(amount))) {
                                 updateCustomer(customer.id, { dues: Math.max(0, (customer.dues || 0) - Number(amount)) });
                              }
                           }}
                        >
                           Pay Dues
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No matching customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                 <h2 className="text-sm uppercase tracking-widest font-bold text-white">Add Customer</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mobile No</label>
                  <input type="tel" maxLength={10} required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm" />
                </div>
                 <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Initial Dues (₹) - Optional</label>
                  <input type="number" value={formData.dues} onChange={e => setFormData({...formData, dues: Number(e.target.value)})} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-right font-mono" />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                     Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
