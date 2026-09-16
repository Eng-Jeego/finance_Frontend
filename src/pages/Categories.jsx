import React, { useState, useEffect } from 'react';
import { Plus, Tag, Edit2, Trash2, Lock, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import categoryService from '../services/categoryService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

const PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
];

const Categories = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [activeCategory, setActiveCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#3b82f6',
    icon: 'Tag',
  });

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  // Open Create
  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveCategory(null);
    setFormData({
      name: '',
      type: activeTab,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      icon: 'Tag',
    });
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (category) => {
    if (category.isDefault || !category.userId) {
      showToast('System default categories cannot be modified', 'warning');
      return;
    }
    setModalMode('edit');
    setActiveCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#3b82f6',
      icon: category.icon || 'Tag',
    });
    setIsModalOpen(true);
  };

  // Submit Category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    setFormLoading(true);
    try {
      if (modalMode === 'create') {
        await categoryService.createCategory(formData);
        showToast('Custom category created successfully', 'success');
      } else {
        await categoryService.updateCategory(activeCategory._id, formData);
        showToast('Category updated successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Error saving category', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    try {
      await categoryService.deleteCategory(categoryToDelete._id);
      showToast('Category deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    } finally {
      setDeleteLoading(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Category Settings</h2>
          <p className="text-sm text-slate-500 mt-1">
            Organize transactions with system presets and custom color-coded categories.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          New Category
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('expense')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'expense'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Expense Categories ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'income'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Income Categories ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Category List Cards */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner message="Loading category records..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const isSystem = cat.isDefault || !cat.userId;
            return (
              <Card key={cat._id} bodyClassName="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full inline-block shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{cat.name}</h4>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {isSystem ? 'System Default' : 'Custom Category'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isSystem ? (
                      <span title="System default (locked)" className="p-1 text-slate-300">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setCategoryToDelete(cat);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Custom Category' : 'Edit Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Subscriptions, Pet Care, Freelance"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Color Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {PALETTE.map((hex) => (
                <button
                  type="button"
                  key={hex}
                  onClick={() => setFormData({ ...formData, color: hex })}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                  style={{ backgroundColor: hex }}
                >
                  {formData.color === hex && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={formLoading}>
              {modalMode === 'create' ? 'Save Category' : 'Update Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Custom Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? Transactions assigned to this category will keep their records.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Categories;
