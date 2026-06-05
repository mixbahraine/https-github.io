import React, { useState } from 'react';
import { User, Product } from '../types';
import { 
  Plus, Tag, Truck, Edit3, Trash2, ArrowRight,
  ShieldCheck, HelpCircle, Sparkles, Image as ImageIcon
} from 'lucide-react';

interface VendorPanelProps {
  currentUser: User;
  vendorProducts: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'vendorId' | 'vendorName'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateDeliveryCost: (cost: number) => void;
}

export default function VendorPanel({
  currentUser,
  vendorProducts,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateDeliveryCost
}: VendorPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [pName, setPName] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState<string>('');
  const [pDiscount, setPDiscount] = useState<string>('');
  const [pCategory, setPCategory] = useState<'productive_families' | 'local_projects'>('productive_families');
  const [pImage, setPImage] = useState('');
  const [pDeliveryCost, setPDeliveryCost] = useState<string>((currentUser.deliveryCost || 1.5).toString());

  // Handle uploading simulation via fast URLs
  const defaultImages = [
    { name: 'مخبوزات/حلويات', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400' },
    { name: 'عطور/بخور', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400' },
    { name: 'سمن/أغذية بحرينية', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400' },
    { name: 'حياكة/ملابس', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400' }
  ];

  const handleUpdateDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(pDeliveryCost);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateDeliveryCost(parsed);
      alert('تم تحديث سعر التوصيل الموحد بنجاح! سيتم اعتماده لكافة سلات تسوق الزوار.');
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) return;

    onAddProduct({
      name: pName,
      description: pDescription,
      price: parseFloat(pPrice),
      image: pImage || defaultImages[0].url,
      discount: pDiscount ? parseFloat(pDiscount) : undefined,
      category: pCategory
    });

    // Reset Form
    setPName('');
    setPDescription('');
    setPPrice('');
    setPDiscount('');
    setPImage('');
    setShowAddForm(false);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    onEditProduct({
      ...editingProduct,
      name: pName,
      description: pDescription,
      price: parseFloat(pPrice),
      image: pImage || editingProduct.image,
      discount: pDiscount ? parseFloat(pDiscount) : undefined,
      category: pCategory
    });

    setEditingProduct(null);
    setPName('');
    setPDescription('');
    setPPrice('');
    setPDiscount('');
    setPImage('');
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPDescription(prod.description);
    setPPrice(prod.price.toString());
    setPDiscount(prod.discount ? prod.discount.toString() : '');
    setPCategory(prod.category);
    setPImage(prod.image);
    setShowAddForm(false);
  };

  return (
    <div id="vendor-panel-view" className="bg-white rounded-3xl border border-gray-150 shadow-xl overflow-hidden mt-6 animate-fade-in">
      {/* Vendor Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-40 h-40" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> لوحة التحكم المقيدة للبائع
              </span>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded font-bold">بائع مرقّى</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black mt-2">{currentUser.name}</h2>
            <p className="text-emerald-100 text-xs mt-1">تدار كافة منتجاتك وطلباتك حصرياً وبأقصى درجات الأمان والسرية.</p>
          </div>

          <button
            onClick={() => {
              setEditingProduct(null);
              setShowAddForm(!showAddForm);
            }}
            className="bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {showAddForm ? 'إلغاء الإضافة' : 'إضافة منتج بحريني جديد'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Flat delivery cost system - only configure ONCE */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-emerald-950 text-sm md:text-base flex items-center gap-1.5">
              <Truck className="w-5 h-5 text-emerald-600" /> سعر التوصيل الموحد لجميع منتجاتك
            </h4>
            <p className="text-xs text-emerald-700 font-medium">سعر توصيل ثابت وموحد يدفعه الزبائن في الفاتورة عن كامل متجرك مرة واحدة.</p>
          </div>

          <form onSubmit={handleUpdateDelivery} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-36">
              <input
                type="number"
                step="0.100"
                required
                value={pDeliveryCost}
                onChange={(e) => setPDeliveryCost(e.target.value)}
                className="w-full text-center px-3 py-2 border border-emerald-250 rounded-xl font-black text-emerald-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <span className="absolute left-2.5 top-2.5 text-[10px] text-emerald-500 font-bold">د.ب</span>
            </div>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              حفظ السعر
            </button>
          </form>
        </div>

        {/* ADD OR EDIT PRODUCT WORKSPACE */}
        {(showAddForm || editingProduct) && (
          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-800 text-sm md:text-base flex items-center gap-1.5">
                <Tag className="w-5 h-5 text-emerald-600" />
                {editingProduct ? `تعديل منتج: ${editingProduct.name}` : 'إضافة تفاصيل المنتج الجديد'}
              </h3>
              <button 
                onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                رجوع
              </button>
            </div>

            <form onSubmit={editingProduct ? handleEditProductSubmit : handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 font-extrabold block">اسم المنتج بالكامل:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حلوى بحرينية حمراء بالمكسرات وفستق"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full p-2.5 border border-gray-250 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 font-extrabold block">تصنيف المشروع:</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-250 rounded-xl text-xs bg-white font-bold"
                  >
                    <option value="productive_families">صناعة الأسر المنتجة البحرينية</option>
                    <option value="local_projects">مشاريع شبابية وورش محلية</option>
                  </select>
                </div>

                {/* Selling Price */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 font-extrabold block">سعر البيع بالدينار البحريني BHD:</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.050"
                      required
                      placeholder="مثال: 4.500"
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      className="w-full p-2.5 border border-gray-250 rounded-xl text-xs bg-white text-center font-bold"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">د.ب</span>
                  </div>
                </div>

                {/* Optional Discount */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 font-extrabold block">نسبة الخصم أو التخفيض (اختياري) %:</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="اترك فارغاً بدون خصم (مثال: 15)"
                      value={pDiscount}
                      onChange={(e) => setPDiscount(e.target.value)}
                      className="w-full p-2.5 border border-gray-250 rounded-xl text-xs bg-white text-center"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">%</span>
                  </div>
                </div>

                {/* Product Image Selection URL & Studio File Picker */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-700 font-extrabold flex justify-between items-center">
                    <span>صورة المنتج:</span>
                    <span className="text-[10px] bg-red-150 text-brand-red px-1.5 py-0.5 rounded font-black">جاهز من الاسترداد/الاستوديو 📸</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setPImage(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-0 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-rose-50 file:text-brand-red hover:file:bg-rose-100 cursor-pointer flex-1"
                    />
                    <input
                      type="url"
                      placeholder="رابط مباشر (URL) بديل..."
                      value={pImage}
                      onChange={(e) => setPImage(e.target.value)}
                      className="p-2 border border-gray-250 rounded-xl text-xs bg-white font-mono w-full sm:w-40 shrink-0"
                    />
                  </div>
                </div>

                {/* Quick Templates */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold block">صور جاهزة متناسقة للتسريع والتجربة:</label>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {defaultImages.map((img) => (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => setPImage(img.url)}
                        className={`text-[10px] px-2 py-1 rounded bg-white hover:bg-emerald-50 border text-gray-600 font-medium ${
                          pImage === img.url ? 'border-emerald-500 ring-2 ring-emerald-200 font-extrabold text-emerald-800' : 'border-gray-200'
                        }`}
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product description */}
              <div className="space-y-1">
                <label className="text-xs text-gray-600 font-extrabold block">نبذة ومكونات المنتج وتوصيات الاستخدام:</label>
                <textarea
                  placeholder="اكتب تفاصيل منتجك ومكوناته بدقة لجذب اهتمام المشترين البحرينيين..."
                  rows={2}
                  maxLength={400}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-250 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
                  className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold py-2 px-4 rounded-xl border border-gray-200 cursor-pointer"
                >
                  إلغاء التعديل
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-2 px-5 rounded-xl shadow transition-all cursor-pointer"
                >
                  {editingProduct ? 'حفظ وحفظ التعديلات الحالية' : 'نشر وتثبيت المنتج الآن بالمنصة'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CURRENT STORE PRODUCTS LIST */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-gray-800 text-sm md:text-base flex items-center gap-1.5">
              <span>قائمة منتجات متجرك الحالية ({vendorProducts.length})</span>
            </h3>
            <span className="text-xs text-gray-400 font-medium">العملية المباشرة في المتجر</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendorProducts.map((prod) => (
              <div key={prod.id} className="bg-white border border-gray-150 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-all group">
                <div className="relative w-full sm:w-28 h-28 shrink-0 bg-gray-100">
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {prod.discount && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow">
                      <Tag className="w-2.5 h-2.5" /> الخصم: {prod.discount}%
                    </div>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-xs md:text-sm text-gray-900 leading-tight line-clamp-1">{prod.name}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">{prod.description}</p>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-55 flex-wrap gap-1.5">
                    <div className="flex items-center gap-1.5">
                      {prod.discount ? (
                        <>
                          <span className="text-emerald-700 font-black text-xs md:text-sm">
                            {(prod.price * (1 - prod.discount / 100)).toFixed(3)} د.ب
                          </span>
                          <span className="text-[10px] text-gray-450 line-through">
                            {prod.price.toFixed(3)} د.ب
                          </span>
                        </>
                      ) : (
                        <span className="text-emerald-700 font-black text-xs md:text-sm">
                          {prod.price.toFixed(3)} د.ب
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => startEditProduct(prod)}
                        className="p-1.5 bg-gray-50 border border-gray-200 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 rounded-lg transition-all cursor-pointer"
                        title="تعديل السلعة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف المنتج "${prod.name}" تماماً من لوحة تحكم بائعك؟`)) {
                            onDeleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 bg-gray-50 border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-650 rounded-lg transition-all cursor-pointer"
                        title="حذف السلعة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {vendorProducts.length === 0 && (
              <div className="col-span-2 text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <p className="text-gray-400 font-bold text-xs md:text-sm">لا تملك أي منتجات معروضة حالياً.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 text-xs text-emerald-700 font-black underline hover:text-emerald-800"
                >
                  اضغط هنا لإدراج منتجك البحريني الأول بالمنصة
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info guide box explicitly describing why vendor contacts are hidden */}
        <div className="bg-amber-55 border border-amber-100 rounded-2xl p-4 md:p-5 flex gap-3 text-xs text-amber-800 bg-amber-50/50">
          <HelpCircle className="w-8 h-8 text-amber-600 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">🔒 سرية تامة والتنسيق المغلق عبر المدير:</p>
            <p>لضمان حقوق الوساطة وجودة التوصيل، لا توجد وسائل اتصال أو أرقام هواتف خاصة بك ظاهرة لزوار التطبيق. يتم تسديد الأموال إلى حساب المنصة (حساب المدير العام)، ثم يقوم المدير بالتواصل معك مباشرةً عبر واتساب من هاتفه لتزويدك ببيانات المشتري وتحويل المستحقات يدوياً بعد خصم العمولة الكلية المتفق عليها.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
