import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import { Customer } from "../types";
import { Search, UserPlus, Phone, IndianRupee, Clock, ShoppingBag, ArrowRight } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { parseISO, format } from "date-fns";

export const CustomersScreen = () => {
  const { customers, sales, addCustomer, updateCustomer } = useData();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  ).sort((a, b) => b.totalSpent - a.totalSpent);

  const [formData, setFormData] = useState({ name: "", phone: "", dues: 0, totalSpent: 0, visits: 0 });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCustomer(formData as any);
    setIsModalOpen(false);
  };

  const customerSales = selectedCustomer 
    ? sales.filter(s => s.customerId === selectedCustomer.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">CRM</h2>
          <p className="text-sm text-slate-400">Customer Relationship Management</p>
        </div>
        <button
          onClick={() => { setFormData({ name: "", phone: "", dues: 0, totalSpent: 0, visits: 0 }); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors whitespace-nowrap shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="bg-[#1e293b]/40 border border-slate-700/50 p-4 rounded-3xl relative">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Smart CRM Search</label>
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name or 10-digit mobile number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 pl-12 pr-4 py-4 rounded-xl text-base text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-inner"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <motion.div layout initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={customer.id} className="bg-[#1e293b]/40 border border-slate-700/50 hover:border-slate-600 rounded-3xl p-5 hover:bg-[#1e293b]/80 transition-colors shadow-xl">
             <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{customer.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1 bg-slate-800/50 px-2 py-0.5 rounded-md w-max">
                     <Phone className="w-3 h-3 text-emerald-400" />
                     <span className="font-mono tracking-wider">+91 {customer.phone}</span>
                  </div>
                </div>
                {customer.dues > 0 && (
                   <span className="bg-red-500/10 text-red-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md border border-red-500/20">Has Dues</span>
                )}
             </div>

             <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                <div className="bg-[#0f172a] p-3 rounded-2xl border border-slate-700/50">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Spent</p>
                   <p className="text-emerald-400 font-bold font-mono text-base">{formatCurrency(customer.totalSpent || 0)}</p>
                </div>
                <div className="bg-[#0f172a] p-3 rounded-2xl border border-slate-700/50">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Pending Dues</p>
                   <p className={`font-bold font-mono text-base ${(customer.dues || 0) > 0 ? "text-red-400" : "text-slate-400"}`}>{formatCurrency(customer.dues || 0)}</p>
                </div>
             </div>

             <div className="flex items-center gap-4 text-xs text-slate-400 mb-5 pl-1">
                <div className="flex items-center gap-1.5">
                   <ShoppingBag className="w-4 h-4 text-slate-500"/>
                   <span><strong className="text-white">{customer.visits || 0}</strong> Visits</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <Clock className="w-4 h-4 text-slate-500"/>
                   <span>Last: <strong className="text-white">{customer.lastVisit ? format(parseISO(customer.lastVisit), "MMM dd") : 'N/A'}</strong></span>
                </div>
             </div>

             <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-700/50">
                 <button 
                  onClick={() => setSelectedCustomer(customer)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs uppercase tracking-wider font-bold py-2.5 rounded-xl transition-colors shrink-0"
                 >
                    View Profile
                 </button>
                 <button 
                  disabled={(customer.dues || 0) <= 0}
                  onClick={() => {
                      const amount = prompt("Enter amount received for dues:");
                      if(amount && !isNaN(Number(amount))) {
                          updateCustomer(customer.id, { dues: Math.max(0, (customer.dues || 0) - Number(amount)) });
                      }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white text-xs uppercase tracking-wider font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-600/20 shrink-0"
                 >
                    Pay Dues
                 </button>
             </div>
          </motion.div>
        ))}
        {filteredCustomers.length === 0 && (
           <div className="col-span-full py-12 text-center bg-[#1e293b]/20 border border-slate-700 border-dashed rounded-3xl">
              <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">No customers found.</p>
           </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
           <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
             // Modal logic preserved
              <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
             >
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                  <h2 className="text-xs uppercase tracking-widest font-bold text-white">Add Customer</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full">&times;</button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                     <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors outline-none text-sm" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mobile No</label>
                     <input type="tel" maxLength={10} required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors outline-none text-sm" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Initial Dues (₹) - Optional</label>
                     <input type="number" value={formData.dues} onChange={e => setFormData({...formData, dues: Number(e.target.value)})} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors outline-none text-right font-mono text-sm" />
                   </div>
                   <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-800">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-xs uppercase tracking-wider font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                     <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Save</button>
                   </div>
                </form>
             </motion.div>
           </div>
        )}

        {selectedCustomer && (
           <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
             <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-3xl flex flex-col h-[85vh] shadow-2xl overflow-hidden"
             >
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50 shrink-0">
                   <div>
                      <h2 className="text-xl font-bold text-white mb-1">{selectedCustomer.name}</h2>
                      <p className="text-emerald-400 font-mono text-sm">+91 {selectedCustomer.phone}</p>
                   </div>
                   <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full transition-colors">&times;</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                       <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Spent</p>
                          <p className="text-emerald-400 font-bold font-mono text-lg">{formatCurrency(selectedCustomer.totalSpent || 0)}</p>
                       </div>
                       <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Dues</p>
                          <p className={`font-bold font-mono text-lg ${(selectedCustomer.dues || 0) > 0 ? "text-red-400" : "text-emerald-400"}`}>{formatCurrency(selectedCustomer.dues || 0)}</p>
                       </div>
                       <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Visits</p>
                          <p className="text-white font-bold font-mono text-lg">{selectedCustomer.visits || 0}</p>
                       </div>
                       <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Last Visit</p>
                          <p className="text-white font-bold font-sans text-sm mt-1">{selectedCustomer.lastVisit ? format(parseISO(selectedCustomer.lastVisit), "MMM dd, yyyy") : 'Never'}</p>
                       </div>
                   </div>

                   <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Purchase History</h3>
                   <div className="space-y-3">
                      {customerSales.map(sale => (
                         <div key={sale.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-slate-700 transition-colors">
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                  <span className="bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-blue-500/20">{sale.billNo}</span>
                                  <span className="text-slate-400 text-xs">{format(parseISO(sale.date), "dd MMM yyyy, hh:mm a")}</span>
                               </div>
                               <p className="text-xs text-slate-500 truncate max-w-sm">
                                  {sale.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                               </p>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                               <p className="text-emerald-400 font-bold font-mono">{formatCurrency(sale.finalAmount)}</p>
                            </div>
                         </div>
                      ))}
                      {customerSales.length === 0 && (
                         <div className="text-center py-8 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
                            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2"/>
                            <p className="text-slate-500 text-xs">No past purchases.</p>
                         </div>
                      )}
                   </div>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

