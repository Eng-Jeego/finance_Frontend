import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { expenseApi, categoryApi } from '../services/financeApi';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { PAYMENT_METHODS } from '../constants';
import { formatDate, formatMoney, categoryName } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Input, Select } from '../components/ui/FormField';
import { Spinner } from '../components/ui/Feedback';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { TransactionTable } from '../components/ui/TransactionTable';

export default function ExpenseListPage() {
  const { currentUser } = useAuth();
  const { notify } = useToast();
  const currency = currentUser?.currency || 'USD';
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
  });
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const search = useDebounce(filters.search);

  const query = useMemo(
    () => ({
      page: filters.page,
      limit: 10,
      search: search || undefined,
      categoryId: filters.categoryId || undefined,
      paymentMethod: filters.paymentMethod || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      minAmount: filters.minAmount || undefined,
      maxAmount: filters.maxAmount || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [filters.page, filters.categoryId, filters.paymentMethod, filters.startDate, filters.endDate, filters.minAmount, filters.maxAmount, filters.sortBy, filters.sortOrder, search]
  );

  useEffect(() => {
    categoryApi.list({ type: 'expense' }).then(({ data }) => setCategories(data.data.categories || []));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await expenseApi.list(query);
        setRows(data.data || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1 });
      } catch (error) {
        notify(getErrorMessage(error, 'Unable to load expenses'), 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query, notify]);

  const confirmDelete = async () => {
    try {
      await expenseApi.remove(deleteItem._id);
      setRows((items) => items.filter((item) => item._id !== deleteItem._id));
      notify('Expense deleted');
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to delete expense'), 'error');
    } finally {
      setDeleteItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">Review spending with search, filters, and pagination.</p>
        </div>
        <Link to="/expenses/new">
          <Button>Add expense</Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          <Input id="search" label="Search" placeholder="Description" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))} />
          <Select id="categoryId" label="Category" value={filters.categoryId} onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value, page: 1 }))}>
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </Select>
          <Select id="paymentMethod" label="Payment method" value={filters.paymentMethod} onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value, page: 1 }))}>
            <option value="">All methods</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </Select>
          <Input id="startDate" type="date" label="From" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))} />
          <Input id="endDate" type="date" label="To" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))} />
          <Input id="minAmount" type="number" min="0" step="0.01" label="Min amount" value={filters.minAmount} onChange={(e) => setFilters((prev) => ({ ...prev, minAmount: e.target.value, page: 1 }))} />
          <Input id="maxAmount" type="number" min="0" step="0.01" label="Max amount" value={filters.maxAmount} onChange={(e) => setFilters((prev) => ({ ...prev, maxAmount: e.target.value, page: 1 }))} />
          <Select
            id="sort"
            label="Sort"
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split(':');
              setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
            }}
          >
            <option value="date:desc">Newest</option>
            <option value="date:asc">Oldest</option>
            <option value="amount:desc">Highest amount</option>
            <option value="amount:asc">Lowest amount</option>
          </Select>
        </div>
      </Card>

      <Card>
        <CardHeader title="Expense records" />
        {loading ? (
          <Spinner label="Loading transactions..." />
        ) : (
          <TransactionTable
            rows={rows}
            currency={currency}
            type="expense"
            onView={setViewItem}
            onDelete={setDeleteItem}
            emptyTitle="No expenses found for this period."
            emptyDescription="Add an expense to begin analyzing your spending."
            emptyAction={
              <Link to="/expenses/new">
                <Button>Add expense</Button>
              </Link>
            }
          />
        )}
        <Pagination page={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
      </Card>

      <Modal open={Boolean(viewItem)} title="Expense details" onClose={() => setViewItem(null)}>
        {viewItem ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt>Amount</dt><dd className="font-medium">{formatMoney(viewItem.amount, currency)}</dd></div>
            <div className="flex justify-between"><dt>Category</dt><dd>{categoryName(viewItem)}</dd></div>
            <div className="flex justify-between"><dt>Payment</dt><dd>{viewItem.paymentMethod}</dd></div>
            <div className="flex justify-between"><dt>Date</dt><dd>{formatDate(viewItem.date)}</dd></div>
            <div className="flex justify-between"><dt>Recurring</dt><dd>{viewItem.isRecurring ? viewItem.recurringFrequency : 'No'}</dd></div>
            <div><dt className="text-slate-500">Description</dt><dd>{viewItem.description || '—'}</dd></div>
          </dl>
        ) : null}
      </Modal>

      <Modal open={Boolean(deleteItem)} title="Delete expense?" onClose={() => setDeleteItem(null)}>
        <p className="text-sm text-slate-600">This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteItem(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
