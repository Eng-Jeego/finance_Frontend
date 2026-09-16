import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { formatDate, formatMoney, categoryName } from '../utils/format';
import { Button } from './Button';
import { EmptyState } from './Feedback';

export function TransactionTable({
  rows,
  currency,
  type,
  onView,
  onDelete,
  emptyTitle,
  emptyDescription,
  emptyAction,
}) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row._id} className="text-slate-700">
                <td className="px-5 py-3">{formatDate(row.date)}</td>
                <td className="px-5 py-3">{categoryName(row)}</td>
                <td className="px-5 py-3">{row.description || row.source || '—'}</td>
                <td className="px-5 py-3 font-medium">{formatMoney(row.amount, currency)}</td>
                <td className="px-5 py-3 capitalize">{type}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(row)} aria-label="View">
                      <Eye size={16} />
                    </Button>
                    <Link
                      to={`/${type === 'income' ? 'income' : 'expenses'}/${row._id}/edit`}
                      className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(row)} aria-label="Delete">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {rows.map((row) => (
          <article key={row._id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{row.description || row.source || categoryName(row)}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(row.date)} · {categoryName(row)}
                </p>
              </div>
              <p className="font-semibold">{formatMoney(row.amount, currency)}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => onView(row)}>
                View
              </Button>
              <Link
                to={`/${type === 'income' ? 'income' : 'expenses'}/${row._id}/edit`}
                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
              >
                Edit
              </Link>
              <Button variant="danger" size="sm" onClick={() => onDelete(row)}>
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
