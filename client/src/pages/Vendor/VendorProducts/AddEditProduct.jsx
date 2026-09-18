import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Upload,
  ArrowLeft,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  Info,
  X,
  Loader2,
  QrCode,
  Wallet
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import './AddEditProduct.css';

const CATEGORIES = [
  { id: 'cameras', name: 'Cameras & Photography' },
  { id: 'electronics', name: 'Electronics & Gaming' },
  { id: 'vehicles', name: 'Vehicles & Superbikes' },
  { id: 'furniture', name: 'Furniture & Workspaces' },
  { id: 'event-party', name: 'Event & Sound Gear' },
  { id: 'tools', name: 'Tools & Construction' },
  { id: 'sports-outdoor', name: 'Outdoor & Camping' },
  { id: 'fashion', name: 'Designer Attire & Costumes' }
];

export default function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, uploadProductImageFile, vendorProfile } = useVendor();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const isEditMode = Boolean(id);
  const existingProduct = isEditMode ? products.find((p) => p.id === id) : null;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: 'cameras',
    category: 'Cameras & Photography',
    brand: '',
    pricePerDay: '',
    discountPrice: '',
    securityDeposit: '',
    stock: 1,
    minStockAlert: 1,
    status: 'Active',
    image: '',
    description: '',
    dimensions: '',
    weight: '',
    tags: ''
  });

  const sanitizeImageUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (trimmed.includes('unsplash.com/photos/')) {
      const parts = trimmed.split('/');
      const slug = parts[parts.length - 1].split('?')[0];
      const slugParts = slug.split('-');
      const id = slugParts[slugParts.length - 1];
      if (id && id.length >= 6) {
        return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
      }
      return 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80';
    }
    return trimmed;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local object URL preview for immediate feedback
    const localPreviewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: localPreviewUrl }));

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadProductImageFile(file);
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      }
    } catch (err) {
      console.error('[AddEditProduct] File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isEditMode && existingProduct) {
      setFormData({
        name: existingProduct.name || '',
        sku: existingProduct.sku || '',
        category: existingProduct.category || CATEGORIES[0],
        brand: existingProduct.brand || '',
        pricePerDay: existingProduct.pricePerDay || '',
        discountPrice: existingProduct.discountPrice || '',
        securityDeposit: existingProduct.securityDeposit || '',
        stock: existingProduct.stock || 1,
        minStockAlert: existingProduct.minStockAlert || 1,
        status: existingProduct.status || 'Active',
        image: existingProduct.image || '',
        description: existingProduct.description || '',
        dimensions: existingProduct.dimensions || '',
        weight: existingProduct.weight || '',
        tags: Array.isArray(existingProduct.tags) ? existingProduct.tags.join(', ') : ''
      });
    }
  }, [isEditMode, existingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const catObj = CATEGORIES.find((c) => c.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      categoryId: selectedId,
      category: catObj ? catObj.name : selectedId
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const productPayload = {
      ...formData,
      categoryId: formData.categoryId || 'cameras',
      pricePerDay: Number(formData.pricePerDay),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      securityDeposit: Number(formData.securityDeposit) || 0,
      stock: Number(formData.stock),
      availableStock: Number(formData.stock),
      reservedStock: 0,
      minStockAlert: Number(formData.minStockAlert),
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    };

    if (isEditMode) {
      updateProduct(id, productPayload);
    } else {
      addProduct(productPayload);
    }

    navigate('/vendor/products');
  };

  return (
    <div className="add-edit-product-page">
      {/* Top Header */}
      <div className="page-header-row">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/vendor/products')}
            className="btn-back-link"
            title="Back to Products"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-main-heading">
              {isEditMode ? `Edit Equipment: ${formData.name || 'Item'}` : 'Add New Equipment Listing'}
            </h1>
            <p className="page-sub-heading">
              {isEditMode
                ? 'Update specifications, rental pricing, and warehouse stock units.'
                : 'Publish high-demand gear to Rentora’s multi-vendor rental marketplace.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Form */}
      <form onSubmit={handleSubmit} className="product-form-layout">
        {/* Left Column: Core Specs */}
        <div className="form-col-left">
          {/* Basic Details Box */}
          <div className="v-form-card">
            <h3 className="v-form-card-title">General Information</h3>

            <div className="v-form-field">
              <label className="v-form-lbl">Equipment / Product Title *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sony Alpha FX3 Cinema Camera Full-Frame Kit"
                required
                className="v-form-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="v-form-field">
                <label className="v-form-lbl">SKU / Item Code *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. PX-CAM-FX3-01"
                  required
                  className="v-form-input"
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Manufacturer / Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Sony, DJI, Apple"
                  required
                  className="v-form-input"
                />
              </div>
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Rental Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                className="v-form-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Product Description & Included Kit Items</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe key specs, included accessories (batteries, charger, cables), and ideal use-cases..."
                className="v-form-textarea"
              />
            </div>
          </div>

          {/* Pricing & Deposit Box */}
          <div className="v-form-card mt-5">
            <h3 className="v-form-card-title">Rental Pricing & Escrow Deposit</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="v-form-field">
                <label className="v-form-lbl">Daily Rental Rate (₹) *</label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  placeholder="1899"
                  required
                  className="v-form-input"
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Discounted Rate (₹)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="1699 (optional)"
                  className="v-form-input"
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Security Deposit (₹) *</label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  placeholder="3000"
                  required
                  className="v-form-input"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
              <Info size={12} className="text-secondary-blue" />
              <span>Deposits are held securely by Rentora Escrow until equipment return and inspection.</span>
            </p>

            {/* Vendor Payout & Escrow Info */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <QrCode size={16} />
                </div>
                <div>
                  <span className="font-bold text-[#1D3557] block text-[11px]">Payout & Settlement UPI ID</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {vendorProfile?.upiId || (vendorProfile?.businessName ? `${vendorProfile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis` : 'vendor@okaxis')}
                  </span>
                </div>
              </div>

              <Link
                to="/vendor/settings"
                className="text-[11px] font-bold text-secondary-blue hover:underline"
              >
                Manage UPI / QR
              </Link>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="v-form-card mt-5">
            <h3 className="v-form-card-title">Physical Dimensions & Search Tags</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="v-form-field">
                <label className="v-form-lbl">Dimensions (L x W x H)</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g. 129.7 x 77.8 x 84.5 mm"
                  className="v-form-input"
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Weight</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 715 g"
                  className="v-form-input"
                />
              </div>
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Search Tags (Comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="cinema, 4k, video, fullframe, sony"
                className="v-form-input"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Imagery & Stock Controls */}
        <div className="form-col-right">
          {/* Image Upload Preview Box */}
          <div className="v-form-card">
            <h3 className="v-form-card-title">Product Image Showcase</h3>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <div className="image-preview-box relative">
              {formData.image ? (
                <div className="relative w-full h-full min-h-[180px] rounded-2xl overflow-hidden bg-slate-900/5">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover max-h-56 rounded-2xl"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-all shadow-md"
                    title="Remove image"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="img-placeholder cursor-pointer border-2 border-dashed border-slate-300 hover:border-[#E63946] p-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-slate-50 hover:bg-red-50/30 min-h-[180px]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={32} className="text-[#E63946] animate-spin" />
                      <span className="text-xs font-semibold text-slate-500">Uploading image to server...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-red-100 text-[#E63946] flex items-center justify-center">
                        <Upload size={22} />
                      </div>
                      <span className="text-xs font-bold text-[#1D3557]">Click to upload image file from PC</span>
                      <span className="text-[10px] text-slate-400">Select any JPG, PNG, WebP image from your computer</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1D3557] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload size={14} className="text-[#E63946]" />
                <span>{formData.image ? 'Choose Another Image File' : 'Browse Local Image File'}</span>
              </button>
            </div>

            <div className="v-form-field mt-3">
              <label className="v-form-lbl">Or paste Image URL (Unsplash or CDN)</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={(e) => {
                  const sanitized = sanitizeImageUrl(e.target.value);
                  setFormData((prev) => ({ ...prev, image: sanitized }));
                }}
                onBlur={(e) => {
                  const sanitized = sanitizeImageUrl(e.target.value);
                  setFormData((prev) => ({ ...prev, image: sanitized }));
                }}
                placeholder="https://images.unsplash.com/..."
                className="v-form-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Inventory & Status Box */}
          <div className="v-form-card mt-5">
            <h3 className="v-form-card-title">Inventory & Listing Status</h3>

            <div className="v-form-field">
              <label className="v-form-lbl">Total Physical Units in Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="1"
                required
                className="v-form-input"
              />
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Low Stock Alert Threshold</label>
              <input
                type="number"
                name="minStockAlert"
                value={formData.minStockAlert}
                onChange={handleChange}
                min="1"
                className="v-form-input"
              />
            </div>

            <div className="v-form-field mt-4">
              <label className="v-form-lbl">Catalog Listing Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="v-form-select"
              >
                <option value="Active">Active (Visible & Bookable)</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="v-form-actions-box mt-5">
            <button type="submit" className="btn-v-primary w-full justify-center">
              <Save size={16} />
              <span>{isEditMode ? 'Save & Update Listing' : 'Publish Product Listing'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              className="btn-v-secondary w-full justify-center mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
