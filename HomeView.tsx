import React, { useState } from 'react';
import { Product, BahrainEvent, AdRequest, User, CartItem, Order } from '../types';
import { 
  Search, Calendar, Percent, ShoppingBag, Send, AlertCircle, Check, 
  MapPin, Clock, Megaphone, ChevronRight, Filter, LogIn, LogOut, ArrowRight, X, Sparkles, ShoppingCart, Truck, Trash2, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedLogo from './AnimatedLogo';

interface HomeViewProps {
  products: Product[];
  events: BahrainEvent[];
  ads: AdRequest[];
  currentUser: User | null;
  cart: CartItem[];
  orders: Order[];
  onAddToCart: (product: Product, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateCartQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onOpenCheckout: (checkoutProducts: { product: Product; quantity: number }[]) => void;
  onSubmitAdRequest: (ad: Omit<AdRequest, 'id' | 'status' | 'createdAt'>) => void;
  onAuthLogin: (user: User) => void;
  onAuthLogout: () => void;
  onAuthRegister: (name: string, phone: string, email: string) => void;
}

export default function HomeView({
  products,
  events,
  ads,
  currentUser,
  cart,
  orders,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onClearCart,
  onOpenCheckout,
  onSubmitAdRequest,
  onAuthLogin,
  onAuthLogout,
  onAuthRegister
}: HomeViewProps) {
  // Grand Main Tab Switcher
  const [mainTab, setMainTab] = useState<'marketplace' | 'events'>('marketplace');

  // Search & Inner Filter Category States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'productive_families' | 'local_projects'>('all');
  const [activeHubTab, setActiveHubTab] = useState<'all' | 'events' | 'offers'>('all');

  // Order Tracking State lookup widget
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);

  // Interactive UI modals
  const [showAdRequestModal, setShowAdRequestModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Ad Request Form state
  const [adName, setAdName] = useState('');
  const [adWhatsapp, setAdWhatsapp] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [adType, setAdType] = useState('مأكولات شعبية');
  const [adDays, setAdDays] = useState(15);
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adSuccessMessage, setAdSuccessMessage] = useState(false);

  // Simple animation or feedback toast when adding to cart
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAdRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adName || !adWhatsapp || !adTitle) {
      alert('الرجاء تعبئة الاسم وعنوان البانر ورقم الواتساب بالكامل.');
      return;
    }

    onSubmitAdRequest({
      advertiserName: adName,
      whatsapp: adWhatsapp,
      adType,
      title: adTitle,
      imageUrl: adImageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200',
      durationDays: adDays
    });

    setAdSuccessMessage(true);
    setTimeout(() => {
      setAdSuccessMessage(false);
      setShowAdRequestModal(false);
      // Reset form
      setAdName('');
      setAdWhatsapp('');
      setAdTitle('');
      setAdImageUrl('');
    }, 2500);
  };

  const handleSimulatedAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (!authName || !authPhone || !authEmail) {
        alert('الرجاء ملء كافة بيانات الحساب الموحد الجديد.');
        return;
      }
      onAuthRegister(authName, authPhone, authEmail);
    } else {
      if (!authPhone) {
        alert('يرجى كتابة رقم الهاتف للتسجيل السريع.');
        return;
      }
      onAuthRegister(authName || "زائر بحريني جديد", authPhone, authEmail || "guest@mix.bh");
    }
    setShowAuthModal(false);
    setAuthName('');
    setAuthPhone('');
    setAuthEmail('');
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderId) return;
    const cleanId = trackOrderId.trim().toLowerCase().replace('#', '').replace('order_', '');
    // Retrieve orders database from localStorage safely
    const savedOrdersStr = localStorage.getItem('mix_bh_orders');
    const localOrders = savedOrdersStr ? JSON.parse(savedOrdersStr) : [];
    
    const found = localOrders.find((o: any) => 
      o.id.toLowerCase().replace('order_', '') === cleanId ||
      o.buyer?.phone?.includes(cleanId)
    );

    if (found) {
      setTrackResult(found);
    } else {
      setTrackResult('not_found');
    }
  };

  // Approved ads
  const activeBanners = ads.filter(a => a.status === 'approved');

  // Filtering Products
  const filteredProducts = products.filter(prod => {
    const matchesCategory = activeCategory === 'all' || prod.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      prod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtering events
  const filteredEvents = events.filter(evt => {
    const matchesHub = activeHubTab === 'all' ||
      (activeHubTab === 'events' && !evt.isOffer) ||
      (activeHubTab === 'offers' && evt.isOffer);
    const matchesSearch = searchTerm === '' || 
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      evt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesHub && matchesSearch;
  });

  // Group cart items by vendor ID/Name
  const groupedCart: { [vendorId: string]: { vendorName: string; items: CartItem[] } } = {};
  cart.forEach((item) => {
    const vId = item.product.vendorId;
    if (!groupedCart[vId]) {
      groupedCart[vId] = {
        vendorName: item.product.vendorName,
        items: []
      };
    }
    groupedCart[vId].items.push(item);
  });

  return (
    <div id="client-home-view" className="space-y-6 pb-12" dir="rtl">
      
      {/* SPONSORED ADS AREA (Top elegant horizontal layout) */}
      {activeBanners.length > 0 && (
        <div id="sponsored-ads-banner-area" className="bg-white border border-gray-150 rounded-2.5xl overflow-hidden shadow-sm">
          <div className="bg-red-50/50 px-5 py-2 border-b border-red-100 flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-brand-red font-black text-xs">
              <Megaphone className="w-3.5 h-3.5 animate-bounce" /> المساحات الإعلانية المعتمدة
            </span>
            <button
              onClick={() => setShowAdRequestModal(true)}
              className="bg-[#D01C1F] hover:bg-black text-[10px] font-black text-white px-2 py-1 rounded-lg"
            >
              أعلن معنا 📢
            </button>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeBanners.map((ad) => (
                <div key={ad.id} className="relative h-28 rounded-xl overflow-hidden group shadow-sm bg-black">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-all" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                    <span className="text-[9px] bg-red-650 text-white font-black px-1.5 py-0.2 rounded w-max">إعلان ممول</span>
                    <h3 className="text-white font-extrabold text-xs mt-1 line-clamp-1">{ad.title}</h3>
                    <p className="text-gray-300 text-[10px]">الجهة المعلنة: {ad.advertiserName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GRAND PRIMARY SEGMENTED TABS (SOCIETY MARKET vs COMMUNITY EVENTS) */}
      <div className="bg-white border border-gray-200 rounded-2.5xl p-1.5 shadow-sm max-w-xl mx-auto flex gap-1.5 justify-center">
        <button
          onClick={() => { setMainTab('marketplace'); setSearchTerm(''); }}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === 'marketplace'
              ? 'bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md'
              : 'text-gray-650 hover:bg-gray-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>سوق الأسر والمنتجين 🛍️</span>
        </button>

        <button
          onClick={() => { setMainTab('events'); setSearchTerm(''); }}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === 'events'
              ? 'bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md'
              : 'text-gray-650 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>الفعاليات والعروض البحرينية 🇧🇭</span>
        </button>
      </div>

      {/* REVEALED SMART SEARCH & NESTED CATEGORIES ACCORDING TO PRIMARY TAB */}
      <div className="bg-white border border-gray-150 rounded-2.5xl p-4 shadow-sm max-w-3xl mx-auto space-y-4">
        
        {/* Search Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={
              mainTab === 'marketplace'
                ? "ابحث بالمنتجات.. بهارات، دراعات، حلوى بحرينية، عود بخور، بسكويت أم يوسف..."
                : "ابحث بالفعاليات.. بسطة البحرين، سوق المنامة، مهرجان الصيف، تجمعات القرية..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 text-right"
          />
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute left-10 text-[10px] text-gray-400 underline"
            >
              مسح
            </button>
          )}
        </div>

        {/* Revealed Sub-categories */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-3">
          <span className="text-[10px] text-gray-400 font-extrabold">التصنيفات الفرعية المتاحة:</span>
          
          {mainTab === 'marketplace' ? (
            <div className="flex gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === 'all' ? 'bg-red-50 text-[#D01C1F] border border-red-100' : 'bg-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                الكل ({products.length})
              </button>
              <button
                onClick={() => setActiveCategory('productive_families')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === 'productive_families' ? 'bg-red-50 text-[#D01C1F] border border-red-100' : 'bg-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                طهي وصناعة الأسر المنتجة 🥞
              </button>
              <button
                onClick={() => setActiveCategory('local_projects')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === 'local_projects' ? 'bg-red-50 text-[#D01C1F] border border-red-100' : 'bg-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                المشاريع الشبابية والمحلية 🛠️
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveHubTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeHubTab === 'all' ? 'bg-red-50 text-[#D01C1F] border border-red-100' : 'bg-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                الكل ({events.length})
              </button>
              <button
                onClick={() => setActiveHubTab('events')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeHubTab === 'events' ? 'bg-red-50 text-[#D01C1F] border border-red-100' : 'bg-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                مهرجانات وتجمعات تراثية 🎉
              </button>
              <button
                onClick={() => setActiveHubTab('offers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeHubTab === 'offers' ? 'bg-red-50 text-[#D01C1F] border border-red-100' : 'bg-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                عروض وتنزيلات محلات 🏷️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER MARKETPLACE PRODUCTS GRID IN 4 COLUMNS (HIGH RESOLUTION COMPACT CARDS) */}
      {mainTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4_">
            
            {/* Products map wrapper */}
            {filteredProducts.map((prod) => {
              const originalPrice = prod.price;
              const hasDiscount = prod.discount && prod.discount > 0;
              const currentPrice = hasDiscount 
                ? originalPrice * (1 - (prod.discount || 0) / 100) 
                : originalPrice;

              return (
                <div 
                  key={prod.id} 
                  onClick={() => setSelectedProduct(prod)}
                  className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 flex flex-col group relative cursor-pointer"
                >
                  {/* Category badget */}
                  <span className="absolute top-2 left-2 z-10 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    {prod.category === 'productive_families' ? 'أسرة منتجة' : 'مشروع محلي'}
                  </span>

                  {/* Product Image (Compact h-32) */}
                  <div className="relative h-28 sm:h-32 bg-gray-50 overflow-hidden shrink-0">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-[#D01C1F] text-white font-black text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                        <span>% {prod.discount} خصم</span>
                      </div>
                    )}
                  </div>

                  {/* Body description */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-0.5 text-right">
                      <p className="text-[9px] text-[#A31618] font-black">منتج وطني معتمد 🇧🇭</p>
                      <h4 className="font-extrabold text-[12px] text-gray-900 line-clamp-1 leading-snug">
                        {prod.name}
                      </h4>
                      <p className="text-gray-400 text-[10px] line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2 text-right">
                      {/* Price section */}
                      <div className="flex justify-between items-baseline flex-wrap">
                        <span className="text-[9px] text-gray-400 font-bold">السعر المقدر:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[#D01C1F] font-black text-xs sm:text-sm">
                            {currentPrice.toFixed(3)} د.ب
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-gray-400 line-through">
                              {originalPrice.toFixed(3)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ADD TO CART ACTION BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(prod, 1);
                          setAddedToast(prod.name);
                          setTimeout(() => setAddedToast(null), 2000);
                        }}
                        className="w-full bg-[#D01C1F] hover:bg-black text-[10px] font-black text-white py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>إضافة للسلة 🛒</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400 text-xs font-bold bg-white rounded-3xl border border-dashed">
                عذراً، لا توجد نتائج مطابقة لـ "{searchTerm}". جرب تصفح فئات أخرى.
              </div>
            )}
          </div>

          {/* DYNAMIC SHOPPING CART SECTION GROUPED BY SELLER */}
          <div id="shopping-cart-marketplace-integration" className="max-w-4xl mx-auto mt-8 bg-white border border-gray-150 rounded-2.5xl overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-red-700 to-red-850 text-white p-4 flex justify-between items-center">
              <span className="font-black text-xs md:text-sm flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>سلة التسوق البحرينية لـ mix.bh ({cart.length} سلع)</span>
              </span>
              {cart.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs bg-white/20 text-white hover:bg-white/30 px-2.0 py-1 rounded-lg"
                >
                  إفراغ بالكامل ×
                </button>
              )}
            </div>

            <div className="p-4 md:p-6">
              {cart.length > 0 ? (
                <div className="space-y-6">
                  {/* Map over vendors */}
                  {Object.keys(groupedCart).map((vId) => {
                    const group = groupedCart[vId];
                    // Get delivery cost for this seller specifically
                    // Search in profile data or fallback to 1.5
                    const matchedVendor = group.items[0]?.product;
                    const deliveryCost = 1.500; // default flat rate or from vendor

                    return (
                      <div key={vId} className="border border-gray-150 rounded-2.5xl p-4 bg-slate-50/35 space-y-3">
                        {/* List items under this seller */}
                        <div className="space-y-3">
                          {group.items.map((item) => {
                            const unitPrice = item.product.discount 
                              ? item.product.price * (1 - item.product.discount / 100) 
                              : item.product.price;
                            return (
                              <div key={item.product.id} className="flex gap-3 items-center justify-between flex-wrap md:flex-nowrap bg-white p-2.5 rounded-xl border">
                                <div className="flex gap-2.5 items-center">
                                  <img 
                                    src={item.product.image} 
                                    alt={item.product.name} 
                                    className="w-12 h-12 object-cover rounded-lg border"
                                  />
                                  <div>
                                    <h4 className="font-extrabold text-xs text-gray-900">{item.product.name}</h4>
                                    <p className="text-[10px] text-gray-400">سعر الفرد: {unitPrice.toFixed(3)} د.ب</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  {/* Quantity manager */}
                                  <div className="flex items-center bg-gray-50 border rounded-xl p-1 gap-2.5">
                                    <button 
                                      onClick={() => onUpdateCartQuantity(item.product.id, item.quantity - 1)}
                                      className="w-5 h-5 bg-white rounded flex items-center justify-center font-bold text-xs"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                    <button 
                                      onClick={() => onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                                      className="w-5 h-5 bg-white rounded flex items-center justify-center font-bold text-xs"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="text-left min-w-[70px]">
                                    <span className="text-xs font-black text-brand-red">{(unitPrice * item.quantity).toFixed(3)} د.ب</span>
                                  </div>

                                  <button
                                    onClick={() => onRemoveFromCart(item.product.id)}
                                    className="text-gray-300 hover:text-red-500 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* HIGHLY COMPLIANT UNIQUE COMBINED ORDER NOTICE MANDATED BY USER */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 mt-2 space-y-2 text-right">
                          <p className="text-xs text-emerald-900 font-extrabold flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-emerald-600 animate-pulse" />
                            <span>شحنة توصيل واحدة من نفس المنتج 📦</span>
                          </p>
                          <p className="text-[10px] text-emerald-700 leading-normal font-medium">
                            جميع المحتويات المذكورة أعلاه تنتمي لنفس المتجر الإنتاجي، لذا سيتم تغليفها وإرسالها إليك معًا في <strong>شحنة واحدة وتوصيل واحد</strong> بقيمة تبلغ <strong>1.500 د.ب</strong> فقط لتحفيز الادخار!
                          </p>
                          
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                // Open checkout modal passing items of this specific vendor only
                                onOpenCheckout(group.items);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] px-4 py-2 rounded-xl flex items-center gap-1.5"
                            >
                              إتمام الشراء لشحنتك الفريدة والدفع 💳
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto" />
                  <h4 className="font-extrabold text-sm text-gray-600 mt-2">السلة البحرينية فارغة حالياً</h4>
                  <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">تصفح المنتجات بالأعلى واضغط على "إضافة للسلة 🛒" لبدء تجهيز طلبيتك الموحدة.</p>
                </div>
              )}
            </div>
          </div>

          {/* USER PAST ORDERS & LIVE ORDER TRACKING CART (Requested by User) */}
          <div className="max-w-4xl mx-auto mt-8 bg-white border border-gray-150 rounded-2.5xl overflow-hidden shadow-md text-right" dir="rtl">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 flex justify-between items-center">
              <span className="font-black text-xs md:text-sm flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-200 animate-bounce" />
                <span>سلة تتبع الطلبات والشحنات الحالية 📦</span>
              </span>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black">
                تحديث حي وتلقائي
              </span>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              {currentUser ? (
                (() => {
                  const myOrders = orders.filter(
                    (o) =>
                      o.buyer.phone === currentUser.phone
                  );

                  if (myOrders.length === 0) {
                    return (
                      <div className="text-center py-8 space-y-2">
                        <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                          <HelpCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-extrabold text-xs text-gray-750">لم تقم بإجراء أي طلبات شحن بعد باسمك</h4>
                        <p className="text-gray-400 text-[10px] max-w-xs mx-auto">تظهر الطلبات التي تقوم بإنشائها برقم هاتفك المعتمد ({currentUser.phone}) هنا فور تأكيدها ترويضاً للخصوصية.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-5">
                      <p className="text-xs text-gray-500 font-bold border-r-4 border-brand-red pr-2">لقد عثرنا على ({myOrders.length}) طلبات شحن مسجلة برقم هاتفك الحالي:</p>
                      
                      {myOrders.map((ord) => {
                        const formattedId = ord.id.replace('order_', '');
                        const trackingStatus = ord.trackingStatus || 'pending';

                        // Badge translation
                        let statusText = 'قيد المراجعة والتحقق';
                        let statusColor = 'bg-amber-100 text-amber-900 border-amber-200';
                        let desc = 'يتم تدقيق طلب السلة حالياً لتأكيده وتوجيهه لأقرب موزع شحنات بالمنطقة.';
                        let progressPercentage = 25;

                        if (trackingStatus === 'preparing') {
                          statusText = 'جاري التجهيز والتغليف';
                          statusColor = 'bg-blue-105 text-blue-805 border-blue-200';
                          desc = 'يقوم الفريق الآن بتغليف محتويات سلتك وتنسيقها مع المندوبين.';
                          progressPercentage = 50;
                        } else if (trackingStatus === 'with_courier') {
                          statusText = 'خرج للتوصيل مع السائق';
                          statusColor = 'bg-indigo-100 text-indigo-900 border-indigo-200 animate-pulse';
                          desc = 'طلبك على الطريق الآن! يرجى إبقاء خط الهاتف مفتوحاً لتسهيل التسليم.';
                          progressPercentage = 75;
                        } else if (trackingStatus === 'delivered') {
                          statusText = 'تم تسليم الشحنة بنجاح 🎉';
                          statusColor = 'bg-emerald-100 text-emerald-900 border-emerald-200';
                          desc = 'تم إتمام التوصيل وسداد المستحقات بالكامل. شكراً لثقتك بنا!';
                          progressPercentage = 100;
                        }

                        return (
                          <div key={ord.id} className="border border-gray-150 rounded-2xl bg-slate-50/20 p-4 space-y-4 hover:shadow-xs transition-all">
                            {/* Order general header */}
                            <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2 text-right">
                              <div>
                                <span className="text-[10px] text-gray-400 font-extrabold block">رقم طلب الشحن الفريد</span>
                                <span className="text-sm font-black text-brand-red"># {formattedId}</span>
                              </div>
                              <div className="text-left select-none">
                                <span className="text-[10px] text-gray-400 font-extrabold block">طريقة السداد وتاريخه</span>
                                <span className="text-[11px] text-gray-650 font-bold">
                                  {ord.paymentMethod === 'BenefitPay' ? 'بنفت باي 🇧🇭' : 'الدفع عند الاستلام 💵'} - {new Date(ord.createdAt).toLocaleDateString('ar-BH')}
                                </span>
                              </div>
                            </div>

                            {/* Tracking flow diagram visual */}
                            <div className="space-y-2 text-right">
                              <div className="flex justify-between items-center flex-row-reverse">
                                <span className="text-xs font-black text-gray-800">حالة خط الشحن الآن:</span>
                                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-black border ${statusColor}`}>
                                  {statusText}
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-brand-red h-full rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>

                              <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1">
                                📢 {desc}
                              </p>
                            </div>

                            {/* Order Products details */}
                            <div className="bg-white border border-gray-150 rounded-xl p-3 space-y-2 text-right">
                              <span className="text-[10px] text-gray-400 font-bold block">محتويات السلة التي تم شراؤها:</span>
                              <div className="space-y-2">
                                {ord.products.map((p, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs flex-row-reverse">
                                    <div className="flex items-center gap-2 flex-row-reverse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                                      <span className="text-gray-805 font-bold">{p.name}</span>
                                    </div>
                                    <span className="text-gray-500 font-mono">الكمية: {p.quantity} حبة × {p.price.toFixed(3)} د.ب</span>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t pt-2 mt-2 flex justify-between items-center text-xs font-black text-gray-950 flex-row-reverse">
                                <span>المبلغ الإجمالي المدفوع:</span>
                                <span className="text-brand-red text-xs">{ord.totalAmount.toFixed(3)} د.ب</span>
                              </div>
                            </div>

                            {/* Note about contact */}
                            <div className="bg-red-50/50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-[11px] text-brand-red font-black text-right">
                              <div className="w-2 h-2 rounded-full bg-brand-red animate-ping shrink-0" />
                              <span>المدير (سيد محمد الحنجري) سيقوم بمراسلتك هاتفياً أو وتساب قريباً بمجرد تغير الحالة لمتابعة التسليم لموقعك.</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div className="bg-rose-55/10 border border-dashed border-rose-100 rounded-2xl p-5 text-center space-y-2.5">
                  <span className="text-lg block">🔐</span>
                  <h4 className="font-extrabold text-xs text-gray-800">تتبع مشترياتك وسلاتك السابقة تلقائياً</h4>
                  <p className="text-gray-550 text-[10.5px] max-w-sm mx-auto leading-relaxed">
                    من خلال إنشاء حساب / تسجيل دخولك برقم هاتفك، سيقوم النظام تلقائياً باستعراض طلبات الشحن السابقة المسجلة باسمك ومتابعة حالتها الحية بدون الحاجة لحفظ رقم الطلب أو كتابته يدوياً!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER COMMUNITY EVENTS TAB INSTEAD */}
      {mainTab === 'events' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm flex flex-col md:flex-row hover:border-red-200 transition-all">
                <img 
                  src={evt.image} 
                  alt={evt.title} 
                  className="w-full md:w-36 h-36 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 flex-1 flex flex-col justify-between text-right">
                  <div>
                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-md ${
                      evt.isOffer ? 'bg-red-100 text-brand-red' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {evt.isOffer ? 'عرض ترويجي' : 'تغطية فعالية تراثية'}
                    </span>
                    <h4 className="font-extrabold text-xs md:text-sm text-gray-900 mt-1">{evt.title}</h4>
                    <p className="text-gray-500 text-[11px] mt-1 line-clamp-2 leading-relaxed">{evt.description}</p>
                  </div>

                  <div className="pt-2 border-t text-[10px] space-y-0.5 text-gray-400">
                    <p>📍 {evt.location}</p>
                    <p>📅 {evt.date}</p>
                    <p className="text-[9px] text-[#D01C1F]">المنظم الرسمي: {evt.organizer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTERACTIVE CUSTOMER ORDER TRACKIER SEARCH BAR WIDGET */}
      <div className="bg-white border rounded-3xl p-5 max-w-xl mx-auto shadow-sm text-right space-y-3">
        <h3 className="font-black text-xs sm:text-sm text-gray-800 border-r-4 border-[#D01C1F] pr-1.5">🚚 تتبع حالة طلبيتي الموحدة</h3>
        <p className="text-[10px] text-gray-550 leading-relaxed font-semibold">تأكد من شحن بضاعتك من الأسر المنتجة بالرقم المباشر أو الرمز الخاص بها:</p>
        
        <form onSubmit={handleTrackSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="أدخل رقم هاتف الشحن أو الرمز (مثال 1001)"
            value={trackOrderId}
            onChange={(e) => setTrackOrderId(e.target.value)}
            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
          />
          <button
            type="submit"
            className="bg-brand-red hover:bg-black text-white text-xs font-black px-4 py-2 rounded-xl"
          >
            تتبع الآن 🔍
          </button>
        </form>

        {trackResult && (
          <div className="bg-slate-50 border rounded-2xl p-3 text-xs animate-fade-in space-y-2">
            {trackResult === 'not_found' ? (
              <p className="text-brand-red font-bold text-center">عذراً، لم نجد أي طلب مسجل بهذا الرقم أو هذا الهاتف حالياً. يرجى مراجعة لوحة تحكم المدير al7anjri@gmail.com لتحديثه.</p>
            ) : (
              <div className="space-y-1 text-right">
                <div className="flex justify-between items-center flex-wrap gap-2 text-[10px]">
                  <span>الرمز الموحد: <strong className="text-gray-900 font-mono">#{trackResult.id.replace('order_','')}</strong></span>
                  <span>المبلغ الكلي: <strong className="text-brand-red font-black">{trackResult.totalAmount.toFixed(3)} د.ب</strong></span>
                </div>
                
                <p>👤 المستلم: <strong>{trackResult.buyer?.name}</strong> ({trackResult.buyer?.phone})</p>
                <p>🏪 المنتج/البائع المتكفل: <strong>{trackResult.vendor?.name}</strong></p>

                <div className="mt-2 pt-2 border-t border-dashed">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">المسار الحالي لرحلة الشحن:</span>
                  <div className={`p-2 rounded-xl text-center font-black text-xs ${
                    trackResult.trackingStatus === 'delivered'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : trackResult.trackingStatus === 'with_courier'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : trackResult.trackingStatus === 'preparing'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200 animate-pulse'
                  }`}>
                    {trackResult.trackingStatus === 'delivered' && '✅ تم التوصيل بنجاح وتسليم الفاتورة'}
                    {trackResult.trackingStatus === 'with_courier' && '🚗 في مسار التوصيل مع المندوب حالياً'}
                    {trackResult.trackingStatus === 'preparing' && '⚙️ جاري تجهيز الطلبيات من الأسر بالقرية'}
                    {(!trackResult.trackingStatus || trackResult.trackingStatus === 'pending') && '⏳ قيد المراجعة الإرشادية لضمان الدفع'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FEEDBACK FIXED TOAST WHEN PRODUCT ADDED */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-6 bg-slate-900 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 border border-white/20"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>تمت إضافة "{addedToast}" إلى سلة التسوق الخاصة بك بنجاح! 🛒</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADVERTISER REQUEST MODAL FORM */}
      {showAdRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-brand-red text-white p-4 flex justify-between items-center">
              <h3 className="font-black text-xs sm:text-sm">طلب مساحة إعلانية ممولة</h3>
              <button 
                onClick={() => setShowAdRequestModal(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-right">
              {adSuccessMessage ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-gray-900 text-xs">تم إرسال طلب لافتتك بنجاح!</h4>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">سيراجع المدير العام al7anjri@gmail.com تفاصيل طلب البانر لبثه فوراً بالواجهة بعد الاتفاق وتنسيق الدفع.</p>
                </div>
              ) : (
                <form onSubmit={handleAdRequestSubmit} className="space-y-3 text-right">
                  <p className="text-[11px] text-gray-450 leading-relaxed font-medium">
                    مملكة البحرين بلد الخير والبركات! أدخل مواصفات إعلاناتك، وسيتصل بك منسق الدعم لتأثيره بالمنصات.
                  </p>

                  <div className="space-y-0.5">
                    <label className="text-[10px] text-gray-700 font-extrabold block">اسم المعلن / شركة النشاط:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مطبخ بهارات المحرق للطبخ"
                      value={adName}
                      onChange={(e) => setAdName(e.target.value)}
                      className="w-full p-2 bg-gray-55 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] text-gray-700 font-extrabold block">رقم وتساب للتنسيق والتحصيل:</label>
                    <input
                      type="tel"
                      required
                      placeholder="+973 39999123"
                      value={adWhatsapp}
                      onChange={(e) => setAdWhatsapp(e.target.value)}
                      className="w-full p-2 bg-gray-55 border border-gray-200 rounded-xl text-xs font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] text-gray-700 font-extrabold block">عنوان الإعلان العريض المكتوب على البانر:</label>
                    <input
                      type="text"
                      required
                      placeholder="تنزيلات كبرى لرمضان المبارك لأسر ديرتنا"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      className="w-full p-2 bg-gray-55 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] text-gray-700 font-extrabold block">رابط الصورة الخارجية (اختياري):</label>
                    <input
                      type="url"
                      placeholder="مثال: http://images.unsplash.com/..."
                      value={adImageUrl}
                      onChange={(e) => setAdImageUrl(e.target.value)}
                      className="w-full p-2 bg-gray-55 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-brand-red hover:bg-black text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      إرسال طلب البث الآن 👋
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VENDOR STOREFRONT & PRODUCT DETAILED OVERLAY */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[110] animate-fade-in overflow-y-auto" dir="rtl">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-auto max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-150 flex flex-col md:flex-row relative">
            
            {/* Close button top corner */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 left-4 bg-black/60 hover:bg-black text-white p-2 rounded-full cursor-pointer z-20 shadow"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Right Column: Hero Product Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-l border-gray-100 text-right">
              <div className="space-y-4">
                {/* Category label badge */}
                <div className="inline-block bg-brand-red/10 text-brand-red font-black text-[10px] px-2.5 py-1 rounded-full">
                  {selectedProduct.category === 'productive_families' ? 'مأكولات ومقرمشات الأسر المنتجة 🥞' : 'مشاريع محلات ديرتنا المميزة 🛠️'}
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-[#A31618] font-black block">الجهة المنتجة: أسرة وطنية معتمدة 🇧🇭</span>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
                    {selectedProduct.name}
                  </h3>
                </div>

                {/* Hero Media Element */}
                <div className="h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-55 border shadow-inner relative">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {selectedProduct.discount && selectedProduct.discount > 0 ? (
                    <div className="absolute top-3 right-3 bg-[#D01C1F] text-white font-black text-xs px-2 py-0.5 rounded-lg shadow-sm">
                      % {selectedProduct.discount} خصم ممتاز
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-700">وصف وتفاصيل المنتج:</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              {/* Action and Price card footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 font-extrabold block">سعر الوحدة الصافي:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-[#D01C1F]">
                      {(selectedProduct.discount && selectedProduct.discount > 0 
                        ? selectedProduct.price * (1 - selectedProduct.discount / 100) 
                        : selectedProduct.price
                      ).toFixed(3)} د.ب
                    </span>
                    {selectedProduct.discount && selectedProduct.discount > 0 ? (
                      <span className="text-xs text-gray-400 line-through">
                        {selectedProduct.price.toFixed(3)} د.ب
                      </span>
                    ) : null}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onAddToCart(selectedProduct, 1);
                    setAddedToast(selectedProduct.name);
                    setTimeout(() => setAddedToast(null), 2000);
                  }}
                  className="bg-[#D01C1F] hover:bg-black text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow cursor-pointer flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>أضف هذا المنتج للسلة 🛒</span>
                </button>
              </div>
            </div>

            {/* Left Column: Same Seller Mini Storefront */}
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-slate-50/55 text-right flex flex-col justify-between">
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200">
                  <h3 className="text-xs sm:text-sm font-black text-gray-800 flex items-center gap-1.5">
                    <span className="text-lg">🏪</span>
                    <span>منتجات مقترحة من نفس المتجر الإنتاجي ✨</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-bold">
                    جميع المنتجات المتناغمة المعروضة من نفس الطرف المعتمد
                  </p>
                </div>

                {/* Grid listing of same vendor items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[44vh] overflow-y-auto pr-1 pad-scroller">
                  {products.filter(p => p.vendorName === selectedProduct.vendorName).map((pItem) => {
                    const itemHasDiscount = pItem.discount && pItem.discount > 0;
                    const itemPrice = itemHasDiscount 
                      ? pItem.price * (1 - (pItem.discount || 0) / 100) 
                      : pItem.price;

                    return (
                      <div 
                        key={pItem.id}
                        onClick={() => setSelectedProduct(pItem)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex gap-2 w-full text-right ${
                          pItem.id === selectedProduct.id 
                            ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300' 
                            : 'bg-white border-gray-150 hover:border-red-200 hover:shadow-sm'
                        }`}
                      >
                        <img 
                          src={pItem.image} 
                          alt={pItem.name} 
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <h5 className="font-extrabold text-[11px] text-gray-900 truncate leading-tight">
                            {pItem.name}
                          </h5>
                          <span className="text-[10px] font-black text-[#D01C1F]">
                            {itemPrice.toFixed(3)} د.ب
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close prompt bottom bar */}
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 font-extrabold">
                <span>تصفح مريح ومستمر لمنتجات الأسر</span>
                <button 
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-[#D01C1F] hover:underline"
                >
                  الرجوع لتصفح الصفحة الرئيسية ←
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
