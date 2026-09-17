import React, { useState } from 'react';
import {
  LayoutGrid,
  Plus,
  Edit2,
  Trash2,
  Camera,
  Compass,
  Laptop,
  Car,
  PartyPopper,
  Flame,
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';
import { StatusBadge, ConfirmationModal } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function CategoryManager() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    iconName: 'Camera',
    subcategoriesStr: '',
    status: 'Active'
  });

  const iconMap = {
    Camera,
    Compass,
    Laptop,
    Car,
    PartyPopper,
    Flame,
    Sparkles,
    Layers
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      iconName: 'Camera',
      subcategoriesStr: '',
      status: 'Active'
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      iconName: cat.iconName || 'Camera',
      subcategoriesStr: (cat.subcategories || []).join(', '),
      status: cat.status
    });
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const subcategories = formData.subcategoriesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addCategory({
      name: formData.name,
      iconName: formData.iconName,
      subcategories,
      status: formData.status
    });

    setCreateModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCategory || !formData.name.trim()) return;

    const subcategories = formData.subcategoriesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateCategory(editingCategory.id, {
      name: formData.name,
      iconName: formData.iconName,
      subcategories,
      status: formData.status
    });

    setEditingCategory(null);
  };

  const handleDelete = (cat) => {
    requestConfirmation({
      title: `Delete Category: ${cat.name}?`,
      message: `Are you sure you want to delete "${cat.name}"? Products under this category should be migrated first.`,
      confirmText: 'Delete Category',
      confirmColor: 'red',
      onConfirm: () => deleteCategory(cat.id)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Category & Catalog Structure</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize high-level gear categories, manage subcategory taxonomies, and control browse filters.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.iconName] || Camera;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold border border-slate-200/60">
                    <IconComponent size={22} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={cat.status} />
                  </div>
                </div>

                <h3 className="text-base font-bold font-['Sora'] text-slate-900">{cat.name}</h3>
                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">slug: /{cat.slug}</span>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Products</span>
                    <strong className="text-slate-800 font-['Sora'] text-sm">{cat.productCount} Items</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Rentals</span>
                    <strong className="text-emerald-700 font-['Sora'] text-sm">{cat.activeRentals} Active</strong>
                  </div>
                </div>

                {/* Subcategories Tags */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Subcategories:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories && cat.subcategories.map((sub, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/70 text-[11px] font-medium text-slate-700">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleCategoryStatus(cat.id)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {cat.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/60 transition-colors"
                    title="Edit Category & Subcategories"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Create / Edit Category Modal */}
      {(createModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-['Sora'] text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Rental Category'}
              </h3>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditingCategory(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingCategory ? handleSaveEdit : handleSaveCreate} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cinema Cameras & Optics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Icon Symbol</label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer"
                  >
                    <option value="Camera">Camera / Photo</option>
                    <option value="Compass">Compass / Drones</option>
                    <option value="Laptop">Laptop / Tech</option>
                    <option value="Car">Car / 4x4 Fleet</option>
                    <option value="PartyPopper">Party / DJ Sound</option>
                    <option value="Flame">Flame / Camping</option>
                    <option value="Sparkles">Sparkles / Bridal</option>
                    <option value="Layers">Layers / Tools</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Subcategories (Comma Separated)</label>
                <textarea
                  rows={3}
                  placeholder="Cinema Primes, Zoom Lenses, Wireless Mics, Gimbals..."
                  value={formData.subcategoriesStr}
                  onChange={(e) => setFormData({ ...formData, subcategoriesStr: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
