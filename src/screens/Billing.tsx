import React, { useState, useMemo } from "react";
import { useData } from "../contexts/DataContext";
import { Item, SaleItem, Sale, Customer } from "../types";
import { formatCurrency } from "../lib/utils";
import { Search, Plus, Minus, Trash2, CheckCircle2, MessageCircle, User as UserIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const BillingScreen = () => {
  const { items, customers, addSale } = useData();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  
  // Smart Customer Selection
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerDetails, setNewCustomerDetails] = useState({ name: "", phone: "" });

  const [discount, setDiscount] = useState(0);
  const [gstPercent, setGstPercent] = useState(0);
  const [isCheckout, setIsCheckout] = useState(false);
  const [lastBillNo, setLastBillNo] = useState("");

  const filteredItems = useMemo(() => {
    if (!search) return [];
    
    const flatItems: any[] = [];
    items.forEach(item => {
      if (item.name.toLowerCase().includes(search.toLowerCase())) {
        if (item.quantityVariants && item.quantityVariants.length > 0) {
          item.quantityVariants.forEach(v => {
            if (v.stock > 0) {
              flatItems.push({
                ...item,
                isVariant: true,
                variantSize: v.size,
                sellingPrice: v.sellingPrice || item.sellingPrice,
                stock: v.stock
              });
            }
          });
        } else {
          if (item.stock > 0) {
            flatItems.push(item);
          }
        }
      }
    });

    return flatItems.slice(0, 15);
  }, [search, items]);

  const matchedCustomers = useMemo(() => {
    if (!customerSearch || selectedCustomer) return [];
    return customers.filter(
      (c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)
    ).slice(0, 4);
  }, [customerSearch, customers, selectedCustomer]);

  const addToCart = (item: any) => {
    const cartItemId = item.isVariant ? `${item.id}-${item.variantSize}` : item.id;
    const existing = cart.find((i) => i.itemId === cartItemId);
    if (existing) {
      if (existing.qty < item.stock) {
        updateQty(cartItemId, existing.qty + 1);
      }
    } else {
      let displayName = item.name;
      if (item.category === "Paint" && item.color) {
        displayName = `${displayName} (${item.color})`;
      }
      if (item.isVariant && item.variantSize) {
        displayName = `${displayName} - ${item.variantSize}`;
      }
      setCart([{ itemId: cartItemId, baseItemId: item.id, name: displayName, qty: 1, price: item.sellingPrice, total: item.sellingPrice, color: item.color, size: item.variantSize }, ...cart]);
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
    
    let cName = "Walk-in Customer";
    let cId = undefined;

    if (selectedCustomer) {
      cName = selectedCustomer.name;
      cId = selectedCustomer.id;
    } else if (isNewCustomer && newCustomerDetails.name) {
      cName = newCustomerDetails.name;
      // We are not adding it to customers list automatically to keep flow simple,
      // but we will save the name on the bill.
    }

    const sale: Omit<Sale, "id"> = {
      billNo,
      date: new Date().toISOString(),
      total: totals.subtotal,
      discount,
      gst: totals.gstAmount,
      finalAmount: totals.finalAmount,
      items: cart,
      customerName: cName,
      ...(cId ? { customerId: cId } : {})
    };

    await addSale(sale);
    setLastBillNo(billNo);
    setIsCheckout(true);
  };

  const shareWhatsApp = () => {
    let msg = `*🛍️ INVOICE*\n`;
    msg += `*Harshvardhan Traders*\n`;
    msg += `_Rajkumar Sitaram Kishan Inter College, Katra Road, Balpur, Gonda - 271125_\n`;
    msg += `*Mob:* 9455136226\n\n`;
    msg += `*Bill No:* ${lastBillNo}\n`;
    msg += `*Date:* ${new Date().toLocaleDateString()}\n`;
    msg += `*Customer:* ${selectedCustomer ? selectedCustomer.name : (newCustomerDetails.name || 'Walk-in')}\n\n`;
    msg += `*Items:*\n`;
    cart.forEach((c, index) => {
      msg += `▪ ${c.name}\n   ${c.qty} x ${c.price} = ₹${c.total.toFixed(2)}\n`;
    });
    msg += `\n------------------------\n`;
    msg += `*Subtotal:* ₹${totals.subtotal.toFixed(2)}\n`;
    if (discount > 0) msg += `*Discount:* -₹${discount.toFixed(2)}\n`;
    if (gstPercent > 0) msg += `*GST (${gstPercent}%):* +₹${totals.gstAmount.toFixed(2)}\n`;
    msg += `------------------------\n`;
    msg += `*Total Amount: ₹${totals.finalAmount.toFixed(2)}*\n`;
    msg += `------------------------\n\n`;
    msg += `_Thank you for shopping with us!_`;

    const encoded = encodeURIComponent(msg);
    let url = `https://wa.me/?text=${encoded}`;
    
    const phoneToUse = selectedCustomer ? selectedCustomer.phone : newCustomerDetails.phone;
    if (phoneToUse && phoneToUse.length === 10) {
       url = `https://wa.me/91${phoneToUse}?text=${encoded}`;
    }
    window.open(url, '_blank');
    
    resetBill();
  };

  const resetBill = () => {
     setCart([]);
     setCustomerSearch("");
     setSelectedCustomer(null);
     setIsNewCustomer(false);
     setNewCustomerDetails({name: "", phone: ""});
     setDiscount(0);
     setGstPercent(0);
     setIsCheckout(false);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 relative">
      <div className="flex-1 flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Point of Sale</h2>
            <p className="text-sm text-slate-400">Fast billing & checkout</p>
          </div>
        </div>

        {/* Customer Selection Card */}
        <div className="bg-[#1e293b]/40 border border-slate-700/50 p-5 rounded-3xl relative shrink-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5"/> Customer Details</label>
             {!selectedCustomer && (
                 <button onClick={() => setIsNewCustomer(!isNewCustomer)} className="text-[10px] text-blue-400 uppercase font-bold tracking-widest hover:text-blue-300">
                     {isNewCustomer ? "Search Existing" : "+ Quick New"}
                 </button>
             )}
          </div>
          
          {selectedCustomer ? (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex justify-between items-center">
               <div>
                  <h3 className="text-white font-bold text-sm">{selectedCustomer.name}</h3>
                  <p className="text-slate-400 text-xs font-mono mt-0.5">+91 {selectedCustomer.phone}</p>
               </div>
               <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
               </button>
            </div>
          ) : isNewCustomer ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <input value={newCustomerDetails.name} onChange={e=>setNewCustomerDetails({...newCustomerDetails, name:e.target.value})} placeholder="Walk-in Customer Name (Optional)" className="w-full bg-[#0f172a] border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors" />
               <input type="tel" maxLength={10} value={newCustomerDetails.phone} onChange={e=>setNewCustomerDetails({...newCustomerDetails, phone:e.target.value.replace(/[^0-9]/g, '')})} placeholder="Mobile Number (Optional)" className="w-full bg-[#0f172a] border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors" />
            </div>
          ) : (
            <div className="relative">
              <input
                 type="text"
                 placeholder="Search customer by name or phone..."
                 value={customerSearch}
                 onChange={(e) => setCustomerSearch(e.target.value)}
                 className="w-full bg-[#0f172a] border border-slate-700 pl-4 pr-10 py-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-colors"
               />
               {matchedCustomers.length > 0 && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden">
                    {matchedCustomers.map(c => (
                       <button
                         key={c.id}
                         onClick={() => { setSelectedCustomer(c); setCustomerSearch(""); }}
                         className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 flex justify-between items-center transition-colors"
                       >
                         <div>
                            <p className="text-white text-sm font-semibold">{c.name}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">+91 {c.phone}</p>
                         </div>
                       </button>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Item Search Card */}
        <div className="bg-[#1e293b]/40 border border-slate-700/50 p-5 rounded-3xl relative shrink-0 shadow-lg z-20">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Scan or Search Products</label>
          <div className="relative border border-slate-700 focus-within:border-blue-500 rounded-2xl bg-[#0f172a] shadow-inner transition-colors flex items-center">
             <Search className="text-blue-500 w-5 h-5 ml-4 shrink-0" />
             <input
               autoFocus
               type="text"
               placeholder="Type item name..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-transparent pl-3 pr-4 py-4 text-base text-white outline-none placeholder:text-slate-500"
             />
          </div>

          <AnimatePresence>
            {search && filteredItems.length > 0 && (
              <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                  {filteredItems.map(item => {
                    const uniqueKey = item.isVariant ? `${item.id}-${item.variantSize}` : item.id;
                    return (
                    <button
                      key={uniqueKey}
                      onClick={() => addToCart(item)}
                      className="w-full text-left p-4 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 flex justify-between items-center transition-all group"
                    >
                      <div>
                        <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                          {item.name}
                          {item.category === "Paint" && item.color && (
                             <span className="ml-1.5 text-slate-400 font-normal">({item.color})</span>
                          )}
                          {item.isVariant && (
                             <span className="ml-1.5 text-blue-400 font-bold">- {item.variantSize}</span>
                          )}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider border border-slate-700">{item.category}</span>
                          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider border border-slate-700">Stock: {item.stock}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-emerald-400 font-bold font-mono text-lg">{formatCurrency(item.sellingPrice)}</p>
                         <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Per {item.isVariant ? item.variantSize : item.unit}</p>
                      </div>
                    </button>
                    )
                  })}
              </motion.div>
            )}
            {search && filteredItems.length === 0 && (
                <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 text-center">
                    <p className="text-slate-400 text-sm">No items found matching "{search}"</p>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT: POS REGISTER */}
      <div className="w-full xl:w-[420px] flex flex-col shrink-0">
        <div className="bg-[#0f172a] border border-slate-700 rounded-3xl flex flex-col h-[650px] xl:h-[calc(100vh-140px)] sticky top-24 overflow-hidden shadow-2xl">
           <div className="p-5 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
              <h3 className="text-sm uppercase tracking-widest font-bold text-white">Current Order</h3>
              <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 uppercase font-bold tracking-widest rounded border border-blue-500/30">{cart.length} Items</span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <AnimatePresence>
                {cart.length === 0 ? (
                   <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                      <ShoppingBagIcon />
                      <p className="text-xs uppercase tracking-widest font-bold mt-4">Cart is empty</p>
                      <p className="text-[10px] text-slate-600 mt-1">Search and add products</p>
                   </motion.div>
                ) : (
                   cart.map(item => (
                      <motion.div layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} key={item.itemId} className="bg-slate-800 border border-slate-700 p-3 rounded-2xl flex flex-col gap-3 group relative">
                         <div className="flex justify-between items-start pr-6">
                            <p className="text-sm font-bold text-white leading-tight">{item.name}</p>
                            <p className="text-emerald-400 font-bold font-mono shrink-0">{formatCurrency(item.total)}</p>
                         </div>
                         <div className="flex items-center justify-between">
                            <p className="text-xs font-mono text-slate-400">{formatCurrency(item.price)} each</p>
                            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700 p-0.5">
                               <button onClick={() => updateQty(item.itemId, item.qty - 1)} className="w-8 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><Minus className="w-4 h-4"/></button>
                               <span className="text-sm text-white font-bold font-mono w-8 text-center">{item.qty}</span>
                               <button onClick={() => updateQty(item.itemId, item.qty + 1)} className="w-8 h-7 flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors"><Plus className="w-4 h-4"/></button>
                            </div>
                         </div>
                         <button onClick={() => removeFromCart(item.itemId)} className="absolute top-2.5 right-2.5 text-slate-500 hover:text-red-400 p-1"><X className="w-4 h-4"/></button>
                      </motion.div>
                   ))
                )}
              </AnimatePresence>
           </div>

           <div className="p-5 bg-slate-900 border-t border-slate-800 shrink-0">
              <div className="grid grid-cols-2 gap-3 mb-4">
                 <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Discount (₹)</label>
                    <input type="number" min="0" value={discount} onChange={e=>setDiscount(Number(e.target.value))} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none font-mono transition-colors" />
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">GST (%)</label>
                    <select value={gstPercent} onChange={e=>setGstPercent(Number(e.target.value))} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none font-mono transition-colors appearance-none">
                       <option value={0}>No GST</option>
                       <option value={5}>5%</option>
                       <option value={12}>12%</option>
                       <option value={18}>18%</option>
                       <option value={28}>28%</option>
                    </select>
                 </div>
              </div>
              
              <div className="space-y-1.5 mb-4 px-1">
                 <div className="flex justify-between text-xs font-mono text-slate-400"><p className="font-sans uppercase tracking-widest font-bold">Subtotal</p><p>{formatCurrency(totals.subtotal)}</p></div>
                 {discount > 0 && <div className="flex justify-between text-xs font-mono text-orange-400"><p className="font-sans uppercase tracking-widest font-bold">Discount</p><p>-{formatCurrency(discount)}</p></div>}
                 {totals.gstAmount > 0 && <div className="flex justify-between text-xs font-mono text-slate-400"><p className="font-sans uppercase tracking-widest font-bold">GST ({gstPercent}%)</p><p>+{formatCurrency(totals.gstAmount)}</p></div>}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-900/20 border border-blue-500/20 p-4 rounded-2xl mb-4">
                 <p className="text-blue-400 uppercase text-[10px] font-bold tracking-widest mb-1 sm:mb-0">Total Amount</p>
                 <p className="text-3xl font-bold text-white font-mono tracking-tight">{formatCurrency(totals.finalAmount)}</p>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] flex justify-center items-center gap-2 uppercase tracking-wider text-sm"
              >
                Checkout & Save Bill <ArrowRightIcon className="w-4 h-4"/>
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
         {isCheckout && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
               <motion.div initial={{scale:0.9, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                     <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Bill Saved!</h2>
                  <p className="text-slate-400 text-sm mb-6">Bill {lastBillNo} amount {formatCurrency(totals.finalAmount)} has been saved.</p>
                  
                  <div className="w-full space-y-3">
                     <button onClick={shareWhatsApp} className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20">
                        <MessageCircle className="w-5 h-5"/> Send via WhatsApp
                     </button>
                     <button onClick={resetBill} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all text-sm">
                        Start New Bill
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

const ShoppingBagIcon = () => (
   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const ArrowRightIcon = ({className}:{className?:string}) => (
   <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
