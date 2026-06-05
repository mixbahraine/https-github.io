import React, { useState } from 'react';
import { User, Order, AdRequest, Product } from '../types';
import { 
  Users, ShoppingBag, Image, Trash2, CheckSquare, 
  MessageSquare, Plus, Clock, HelpCircle, Crown, Bell, Percent
} from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  orders: Order[];
  adRequests: AdRequest[];
  products: Product[];
  onPromoteUser: (userId: string) => void;
  onDemoteUser: (userId: string) => void;
  onApproveAd: (adId: string) => void;
  onRejectAd: (adId: string) => void;
  onAddAdRequest: (ad: AdRequest) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateTrackingStatus?: (orderId: string, status: Order['trackingStatus']) => void;
  onSimulateOrder: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onTestNotificationSound: () => void;
  // Product callback properties requested by admin
  onAddProduct: (prod: Omit<Product, 'id'>) => void;
  onEditProduct: (prod: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function AdminPanel({
  users,
  orders,
  adRequests,
  products,
  onPromoteUser,
  onDemoteUser,
  onApproveAd,
  onRejectAd,
  onAddAdRequest,
  onDeleteOrder,
  onUpdateTrackingStatus,
  onSimulateOrder,
  notificationsEnabled,
  onToggleNotifications,
  onTestNotificationSound,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'ads' | 'commission' | 'products'>('orders');
  const [commissionRate, setCommissionRate] = useState<number>(10); // Standard adjustable platform commission percentage (e.g. 10%)
  const [paidCommissions, setPaidCommissions] = useState<{[orderId: string]: boolean}>({});

  // New ad form inputs for the admin themselves
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdAdvertiser, setNewAdAdvertiser] = useState('');
  const [newAdWhatsapp, setNewAdWhatsapp] = useState('');
  const [newAdImage, setNewAdImage] = useState('');
  const [newAdDays, setNewAdDays] = useState(30);
  const [showAddAd, setShowAddAd] = useState(false);

  // New/editing product form inputs for the admin specifically (requested CRUD panel)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(1.000);
  const [prodDiscount, setProdDiscount] = useState<number>(0);
  const [prodImage, setProdImage] = useState('');
  const [prodCategory, setProdCategory] = useState<'productive_families' | 'local_projects'>('productive_families');
  const [prodVendorId, setProdVendorId] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);

  // Statistics calculation for the general platform
  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const activeBannersCount = adRequests.filter(a => a.status === 'approved').length;
  const vendorsCount = users.filter(u => u.role === 'vendor').length;

  // Custom Arabic message for WhatsApp
  const handleGetWhatsAppLink = (order: Order) => {
    const productsList = order.products && order.products.length > 0
      ? order.products.map(p => `- ${p.name} (عدد: ${p.quantity})`).join('\n')
      : '- بضاعة عامة';

    const message = `السلام عليكم يا ${order.vendor.name}، ولديك طلب جديد ورقم #${order.id.replace('order_', '')} عبر تطبيق (mix.bh).

المنتجات المطلوبة:
${productsList}

بيانات المشتري لتجهيز التوصيل:
الاسم: ${order.buyer.name}
رقم الهاتف: ${order.buyer.phone}
العنوان: ${order.buyer.address}

*الحساب المالي للطلب:*
إجمالي المبلغ المستلم من الزائر: ${order.totalAmount.toFixed(3)} د.ب`;

    const encodedText = encodeURIComponent(message);
    const cleanPhone = order.vendor.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  };

  const handleAdminAddAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle || !newAdAdvertiser || !newAdWhatsapp) return;

    const newAd: AdRequest = {
      id: 'ad_custom_' + Date.now(),
      advertiserName: newAdAdvertiser,
      whatsapp: newAdWhatsapp,
      adType: 'ترويج تجاري مباشر',
      title: newAdTitle,
      imageUrl: newAdImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
      durationDays: newAdDays,
      status: 'approved', // Admin auto approves his own ads
      createdAt: new Date().toISOString()
    };

    onAddAdRequest(newAd);
    setNewAdTitle('');
    setNewAdAdvertiser('');
    setNewAdWhatsapp('');
    setNewAdImage('');
    setShowAddAd(false);
  };

  const handleAdminProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      alert('الرجاء كتابة اسم المنتج وسعره المالي المحدد.');
      return;
    }

    // Assign to chosen vendor user, or first vendor user, or admin
    const defaultVendor = users.find(u => u.role === 'vendor') || users[0] || { id: 'admin_seller', name: 'إدارة المنصة الموحدة' };
    const assignedVendor = users.find(u => u.id === prodVendorId) || defaultVendor;

    if (editingProductId) {
      const updatedProduct: Product = {
        id: editingProductId,
        name: prodName,
        description: prodDescription,
        price: Number(prodPrice),
        discount: Number(prodDiscount),
        image: prodImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
        category: prodCategory,
        vendorId: assignedVendor.id,
        vendorName: assignedVendor.name
      };
      onEditProduct(updatedProduct);
      setEditingProductId(null);
    } else {
      const newProduct: Omit<Product, 'id'> = {
        name: prodName,
        description: prodDescription,
        price: Number(prodPrice),
        discount: Number(prodDiscount),
        image: prodImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
        category: prodCategory,
        vendorId: assignedVendor.id,
        vendorName: assignedVendor.name
      };
      onAddProduct(newProduct);
    }

    // Reset Form fields
    setProdName('');
    setProdDescription('');
    setProdPrice(1.000);
    setProdDiscount(0);
    setProdImage('');
    setProdVendorId('');
    setShowProductForm(false);
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdDescription(prod.description);
    setProdPrice(prod.price);
    setProdDiscount(prod.discount || 0);
    setProdImage(prod.image);
    setProdCategory(prod.category);
    setProdVendorId(prod.vendorId);
    setShowProductForm(true);
  };

  return (
    <div id="super-admin-panel" className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mt-6 transition-all duration-300">
      <div className="bg-gradient-to-r from-red-700 to-red-855 text-white p-5 relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Crown className="w-40 h-40" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-gray-900 font-bold text-[10px] px-2.0 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3" /> مدير المنصة
              </span>
              <span className="text-[10px] bg-white/20 text-red-100 px-1.5 py-0.5 rounded">لوحة المراقبة</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black mt-2">لوحة التحكم العليا لـ (mix.bh)</h1>
            <p className="text-red-150 text-[11px] mt-1">
              البريد المعتمد: al7anjri@gmail.com
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            {/* Notification controls */}
            <div className="flex items-center gap-2 bg-black/20 border border-white/10 px-3 py-1.5 rounded-xl text-[11px] justify-between">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <span className={`w-2.5 h-2.5 rounded-full ${notificationsEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                إشعارات الطلبات الفورية
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onToggleNotifications}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${
                    notificationsEnabled 
                      ? 'bg-emerald-500 text-white shadow-inner' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {notificationsEnabled ? 'مفعّلة 🔔' : 'تفعيل بالصوت 🔔'}
                </button>
                {notificationsEnabled && (
                  <button 
                    type="button"
                    onClick={onTestNotificationSound} 
                    className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                  >
                    تجربة
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={onSimulateOrder}
              className="bg-white hover:bg-red-50 text-brand-red px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> محاكاة طلب حي فوري 📦
            </button>
          </div>
        </div>

        {/* Dashboard inner tabs switcher */}
        <div className="flex bg-black/10 rounded-xl p-1 mt-6 border border-white/10 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[100px] py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'orders' ? 'bg-white text-red-700 shadow-sm' : 'text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>الطلبات المستلمة ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('commission')}
            className={`flex-1 min-w-[100px] py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'commission' ? 'bg-white text-red-700 shadow-sm' : 'text-white hover:bg-white/5'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>حساب عمولة الأرباح ({commissionRate}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[100px] py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-red-700 shadow-sm' : 'text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>إدارة الأسر والرواد ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`flex-1 min-w-[100px] py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ads' ? 'bg-white text-red-700 shadow-sm' : 'text-white hover:bg-white/5'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>البنرات والمساحات الإعلانية ({adRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 min-w-[100px] py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'products' ? 'bg-white text-red-700 shadow-sm' : 'text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>إدارة المنتجات ({products.length})</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-slate-50/40">
        {/* Simple indicators */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
            <span className="text-[10px] text-gray-400 font-extrabold block">قيمة المبيعات الكلية</span>
            <span className="text-sm md:text-base font-black text-gray-900">{totalSales.toFixed(3)} د.ب</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
            <span className="text-[10px] text-gray-400 font-extrabold block">الأسر المسجلة</span>
            <span className="text-sm md:text-base font-black text-emerald-800">{vendorsCount} منتج</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
            <span className="text-[10px] text-gray-400 font-extrabold block">الإعلانات النشطة</span>
            <span className="text-sm md:text-base font-black text-brand-red">{activeBannersCount} بنرات</span>
          </div>
        </div>

        {/* TAB 1: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <div id="live-orders-section" className="space-y-4">
            <div className="flex justify-between items-center bg-red-50 p-3 rounded-2xl border border-red-100">
              <span className="text-xs font-black text-red-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                تتبع كشوف الطلبيات الواردة (تحديث آني)
              </span>
              <span className="text-[10px] text-gray-400 font-bold">إشراف مغلق لضمان مملكة البحرين 🇧🇭</span>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-right">
                  <thead className="bg-gray-50">
                    <tr className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                      <th className="px-3 py-2">رقم الطلب</th>
                      <th className="px-3 py-2">طريقة الدفع وقيمة الفاتورة</th>
                      <th className="px-3 py-2">بيانات العميل</th>
                      <th className="px-3 py-2">البضاعة والأسر البائعة</th>
                      <th className="px-3 py-2 text-center">مسار التوصيل والتحرك 🚚</th>
                      <th className="px-3 py-2 text-center">تنسيق وإرسال</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-[11px]">
                    {orders.map((order, index) => {
                      return (
                        <tr key={`${order.id || 'ord'}_${index}`} className="hover:bg-red-50/20 transition-colors">
                          {/* ID */}
                          <td className="px-3 py-2 font-mono font-black text-gray-800">
                            #{order.id.replace('order_', '')}
                          </td>

                          {/* Invoice Cost */}
                          <td className="px-3 py-2">
                            <div>
                              <p className="font-black text-brand-red text-xs">{order.totalAmount.toFixed(3)} د.ب</p>
                              <span className={`inline-block text-[9px] px-1 rounded font-bold ${
                                order.paymentMethod === 'BenefitPay' 
                                  ? 'bg-red-50 text-brand-red' 
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}>
                                {order.paymentMethod === 'BenefitPay' ? 'بنفت باي 🇧🇭' : 'عند الاستلام 💵'}
                              </span>
                            </div>
                          </td>

                          {/* Buyer */}
                          <td className="px-3 py-2">
                            <div className="space-y-0.5">
                              <p className="font-bold text-gray-900">{order.buyer.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono" dir="ltr">{order.buyer.phone}</p>
                              <p className="text-[10px] text-gray-400 truncate max-w-[140px]" title={order.buyer.address}>
                                {order.buyer.address}
                              </p>
                            </div>
                          </td>

                          {/* Seller & Products */}
                          <td className="px-3 py-2">
                            <div className="space-y-0.5">
                              <p className="font-bold text-gray-700">{order.vendor.name}</p>
                              <div className="space-y-0.5">
                                {order.products && order.products.length > 0 ? (
                                  order.products.map((item, itemIdx) => (
                                    <p key={itemIdx} className="text-[10px] text-gray-500 whitespace-nowrap">
                                      - {item.name} <strong className="text-gray-800">({item.quantity} حبة)</strong>
                                    </p>
                                  ))
                                ) : (
                                  <p className="text-[10px] italic">بضاعة سريعة غير مسجلة</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Tracking dropdown for admin */}
                          <td className="px-3 py-2 text-center">
                            <select
                              value={order.trackingStatus || 'pending'}
                              onChange={(e) => onUpdateTrackingStatus?.(order.id, e.target.value as any)}
                              className={`p-1 rounded-lg border text-[10px] font-black cursor-pointer bg-white focus:outline-none transition-all ${
                                order.trackingStatus === 'delivered'
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                  : order.trackingStatus === 'with_courier'
                                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                                  : order.trackingStatus === 'preparing'
                                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                                  : 'border-rose-300 bg-rose-50 text-rose-900 animate-pulse'
                              }`}
                            >
                              <option value="pending">⏳ قيد المراجعة بالقرية</option>
                              <option value="preparing">⚙️ جاري تجهيز الأسر</option>
                              <option value="with_courier">🚗 في مسار التوصيل</option>
                              <option value="delivered">✅ تم التوصيل بنجاح</option>
                            </select>
                          </td>

                          {/* Action */}
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <a
                                href={handleGetWhatsAppLink(order)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2 py-1 rounded text-[10px]"
                              >
                                💬 تنسيق وتسليم
                              </a>
                              <button
                                onClick={() => onDeleteOrder(order.id)}
                                className="text-gray-400 hover:text-red-650 p-1 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400 font-bold text-xs">
                          لا توجد طلبات جارية حالياً. اضغط على "محاكاة طلب حي" أعلاه للتجربة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 text-[11px] text-amber-800">
              <p className="font-extrabold">📌 تفاصيل التوصيل والاتصال بالبحرين:</p>
              <p className="leading-relaxed">أنت كمدير تتسلم الطلب هنا ببيانات المشتري وصاحب المنتج وتضغط على (تنسيق وتسليم) لتفويض وتسليم الطلب ومكالمة البائع يدوياً برقم الطلب لتوفير مسار شحن واحد.</p>
            </div>
          </div>
        )}

        {/* TAB: COMMISSION & PLATFORM EARNINGS */}
        {activeTab === 'commission' && (
          <div id="commission-calculator-section" className="space-y-6 text-right" dir="rtl">
            <div className="bg-gradient-to-r from-red-50 to-amber-50 p-4 rounded-2xl border border-red-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-black text-red-900 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-brand-red animate-pulse" />
                  <span>برنامج ضبط ومقاصة عمولة الأرباح للبوابة 🇧🇭</span>
                </h3>
                <p className="text-[11px] text-gray-550 leading-relaxed font-semibold">
                  تحتسب منصة (mix.bh) عمولة رمزية مخصصة لتشغيل وتطوير البوابة وصيانة خوادم الاستضافة. يمكنك التحكم بمقدار العمولة بالأسفل.
                </p>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-bold">نسبة العمولة الحالية:</span>
                <span className="bg-brand-red text-white font-mono font-black text-xs px-2.0 py-0.5 rounded-lg">
                  {commissionRate}%
                </span>
              </div>
            </div>

            {/* Slider control widget card */}
            <div className="bg-white border border-gray-150 rounded-2.5xl p-4 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex-1 space-y-2 w-full">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-black text-gray-700">تحريك مؤشر عمولة المنصة:</label>
                  <span className="text-xs font-bold text-gray-500">من 0% إلى 50% كحد أقصى</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={commissionRate} 
                  onChange={(e) => setCommissionRate(Number(e.target.value))} 
                  className="w-full accent-brand-red cursor-pointer h-2 bg-gray-100 rounded-lg appearance-none"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  type="button"
                  onClick={() => setCommissionRate(5)}
                  className={`flex-1 sm:flex-none text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all ${commissionRate === 5 ? 'bg-red-700 text-white shadow-inner' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  5% مخفض
                </button>
                <button 
                  type="button"
                  onClick={() => setCommissionRate(10)}
                  className={`flex-1 sm:flex-none text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all ${commissionRate === 10 ? 'bg-red-700 text-white shadow-inner' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  10 % قياسي
                </button>
                <button 
                  type="button"
                  onClick={() => setCommissionRate(15)}
                  className={`flex-1 sm:flex-none text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all ${commissionRate === 15 ? 'bg-red-700 text-white shadow-inner' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  15 % مميز
                </button>
              </div>
            </div>

            {/* Stat Cards representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white border rounded-2xl p-4 shadow-sm text-right">
                <span className="text-[10px] text-gray-450 font-bold block mb-1">إجمالي قيمة مبيعات البوابة</span>
                <span className="text-sm md:text-base font-black text-gray-900">{totalSales.toFixed(3)} د.ب</span>
                <p className="text-[9px] text-gray-400 mt-1">المبلغ المالي الكلي شامل شحن الأسر</p>
              </div>

              <div className="bg-brand-red/5 border border-brand-red/10 rounded-2xl p-4 shadow-sm text-right">
                <span className="text-[10px] text-red-800 font-extrabold block mb-1">صافي أرباح المنصة المستقطعة ({commissionRate}%)</span>
                <span className="text-sm md:text-base font-black text-[#D01C1F]">{(totalSales * (commissionRate / 100)).toFixed(3)} د.ب</span>
                <p className="text-[9px] text-red-600 mt-1">تذهب لدعم الأسر وبث الإعلانات المميزة</p>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 shadow-sm text-right">
                <span className="text-[10px] text-emerald-800 font-extrabold block mb-1">مستحقات البائعين الكلية الصافية</span>
                <span className="text-sm md:text-base font-black text-emerald-800">{(totalSales * (1 - commissionRate / 100)).toFixed(3)} د.ب</span>
                <p className="text-[9px] text-emerald-600 mt-1">بعد استقطاع نسبة الخدمة المقررة</p>
              </div>
            </div>

            {/* Tabular layout of individual commissions */}
            <div className="bg-white border border-gray-150 rounded-2.5xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center flex-wrap gap-2">
                <span className="text-xs font-black text-gray-800">تفاصيل مقاصة وجرد العمولات لكل طلبية</span>
                <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-black font-mono">سجلات التبادل المالي</span>
              </div>

              <div className="overflow-x-auto font-sans">
                <table className="min-w-full divide-y divide-gray-200 text-right text-[11px] font-sans">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-500">
                    <tr>
                      <th className="px-4 py-2">رقم الطلب</th>
                      <th className="px-4 py-2">التاجر / البائع</th>
                      <th className="px-4 py-2">تفاصيل العميل</th>
                      <th className="px-4 py-2 text-left">قيمة الفاتورة</th>
                      <th className="px-4 py-2 text-left text-brand-red">عمولتك المقررة ({commissionRate}%)</th>
                      <th className="px-4 py-2 text-left text-emerald-800">الصافي للبائع</th>
                      <th className="px-4 py-2 text-center">حالة تحصيل العمولة 💸</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {orders.map((order, oIdx) => {
                      const orderFee = order.totalAmount * (commissionRate / 100);
                      const vendorNet = order.totalAmount * (1 - commissionRate / 100);
                      const isPaid = !!paidCommissions[order.id];

                      return (
                        <tr key={`${order.id || 'ord'}_${oIdx}`} className="hover:bg-slate-55/10 transition-colors">
                          <td className="px-4 py-2 font-mono font-black">#{order.id.replace('order_', '').replace('sim_','s')}</td>
                          <td className="px-4 py-2">
                            <span className="font-bold text-gray-800">{order.vendor.name}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-gray-600 block">{order.buyer.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono" dir="ltr">{order.buyer.phone}</span>
                          </td>
                          <td className="px-4 py-2 text-left font-bold">{order.totalAmount.toFixed(3)} د.ب</td>
                          <td className="px-4 py-2 text-[#D01C1F] text-left font-black">{orderFee.toFixed(3)} د.ب</td>
                          <td className="px-4 py-2 text-emerald-800 text-left font-black">{vendorNet.toFixed(3)} د.ب</td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => setPaidCommissions(prev => ({
                                ...prev,
                                [order.id]: !prev[order.id]
                              }))}
                              className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                                isPaid 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              {isPaid ? '✓ تم التحصيل والمقاصة' : '⏳ جاري تحصيل الرسوم'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-gray-400 font-bold">
                          لا توجد طلبيات للمقاصة المالية حالياً.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERS & PROMOTIONS */}
        {activeTab === 'users' && (
          <div id="user-promotion-section" className="space-y-4">
            <div className="bg-red-50 p-3 rounded-2xl text-[11px] text-red-800 leading-relaxed">
              <p className="font-black">نظام الترقية للمشاريع والأسر المنتجة 🇧🇭</p>
              <p className="mt-0.5">انقر على ترقية لترسيم حساب الزائر العادي وتخصيص مساحته ومجموعته على المنصة.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users.map((user, index) => (
                <div key={`${user.id || 'usr'}_${index}`} className="bg-white border border-gray-150 rounded-2xl p-3 flex justify-between items-center shadow-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-gray-850 text-xs">{user.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-brand-red'
                          : user.role === 'vendor'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'المدير' : user.role === 'vendor' ? 'بائع معتمد' : 'زائر بحريني'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">{user.phone}</p>
                  </div>

                  <div>
                    {user.role === 'user' && (
                      <button
                        onClick={() => onPromoteUser(user.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-2 py-1 rounded-lg"
                      >
                        ترقية لبائع معتمد 👑
                      </button>
                    )}
                    {user.role === 'vendor' && (
                      <button
                        onClick={() => onDemoteUser(user.id)}
                        className="bg-gray-150 hover:bg-gray-200 text-gray-650 font-bold text-[10px] px-2 py-1 rounded-lg"
                      >
                        سحب الرتبة ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SPONSORED ADS WITH FILE UPLOAD */}
        {activeTab === 'ads' && (
          <div id="ads-management-section" className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-gray-800">إدارة البنرات الممولة الظاهرة بالمنصة</span>
              <button
                onClick={() => setShowAddAd(!showAddAd)}
                className="bg-brand-red hover:bg-red-700 text-white text-[10px] font-black py-1 px-2 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> {showAddAd ? 'إغلاق المربع' : 'بث بنر إعلاني جديد 📢'}
              </button>
            </div>

            {showAddAd && (
              <form onSubmit={handleAdminAddAd} className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-3 animate-fade-in text-right">
                <p className="text-[11px] text-brand-red font-black">بث بنر إعلاني مدفوع في mix.bh:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-600 font-bold block">العنوان التجاري العريض لوصف البانر:</label>
                    <input
                      type="text"
                      required
                      placeholder="خصم 40% بمناسبة الافتتاح لباب البحرين"
                      value={newAdTitle}
                      onChange={(e) => setNewAdTitle(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-600 font-bold block">اسم الممول / الشركة:</label>
                    <input
                      type="text"
                      required
                      placeholder="مجوهرات الزين البحرينية"
                      value={newAdAdvertiser}
                      onChange={(e) => setNewAdAdvertiser(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-600 font-bold block">رقم وتساب للتنسيق المالي المعتمد:</label>
                    <input
                      type="text"
                      required
                      placeholder="+973 39999123"
                      value={newAdWhatsapp}
                      onChange={(e) => setNewAdWhatsapp(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  {/* Local Studio upload picker */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-620 font-bold block flex justify-between">
                      <span>صورة البانر الترويجية:</span>
                      <span className="text-[9px] text-[#D01C1F] bg-rose-50 px-1 py-0.2 rounded font-black">جاهز من الاستوديو 📸</span>
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setNewAdImage(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[10px] text-gray-400 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:bg-rose-50 file:text-[#D01C1F] hover:file:bg-rose-100 cursor-pointer flex-1"
                      />
                      <input
                        type="url"
                        placeholder="أو رابط URL مباشر..."
                        value={newAdImage}
                        onChange={(e) => setNewAdImage(e.target.value)}
                        className="p-1 px-2 border border-gray-250 rounded-xl text-[10px] bg-white font-mono w-24 shrink-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-1.5 rounded-xl cursor-pointer"
                  >
                    نشر وبث البانر فوراً بالرئيسية ✅
                  </button>
                </div>
              </form>
            )}

            {/* Render ads lists */}
            <div className="space-y-3">
              {adRequests.map((ad, index) => (
                <div key={`${ad.id || 'ad'}_${index}`} className="bg-white border rounded-2xl p-3 flex gap-3 hover:border-red-200 transition-all flex-col md:flex-row">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className="w-full md:w-32 h-20 object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900 leading-snug">{ad.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">المعلن: <strong>{ad.advertiserName}</strong> | وتساب: {ad.whatsapp}</p>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t flex-wrap gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                        ad.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900 animate-pulse'
                      }`}>
                        {ad.status === 'approved' ? 'نشط بالرئيسية' : 'بانتظار الموافقة'}
                      </span>

                      <div className="flex gap-1">
                        {ad.status === 'pending' && (
                          <button
                            onClick={() => onApproveAd(ad.id)}
                            className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded font-black hover:bg-emerald-700"
                          >
                            موافقة ونشر بالرئيسية ✅
                          </button>
                        )}
                        <button
                          onClick={() => onRejectAd(ad.id)}
                          className="text-gray-400 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN PRODUCTS CRUD MANAGEMENT (Requested by user) */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-red-50/40 p-4 rounded-2xl border border-red-100 flex-wrap gap-2">
              <div className="text-right">
                <h3 className="font-extrabold text-sm text-gray-900">إدارة كافة السلع والمنتجات والمعروضات 🛍️</h3>
                <p className="text-[11px] text-gray-500">من لوحة الإشراف العليا: يمكنك إضافة، تعديل وحذف أي منتج للبائعين والأسر لمتابعة التسويق.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setProdName('');
                  setProdDescription('');
                  setProdPrice(1.000);
                  setProdDiscount(0);
                  setProdImage('');
                  setProdVendorId('');
                  setShowProductForm(!showProductForm);
                }}
                className="bg-brand-red hover:bg-red-700 text-white font-black text-xs py-2 px-4 rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                {showProductForm ? 'إغلاق نافذة الإدخال' : 'إضافة منتج جديد للمنصة 🛒'}
              </button>
            </div>

            {/* Product form toggleable */}
            {showProductForm && (
              <form onSubmit={handleAdminProductSubmit} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4 text-right animate-fade-in">
                <h4 className="font-black text-xs text-[#D01C1F] border-r-4 border-[#D01C1F] pr-1.5 pb-0.5">
                  {editingProductId ? 'تحديث وتعديل بيانات المنتج الحالي ✏️' : 'إضافة سلع جديدة للبث المباشر 🏷️'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-600 font-bold block">اسم المنتج التجاري الكامل *:</label>
                    <input
                      type="text"
                      required
                      placeholder="قرص عقيلي بحريني فاخر"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  {/* Merchant vendor association selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-600 font-bold block">ربطه باسم الأسرة المنتجة / البائع المستفيد *:</label>
                    <select
                      value={prodVendorId}
                      required
                      onChange={(e) => setProdVendorId(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs h-[34px]"
                    >
                      <option value="">-- يرجى اختيار البائع والأسرة المنتجة --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role === 'vendor' ? 'بائع معتمد' : 'مشتري / عضو عام'}) - {u.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-600 font-bold block">السعر المالي (د.ب) *:</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      min="0.050"
                      placeholder="مثال: 4.500"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  {/* Discount */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-600 font-bold block">نسبة الخصم الترويجي (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={prodDiscount}
                      onChange={(e) => setProdDiscount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-600 font-bold block">تصنيف المنتج الرئيسي:</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value as any)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs h-[34px]"
                    >
                      <option value="productive_families">الأسر البحرينية المنتجة 🍳</option>
                      <option value="local_projects">المشاريع البحرينية والورش 🛠️</option>
                    </select>
                  </div>

                  {/* Image input/upload */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-600 font-bold block flex justify-between">
                      <span>صورة المنتج الجذابة:</span>
                      <span className="text-[9px] text-[#D01C1F] bg-rose-50 px-1 py-0.2 rounded font-black">أو عبر الرول السريع 📸</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setProdImage(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[10px] text-gray-400 file:py-1 file:px-2 file:rounded-xl file:border-0 file:bg-rose-50 file:text-[#D01C1F] hover:file:bg-rose-100 cursor-pointer flex-1"
                      />
                      <input
                        type="url"
                        placeholder="رابط البكاء أو الرابط مباشرة..."
                        value={prodImage}
                        onChange={(e) => setProdImage(e.target.value)}
                        className="p-1 px-2 border border-gray-250 rounded-xl text-[10px] bg-white font-mono w-32 shrink-0 h-[34px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-600 font-bold block">الوصف ومحتويات الصنع الحرفي:</label>
                  <textarea
                    rows={2}
                    placeholder="مثال: مصنوع بأيادي بحرينية بالمنزل بمكونات طبيعية مئة بالمئة بمذاق الهيل والزعفران الأصلي..."
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProductId(null);
                    }}
                    className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold py-1.5 px-4 rounded-xl border border-gray-250 cursor-pointer"
                  >
                    إلغاء التغيير
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-1.5 px-6 rounded-xl cursor-pointer shadow-xs"
                  >
                    {editingProductId ? 'حفظ وتحديث التعديل فوراً ☑️' : 'بث ونشر السلعة بالمتجر الآن 🚀'}
                  </button>
                </div>
              </form>
            )}

            {/* List products for the admin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => {
                const discountedPrice = prod.discount 
                  ? prod.price * (1 - prod.discount / 100) 
                  : prod.price;
                return (
                  <div key={prod.id} className="bg-white border border-gray-200 hover:border-red-300 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs transition-all relative overflow-hidden group">
                    <div>
                      {/* Product display card metadata */}
                      <div className="relative rounded-xl overflow-hidden bg-gray-50 h-32 mb-3">
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        {prod.discount ? (
                          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                            خصم {prod.discount}% 🔥
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-1 text-right">
                        <h4 className="font-extrabold text-xs text-gray-900 leading-snug truncate">{prod.name}</h4>
                        <p className="text-[10px] text-gray-400 line-clamp-2 h-7 leading-relaxed">{prod.description || 'لا يوجد وصف تفصيلي للمنتج الكلي.'}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between items-baseline flex-row-reverse">
                        <div className="space-y-0.5 text-right">
                          <span className="text-[9px] text-gray-400 block font-bold">بائع السلعة:</span>
                          <span className="text-[10px] text-[#A31618] font-black">{prod.vendorName}</span>
                        </div>
                        <div className="text-left font-mono">
                          {prod.discount ? (
                            <div className="flex gap-1 items-baseline justify-end">
                              <span className="text-[9px] text-gray-400 line-through">{prod.price.toFixed(3)} د.ب</span>
                              <span className="text-[12px] font-black text-brand-red">{discountedPrice.toFixed(3)} د.ب</span>
                            </div>
                          ) : (
                            <span className="text-[12px] font-black text-gray-900">{prod.price.toFixed(3)} د.ب</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => startEditProduct(prod)}
                          className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-[10px] py-1 rounded-lg text-center cursor-pointer transition-all"
                        >
                          تعديل المنتج ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف المنتج "${prod.name}" بالكامل من المتاجر؟`)) {
                              onDeleteProduct(prod.id);
                            }
                          }}
                          className="px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer transition-all flex items-center justify-center border border-rose-100"
                          title="حذف هذا المنتج نهائياً"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
