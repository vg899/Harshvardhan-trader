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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</h2>
           <p className="text-sm text-slate-400">Track your business performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e293b]/40 border border-slate-700/50 p-4 rounded-2xl flex flex-col">
          <div className="border-b border-slate-700 pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Sales (Last 7 Days)</h3>
          </div>
          <div className="h-64 mt-2">
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
          <div className="h-64 mt-2">
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
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Bill No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-xs">
               {[...sales].sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime()).map(sale => (
                  <tr key={sale.id} className="hover:bg-blue-500/5 transition-colors group">
                     <td className="px-4 py-3 font-semibold text-slate-300 font-mono">{sale.billNo}</td>
                     <td className="px-4 py-3 text-slate-400">{format(parseISO(sale.date), "MMM dd, hh:mm a")}</td>
                     <td className="px-4 py-3 text-white">{sale.customerName}</td>
                     <td className="px-4 py-3 text-slate-400 font-mono">{sale.items.length}</td>
                     <td className="px-4 py-3 text-emerald-400 font-bold text-right">{formatCurrency(sale.finalAmount)}</td>
                  </tr>
               ))}
               {sales.length === 0 && (
                  <tr>
                     <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No invoices found.</td>
                  </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
