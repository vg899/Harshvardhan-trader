import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { Item, ItemVariant } from "../types";
import { Search, Plus, Filter, Edit, Trash2 } from "lucide-react";
import { parseISO, format } from "date-fns";
import { formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const ItemsScreen = () => {
  const { items, addItem, updateItem, deleteItem, sales } = useData();
  const { userProfile } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [viewingHistoryFor, setViewingHistoryFor] = useState<Item | null>(null);

  const categories = ["All", "Electrical", "Plumbing", "Tools", "Fasteners", "Paint", "Other"];
  const units = ["Piece", "Meter", "Box", "Kg", "Litre"];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const [formData, setFormData] = useState({
    name: "", category: "Tools", unit: "Piece", purchasePrice: 0, sellingPrice: 0, stock: 0, color: "", quantityVariants: [] as ItemVariant[]
  });

  const openAdd = () => {
    setFormData({ name: "", category: "Tools", unit: "Piece", purchasePrice: 0, sellingPrice: 0, stock: 0, color: "", quantityVariants: [] });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Item) => {
    setFormData({ ...item, quantityVariants: item.quantityVariants || [] });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (dataToSave.category !== "Paint") {
      delete (dataToSave as any).color;
    }
    if (editingItem) {
      await updateItem(editingItem.id, dataToSave);
    } else {
      await addItem(dataToSave as any);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1e293b]/40 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/30">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Inventory Snapshot</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search hardware..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs w-full sm:w-64 focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
            {userProfile?.role === "Admin" && (
              <button
                onClick={openAdd}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors whitespace-nowrap shadow-lg shadow-blue-500/20"
              >
                + Add Item
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2 border-b border-slate-700/50 bg-[#1e293b]/20 flex gap-2 overflow-x-auto hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`whitespace-nowrap px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-colors ${
                categoryFilter === cat 
                  ? 'bg-blue-600 border border-blue-500 text-white' 
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Unit</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-xs">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="px-4 py-3 font-semibold text-white">
                    {item.name}
                    {item.category === "Paint" && item.color && (
                      <span className="ml-2 text-xs font-normal text-slate-400">({item.color})</span>
                    )}
                    {item.quantityVariants && item.quantityVariants.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.quantityVariants.map(v => (
                           <span key={v.size} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                             {v.size}: {v.stock}
                           </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 italic">{item.category}</td>
                  <td className="px-4 py-3 text-slate-300 text-center">{item.unit}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                    {item.quantityVariants && item.quantityVariants.length > 0 ? (
                       <span className="text-slate-400 font-normal text-[10px]">Variants</span>
                    ) : (
                       formatCurrency(item.sellingPrice)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-200">
                    {item.quantityVariants && item.quantityVariants.length > 0 ? (
                       item.quantityVariants.reduce((acc, v) => acc + v.stock, 0)
                    ) : (
                       item.stock
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {(item.quantityVariants && item.quantityVariants.length > 0 ? item.quantityVariants.reduce((acc, v) => acc + v.stock, 0) : item.stock) <= 0 ? (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] uppercase font-bold">Out of Stock</span>
                    ) : (item.quantityVariants && item.quantityVariants.length > 0 ? item.quantityVariants.reduce((acc, v) => acc + v.stock, 0) : item.stock) < 10 ? (
                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full text-[10px] uppercase font-bold">Low Stock</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] uppercase font-bold">In Stock</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {userProfile?.role === "Admin" ? (
                        <>
                          <button onClick={() => setViewingHistoryFor(item)} className="p-1 px-2 text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 rounded">History</button>
                          <button onClick={() => openEdit(item)} className="p-1 px-2 text-[10px] uppercase font-bold tracking-wider bg-slate-700 text-slate-300 hover:text-white rounded">Edit</button>
                          <button onClick={() => {if(confirm('Delete item?')) deleteItem(item.id)}} className="p-1 px-2 text-[10px] uppercase font-bold tracking-wider bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded">Del</button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No matching items found.</td>
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
              className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                 <h2 className="text-sm uppercase tracking-widest font-bold text-white">{editingItem ? "Edit Item" : "New Item"}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Item Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                     <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm">
                        {categories.filter(c => c!== "All").map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Unit</label>
                     <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value as any})} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm">
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                     </select>
                   </div>
                </div>
                {formData.category === "Paint" && (
                   <div>
                     <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Color / Shade Name</label>
                     <div className="flex gap-2">
                       <input type="text" required placeholder="e.g. Sky Blue, Royal Red" value={formData.color || ""} onChange={e => setFormData({...formData, color: e.target.value})} className="flex-1 bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm" />
                       <input type="color" value={formData.color && formData.color.startsWith('#') ? formData.color : "#ffffff"} onChange={e => setFormData({...formData, color: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer bg-[#0f172a] border border-slate-700 p-0.5" title="Pick Color"/>
                     </div>
                   </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Purchase (₹) [Base]</label>
                     <input type="number" required value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-right font-mono" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Selling (₹) [Base]</label>
                     <input type="number" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-right font-mono" />
                   </div>
                </div>
                 <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Initial Stock [Base]</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-right font-mono" />
                </div>

                {/* Variants Section */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantity Variants / Pack Sizes</label>
                    <button type="button" onClick={() => setFormData({...formData, quantityVariants: [...(formData.quantityVariants || []), { size: "", stock: 0, purchasePrice: 0, sellingPrice: 0 }]})} className="text-[10px] text-blue-400 uppercase font-bold tracking-widest hover:text-blue-300 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Variant
                    </button>
                  </div>
                  {(formData.quantityVariants || []).length > 0 ? (
                    <div className="space-y-2">
                      {formData.quantityVariants.map((variant, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-center gap-2 bg-[#0f172a] border border-slate-700 p-2 rounded-lg">
                          <input type="text" placeholder="Size (e.g. 500ml)" value={variant.size} onChange={e => {
                            const newVar = [...formData.quantityVariants];
                            newVar[index].size = e.target.value;
                            setFormData({...formData, quantityVariants: newVar});
                          }} className="flex-1 w-full sm:w-auto bg-transparent border-b sm:border-0 border-slate-700 pb-2 sm:pb-0 text-white text-xs outline-none" required />
                          <div className="flex w-full sm:w-auto gap-2">
                            <input type="number" placeholder="Purch" value={variant.purchasePrice ?? ''} onChange={e => {
                              const newVar = [...formData.quantityVariants];
                              newVar[index].purchasePrice = Number(e.target.value);
                              setFormData({...formData, quantityVariants: newVar});
                            }} className="w-16 sm:w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs outline-none text-right font-mono" required title="Purchase Price" />
                            <input type="number" placeholder="Sell" value={variant.sellingPrice ?? ''} onChange={e => {
                              const newVar = [...formData.quantityVariants];
                              newVar[index].sellingPrice = Number(e.target.value);
                              setFormData({...formData, quantityVariants: newVar});
                            }} className="w-16 sm:w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs outline-none text-right font-mono" required title="Selling Price" />
                            <input type="number" placeholder="Stock" value={variant.stock ?? ''} onChange={e => {
                              const newVar = [...formData.quantityVariants];
                              newVar[index].stock = Number(e.target.value);
                              setFormData({...formData, quantityVariants: newVar});
                            }} className="w-16 sm:w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs outline-none text-right font-mono" required title="Stock" />
                            <button type="button" onClick={() => {
                              const newVar = formData.quantityVariants.filter((_, i) => i !== index);
                              setFormData({...formData, quantityVariants: newVar});
                            }} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">Optional. Add if item has multiple sizes (e.g. 1L, 5L).</p>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                     SAVE ITEM
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        
        {viewingHistoryFor && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1e293b] border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 shrink-0">
                 <div>
                   <h2 className="text-sm uppercase tracking-widest font-bold text-white">Item History</h2>
                   <p className="text-xs text-slate-400 mt-1">{viewingHistoryFor.name} <span className="text-slate-500">• Current Stock: {viewingHistoryFor.stock}</span></p>
                 </div>
                 <button onClick={() => setViewingHistoryFor(null)} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f172a]/50 text-[10px] uppercase tracking-widest text-slate-400 sticky top-0 backdrop-blur-sm border-b border-slate-700">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Event</th>
                      <th className="px-5 py-3">Reference</th>
                      <th className="px-5 py-3 text-right">Qty Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {sales
                      .filter(s => s.items.some(i => (i.baseItemId || i.itemId) === viewingHistoryFor.id))
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(sale => {
                        const saleItem = sale.items.find(i => (i.baseItemId || i.itemId) === viewingHistoryFor.id);
                        return (
                          <tr key={sale.id} className="hover:bg-blue-500/5 transition-colors">
                            <td className="px-5 py-3 text-slate-300 font-mono">
                              {format(parseISO(sale.date), "MMM dd, yyyy • hh:mm a")}
                            </td>
                            <td className="px-5 py-3 text-orange-400 font-bold uppercase tracking-wider text-[10px]">
                              Sale
                            </td>
                            <td className="px-5 py-3 text-slate-400">
                              Bill #{sale.billNo} {sale.customerName ? `(${sale.customerName})` : ''}
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-red-400 font-mono">
                              -{saleItem?.qty}{saleItem?.size ? ` (${saleItem.size})` : ''}
                            </td>
                          </tr>
                        );
                    })}
                    {sales.filter(s => s.items.some(i => (i.baseItemId || i.itemId) === viewingHistoryFor.id)).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-500 italic">No sales history found. Note: Manual stock adjustments update the current stock directly.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
