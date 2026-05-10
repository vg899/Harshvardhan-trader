import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

export const ReportsScreen = () => {
  const { sales, items } = useData();

  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const daySales = sales.filter(s => s.date.startsWith(dateStr));
      const total = daySales.reduce((sum, s) => sum + s.finalAmount, 0);
      data.push({
        name: format(d, 'MMM dd'),
        sales: total
      });
    }
    return data;
  }, [sales]);

  const topItems = useMemo(() => {
    const itemQtyMap: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(si => {
        itemQtyMap[si.name] = (itemQtyMap[si.name] || 0) + si.qty;
      });
    });

    return Object.entries(itemQtyMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.finalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</h2>
           <p className="text-sm text-slate-400">Track your business performance</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-[#1e293b]/40 border border-slate-700/50 p-4 rounded-2xl flex flex-col">
          <div className="border-b border-slate-700 pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Sales (Last 7 Days)</h3>
          </div>
          <div className="h-64 mt-2 -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1e293b]/40 border border-slate-700/50 p-4 rounded-2xl flex flex-col">
          <div className="border-b border-slate-700 pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Top Selling Items</h3>
          </div>
          <div className="h-64 mt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                />
                <Bar dataKey="qty" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-[#1e293b]/40 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700 bg-slate-800/30">
           <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">All Invoices</h3>
        </div>
        <div className="flex flex-col p-3 space-y-3">
           {[...sales].sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime()).map(sale => (
              <div key={sale.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex flex-col shadow-md group">
                 <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-blue-500/20">{sale.billNo}</span>
                    <span className="text-[10px] text-slate-400">{format(parseISO(sale.date), "MMM dd, hh:mm a")}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white">{sale.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}</p>
                    </div>
                    <p className="text-emerald-400 font-bold font-mono text-sm">{formatCurrency(sale.finalAmount)}</p>
                 </div>
              </div>
           ))}
           {sales.length === 0 && (
              <div className="py-8 text-center bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
                 <p className="text-slate-500 text-sm">No invoices found.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
