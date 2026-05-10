import React, { useMemo } from "react";
import { useData } from "../contexts/DataContext";
import { motion } from "framer-motion";
import { formatCurrency } from "../lib/utils";
import { TrendingUp, Package, AlertTriangle, AlertOctagon, IndianRupee } from "lucide-react";
import { format, isToday, parseISO, startOfMonth } from "date-fns";

export const Dashboard = () => {
  const { items, sales } = useData();

  const stats = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    
    let totalSalesValue = 0;
    let todaySalesValue = 0;
    let totalProfit = 0;
    let lowStock = 0;
    let outOfStock = 0;

    sales.forEach(sale => {
      const saleDate = parseISO(sale.date);
      if (isToday(saleDate)) {
        todaySalesValue += sale.finalAmount;
      }
      if (saleDate >= monthStart) {
         totalSalesValue += sale.finalAmount;
         // approximate profit (sale - purchase)
         sale.items.forEach(si => {
            const itemDef = items.find(i => i.id === si.itemId);
            if (itemDef) {
               const cost = itemDef.purchasePrice * si.qty;
               totalProfit += (si.total - cost);
            }
         });
      }
    });

    items.forEach(item => {
      if (item.stock <= 0) outOfStock++;
      else if (item.stock < 5) lowStock++; // Assuming threshold is 5
    });

    return {
      todaySalesValue,
      totalSalesValue,
      totalProfit,
      lowStock,
      outOfStock,
      totalItems: items.length
    };
  }, [items, sales]);

  const cards = [
    { title: "Today's Sales", value: formatCurrency(stats.todaySalesValue), icon: IndianRupee, color: "bg-blue-500", text: "text-blue-500" },
    { title: "Monthly Sales", value: formatCurrency(stats.totalSalesValue), icon: TrendingUp, color: "bg-indigo-500", text: "text-indigo-500" },
    { title: "Est. Profit (M)", value: formatCurrency(stats.totalProfit), icon: TrendingUp, color: "bg-emerald-500", text: "text-emerald-500" },
    { title: "Total Items", value: stats.totalItems, icon: Package, color: "bg-blue-400", text: "text-blue-400" },
    { title: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "bg-orange-500", text: "text-orange-500" },
    { title: "Out of Stock", value: stats.outOfStock, icon: AlertOctagon, color: "bg-red-500", text: "text-red-500" },
  ];

  const recentSales = useMemo(() => {
    return [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">Overview</h2>
        <span className="text-xs font-semibold text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
           {format(new Date(), "MMM d, yyyy")}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-[#1e293b]/50 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden group ${card.text.includes('orange') ? 'bg-orange-500/10 border-orange-500/30' : card.text.includes('red') ? 'bg-red-500/10 border-red-500/30' : ''}`}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${card.color}`}></div>
            <p className={`text-[10px] uppercase tracking-widest font-bold ${card.text.includes('orange') ? 'text-orange-400' : card.text.includes('red') ? 'text-red-400' : 'text-slate-500'}`}>
              {card.title}
            </p>
            <h3 className={`text-2xl font-bold mt-1 tracking-tight ${card.text.includes('orange') || card.text.includes('red') || card.text.includes('emerald') ? card.text : 'text-white'}`}>
              {card.value}
            </h3>
            <div className="absolute right-4 top-4 opacity-20">
               <card.icon className={`w-6 h-6 ${card.text}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
         <div className="bg-[#1e293b]/40 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
               <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Recent Transactions</h2>
            </div>
            <div className="p-4">
               {recentSales.length === 0 ? (
                  <p className="text-slate-500 text-sm">No sales yet today.</p>
               ) : (
                  <div className="space-y-3">
                     {recentSales.map((sale) => (
                        <div key={sale.id} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0 hover:bg-white/5 transition-colors px-2 rounded">
                           <div>
                              <p className="text-sm font-semibold text-slate-200">{sale.billNo}</p>
                              <p className="text-xs text-slate-500">{format(parseISO(sale.date), "hh:mm a")} • {sale.customerName}</p>
                           </div>
                           <p className="text-sm font-bold text-emerald-400">{formatCurrency(sale.finalAmount)}</p>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
