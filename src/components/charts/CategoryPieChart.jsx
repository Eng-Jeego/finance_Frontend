import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: data.color }}
          />
          {data.name}
        </div>
        <p className="text-slate-600 dark:text-slate-300">
          Amount: <span className="font-semibold">{formatCurrency(data.amount, currency)}</span>
        </p>
        <p className="text-slate-500 dark:text-slate-400">
          Share: <span className="font-medium">{formatPercentage(data.percentage)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ data = [], currency = 'USD' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        No expense data recorded for this period
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#64748b'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
            formatter={(value) => (
              <span className="text-slate-700 dark:text-slate-300 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
