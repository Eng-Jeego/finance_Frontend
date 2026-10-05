import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-1.5">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 capitalize">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {formatCurrency(entry.value, currency)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const IncomeVsExpenseBarChart = ({ data = [], currency = 'USD' }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        No transaction history available yet
      </div>
    );
  }

  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: tickColor, fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: tickColor, fontSize: 11 }}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
            formatter={(value) => (
              <span className="text-slate-700 dark:text-slate-300 font-medium">{value}</span>
            )}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            name="Expenses"
            dataKey="expenses"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeVsExpenseBarChart;
