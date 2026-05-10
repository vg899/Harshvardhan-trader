import React, { useState, useMemo } from "react";
import { useData } from "../contexts/DataContext";
import { Item, SaleItem, Sale } from "../types";
import { formatCurrency } from "../lib/utils";
import { Search, Plus, Minus, Trash2, CheckCircle2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export const BillingScreen = () => {
  const { items, addSale } = useData();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [discount, setDiscount] = useState(0);
  const [gstPercent, setGstPercent] = useState(0);
  const [isCheckout, setIsCheckout] = useState(false);
  const [lastBillNo, setLastBillNo] = useState("");

  const filteredItems = useMemo(() => {
    if (!search) return [];
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) && item.stock > 0
    ).slice(0, 5);
  }, [search, items]);

  const addToCart = (item: Item) => {
    const existing = cart.find((i) => i.itemId === item.id);
    if (existing) {
      if (existing.qty < item.stock) {
        updateQty(item.id, existing.qty + 1);
      }
    } else {
      setCart([...cart, { itemId: item.id, name: item.name, qty: 1, price: item.sellingPrice, total: item.sellingPrice }]);
    }
    setSearch("");
  };

  const updateQty = (id: string, delta: number) => {
    setCart(
      cart.map((c) => {
        if (c.itemId === id) {
           const newQty = Math.max(1, delta);
           return { ...c, qty: newQty, total: newQty * c.price };
        }
        return c;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((c) => c.itemId !== id));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const afterDiscount = subtotal - discount;
    const gstAmount = (afterDiscount * gstPercent) / 100;
    const finalAmount = Math.max(0, afterDiscount + gstAmount);
    return { subtotal, gstAmount, finalAmount };
  }, [cart, discount, gstPercent]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const billNo = "BILL-" + Date.now().toString().slice(-6);
    const sale: Omit<Sale, "id"> = {
      billNo,
      date: new Date().toISOString(),
      total: totals.subtotal,
      discount,
      gst: totals.gstAmount,
      finalAmount: totals.finalAmount,
      items: cart,
      customerName: customerName || "Walk-in Customer",
    };

    await addSale(sale);
    setLastBillNo(billNo);
    setIsCheckout(true);
  };

  const shareWhatsApp = () => {
    let msg = `*Harshvardhan Traders*\n`;
    msg += `*Rajkumar Sitaram Kishan Inter College, Katra Road, Balpur, Gonda - 271125*\n`;
    msg += `*Mob:* 9455136226\n\n`;
    msg += `*Bill No:* ${lastBillNo}\n`;
    msg += `*Date:* ${new Date().toLocaleDateString()}\n`;
    msg += `*Customer:* ${customerName || 'Walk-in Customer'}\n\n`;
    msg += `*Items:*\n`;
    cart.forEach((c, index) => {
      msg += `${index + 1}. ${c.name} x ${c.qty} = ₹${c.total.toFixed(2)}\n`;
    });
    msg += `\n------------------\n`;
    msg += `*Subtotal:* ₹${totals.subtotal.toFixed(2)}\n`;
    if (discount > 0) msg += `*Discount:* ₹${discount.toFixed(2)}\n`;
    if (gstPercent > 0) msg += `*GST (${gstPercent}%):* ₹${totals.gstAmount.toFixed(2)}\n`;
    msg += `*Total Amount:* ₹${totals.finalAmount.toFixed(2)}\n`;
    msg += `------------------\n\n`;
    msg += `_Thank you for visiting!_`;

    const encoded = encodeURIComponent(msg);
    let url = `https://wa.me/?text=${encoded}`;
    if (customerMobile) {
       url = `https://wa.me/91${customerMobile}?text=${encoded}`;
    }
    window.open(url, '_blank');
    
    // Reset after share
    resetBill();
  };

  const resetBill = () => {
     setCart([]);
     setCustomerName("");
     setCustomerMobile("");
     setDiscount(0);
     setGstPercent(0);
     setIsCheckout(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LEFT: POS SEARCH & FORM */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Point of Sale</h2>
            <p className="text-sm text-slate-400">Create new bill</p>
          </div>
        </div>

        <div className="bg-[#1e293b]/40 border border-slate-700/50 p-5 rounded-2xl relative">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search Products</label>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
             <input
               autoFocus
               type="text"
               placeholder="Start typing item name..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-[#0f172a] border border-slate-700 pl-10 pr-4 py-3 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition-colors"
             />
          </div>

          {search && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-20 max-h-60 overflow-y-auto overflow-hidden">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-slate-400 text-sm text-center">No matching items in stock.</div>
              ) : (
                filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-700/50 border-b border-slate-700 last:border-0 flex justify-between items-center transition-colors"
                  >
                    <div>
                      <p className="text-white text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{item.category} • <span className="font-mono">Stock: {item.stock}</span></p>
                    </div>
                    <p className="text-emerald-400 font-bold">{formatCurrency(item.sellingPrice)}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="bg-[#1e293b]/40 border border-slate-700/50 p-5 rounded-2xl space-y-4">
           <h3 className="text-sm uppercase tracking-wider font-bold text-slate-300">Customer Details <span className="text-slate-500 font-normal normal-case">(Optional)</span></h3>
           <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name</label>
                  <input value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mobile No (+91)</label>
                  <input type="tel" maxLength={10} value={customerMobile} onChange={e=>setCustomerMobile(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
               </div>
           </div>
        </div>
      </div>

      {/* RIGHT: CART & BILL SUMMARY */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="bg-[#1e293b]/40 border border-slate-700/50 rounded-2xl flex flex-col h-[500px] lg:h-[calc(100vh-140px)] sticky top-24 overflow-hidden shadow-2xl">
           <div className="p-4 border-b border-slate-700 bg-slate-800/30">
              <h3 className="text-sm uppercase tracking-wider font-bold text-slate-300">Current Bill</h3>
           </div>
           
           {/* Cart Items */}
           <div className="flex-1 overflow-y-auto p-2">
              {cart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                    <Search className="w-12 h-12 mb-2" />
                    <p className="text-xs uppercase tracking-widest font-bold">Cart is empty</p>
                 </div>
              ) : (
                 <div className="space-y-2">
                    {cart.map(item => (
                       <motion.div layout initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={item.itemId} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex items-center gap-3 group">
                          <div className="flex-1">
                             <p className="text-sm font-semibold text-white leading-tight mb-1 truncate">{item.name}</p>
                             <p className="text-xs font-mono text-slate-400">{formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-[#0f172a] rounded border border-slate-700 p-1">
                             <button onClick={() => updateQty(item.itemId, item.qty - 1)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors"><Minus className="w-3 h-3"/></button>
                             <span className="text-xs text-white font-mono w-4 text-center">{item.qty}</span>
                             <button onClick={() => updateQty(item.itemId, item.qty + 1)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors"><Plus className="w-3 h-3"/></button>
                          </div>
                          <div className="text-right w-20 flex flex-col items-end">
                             <p className="text-sm font-bold text-emerald-400 mb-1">{formatCurrency(item.total)}</p>
                             <button onClick={() => removeFromCart(item.itemId)} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/> Remove</button>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              )}
           </div>

           {/* Totals */}
           <div className="p-4 bg-slate-800/30 border-t border-slate-700 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Discount (₹)</label>
                    <input type="number" min="0" value={discount} onChange={e=>setDiscount(Number(e.target.value))} className="w-full bg-[#0f172a] border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none text-right font-mono" />
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">GST (%)</label>
                    <select value={gstPercent} onChange={e=>setGstPercent(Number(e.target.value))} className="w-full bg-[#0f172a] border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none font-mono">
                       <option value={0}>No GST</option>
                       <option value={5}>5%</option>
                       <option value={12}>12%</option>
                       <option value={18}>18%</option>
                       <option value={28}>28%</option>
                    </select>
                 </div>
              </div>
              <div className="pt-2 border-t border-slate-700/50">
                 <div className="flex justify-between text-xs font-mono text-slate-400 mb-1"><p className="font-sans uppercase font-bold">Subtotal</p><p>{formatCurrency(totals.subtotal)}</p></div>
                 {discount > 0 && <div className="flex justify-between text-xs font-mono text-orange-500 mb-1"><p className="font-sans uppercase font-bold">Discount</p><p>-{formatCurrency(discount)}</p></div>}
                 {totals.gstAmount > 0 && <div className="flex justify-between text-xs font-mono text-slate-400 mb-1"><p className="font-sans uppercase font-bold">GST ({gstPercent}%)</p><p>+{formatCurrency(totals.gstAmount)}</p></div>}
                 <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-700">
                    <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">Total Amount</p>
                    <p className="text-2xl font-bold text-emerald-400 tabular-nums tracking-tight">{formatCurrency(totals.finalAmount)}</p>
                 </div>
              </div>

              {isCheckout ? (
                 <div className="grid grid-cols-2 gap-2 mt-4">
                    <button onClick={resetBill} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-xs uppercase tracking-wider">
                       New Bill
                    </button>
                    <button onClick={shareWhatsApp} className="bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-[#25D366]/20">
                       <MessageCircle className="w-4 h-4"/> WhatsApp
                    </button>
                 </div>
              ) : (
                 <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm uppercase tracking-wider"
                 >
                   <CheckCircle2 className="w-5 h-5"/> Checkout
                 </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
