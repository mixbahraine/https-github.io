import { useState, useEffect, useRef } from 'react';
import { User, Product, BahrainEvent, Order, AdRequest, CartItem } from './types';
import { 
  INITIAL_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_EVENTS, 
  INITIAL_ORDERS, 
  INITIAL_AD_REQUESTS 
} from './data';
import { motion, AnimatePresence } from 'motion/react';

import AdminPanel from './components/AdminPanel';
import VendorPanel from './components/VendorPanel';
import HomeView from './components/HomeView';
import CheckoutModal from './components/CheckoutModal';
import AnimatedLogo from './components/AnimatedLogo';
import { 
  ShieldCheck, Crown, Bell, ShoppingCart, Trash2 
} from 'lucide-react';

export default function App() {
  // State initialization with localStorage persistence to demonstrate durable mock-database behaviors
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mix_bh_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mix_bh_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [events, setEvents] = useState<BahrainEvent[]>(() => {
    const saved = localStorage.getItem('mix_bh_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mix_bh_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [adRequests, setAdRequests] = useState<AdRequest[]>(() => {
    const saved = localStorage.getItem('mix_bh_ad_requests');
    return saved ? JSON.parse(saved) : INITIAL_AD_REQUESTS;
  });

  // Unique Persistent client cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mix_bh_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Current logged-in simulated context (Starts as standard visitor to keep onboarding clean)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mix_bh_current_user');
    if (saved) return JSON.parse(saved);
    // Default to the first demo buyer user to show logged-in state
    return INITIAL_USERS.find(u => u.role === 'user') || null;
  });

  // Interactive checkout modal trigger state (Hold list of items to buy)
  const [activeCheckout, setActiveCheckout] = useState<{
    products: { product: Product; quantity: number }[];
    deliveryCost: number;
  } | null>(null);

  // Sound and desktop notifications system
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mix_bh_notifications_enabled') === 'true';
  });

  const [lastOrderToast, setLastOrderToast] = useState<Order | null>(null);
  const [showPartnerLogin, setShowPartnerLogin] = useState(false);
  
  // Track previous count of orders
  const previousOrdersCountRef = useRef<number>(orders.length);

  // Play high-fidelity synthesized dual bubble chime using the modern Web Audio API
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Pitch 1: Soft bubble note (A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      // Pitch 2 slightly accented and delayed (C#6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn("Web Audio chimes blocked or unsupported", e);
    }
  };

  // Triggers desktop notifications and in-app toast overlays
  useEffect(() => {
    if (orders.length > previousOrdersCountRef.current) {
      const freshOrder = orders[0]; // Newest order got unshifted at index 0
      if (freshOrder) {
        playNotificationSound();
        setLastOrderToast(freshOrder);

        // Native push desktop notification
        if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
          try {
            const firstProduct = freshOrder.products[0];
            new Notification(`📦 طلب جديد مبيعات: د.ب #${freshOrder.id}`, {
              body: `المنتج: ${firstProduct?.name || 'مشتريات متنوعة'}\nبقيمة: ${freshOrder.totalAmount.toFixed(3)} د.ب\nالزبون: ${freshOrder.buyer.name}`,
              icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=120',
              tag: `mix-order-${freshOrder.id}`
            });
          } catch (err) {
            console.error("Native push error", err);
          }
        }
      }
    }
    previousOrdersCountRef.current = orders.length;
  }, [orders, notificationsEnabled]);

  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      if ("Notification" in window) {
        Notification.requestPermission().then(perm => {
          if (perm === "granted") {
            setNotificationsEnabled(true);
            localStorage.setItem('mix_bh_notifications_enabled', 'true');
            playNotificationSound();
          } else {
            alert("⚠️ يرجى تفعيل إذن الإشعارات من إعدادات المتصفح لكي تصلك إشعارات سطح المكتب للطلبات.");
          }
        });
      } else {
        setNotificationsEnabled(true);
        localStorage.setItem('mix_bh_notifications_enabled', 'true');
        playNotificationSound();
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('mix_bh_notifications_enabled', 'false');
    }
  };

  // Syncing application states into localStorage
  useEffect(() => {
    localStorage.setItem('mix_bh_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mix_bh_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mix_bh_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('mix_bh_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mix_bh_ad_requests', JSON.stringify(adRequests));
  }, [adRequests]);

  useEffect(() => {
    localStorage.setItem('mix_bh_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mix_bh_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mix_bh_current_user');
    }
  }, [currentUser]);

  // CORE CART MANAGEMENT FUNCTIONS
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      } else {
        return [...prev, { product, quantity }];
      }
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // CORE USER FUNCTIONS
  const handleSwitchUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      // Keep state aligned
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        // refresh role properties
        setCurrentUser(users[index]);
      }
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setEvents(INITIAL_EVENTS);
    setOrders(INITIAL_ORDERS);
    setAdRequests(INITIAL_AD_REQUESTS);
    setCart([]);
    setCurrentUser(INITIAL_USERS.find(u => u.role === 'user') || null);
    setActiveCheckout(null);
  };

  // 1. Manual Promotion by Admin al7anjri@gmail.com
  const handlePromoteUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated: User = { ...u, role: 'vendor', deliveryCost: 1.500 };
        // If current modified user is indeed active, update active context instantly
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const handleDemoteUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated: User = { ...u, role: 'user' };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  // 2. Restricted Vendor Actions
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'vendorId' | 'vendorName'>) => {
    if (!currentUser || currentUser.role !== 'vendor') return;

    const added: Product = {
      ...newProd,
      id: 'prod_' + Date.now(),
      vendorId: currentUser.id,
      vendorName: currentUser.name
    };

    setProducts(prev => [added, ...prev]);
  };

  const handleAdminAddProduct = (newProd: Omit<Product, 'id'>) => {
    const added: Product = {
      ...newProd,
      id: 'prod_' + Date.now()
    };
    setProducts(prev => [added, ...prev]);
  };

  const handleEditProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleUpdateDeliveryCost = (cost: number) => {
    if (!currentUser || currentUser.role !== 'vendor') return;

    // Update inside user profile
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, deliveryCost: cost };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));
  };

  // 3. Placing orders from Checkout
  const handlePlaceOrder = (
    buyerName: string, 
    buyerPhone: string, 
    buyerAddress: string, 
    paymentMethod: 'BenefitPay' | 'CashOnDelivery'
  ) => {
    if (!activeCheckout) return;

    // Split purchase list into vendor groups so multiple sellers get individual orders automatically
    const vendorMap: { [vendorId: string]: { vendorName: string; items: typeof activeCheckout.products } } = {};
    activeCheckout.products.forEach(item => {
      const vId = item.product.vendorId;
      if (!vendorMap[vId]) {
        vendorMap[vId] = {
          vendorName: item.product.vendorName,
          items: []
        };
      }
      vendorMap[vId].items.push(item);
    });

    Object.keys(vendorMap).forEach(vId => {
      const groupData = vendorMap[vId];
      const deliveryCost = activeCheckout.deliveryCost;

      // Map product list to correct serializable types structure
      const orderProducts = groupData.items.map(item => {
        const unitPrice = item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100) 
          : item.product.price;
        return {
          id: item.product.id,
          name: item.product.name,
          price: unitPrice,
          image: item.product.image,
          quantity: item.quantity
        };
      });

      const itemsSum = orderProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

      // Create pristine final record
      const newOrder: Order = {
        id: 'order_' + (1000 + orders.length + 1),
        buyer: {
          name: buyerName,
          phone: buyerPhone,
          address: buyerAddress
        },
        vendor: {
          id: vId,
          name: groupData.vendorName,
          phone: users.find(u => u.id === vId)?.phone || '+97339999888'
        },
        products: orderProducts,
        deliveryCost: deliveryCost,
        totalAmount: itemsSum + deliveryCost,
        paymentMethod,
        status: 'new',
        trackingStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      setOrders(prev => [newOrder, ...prev]);

      // Remove checked out items from client shopping cart
      const checkedIds = orderProducts.map(p => p.id);
      setCart(prev => prev.filter(item => !checkedIds.includes(item.product.id)));
    });

    setActiveCheckout(null);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // 4. Quick Simulator trigger: Instantly inserts a virtual live order from the community
  const handleSimulateLiveOrder = () => {
    const buyers = [
      { name: 'جعفر جلال عيسى', phone: '+97336123456', address: 'سند، مجمع 711، طريق 63، فيلا 9' },
      { name: 'إيمان صالح الدوسري', phone: '+97339555123', address: 'عراد، مجمع 240، بناية 80، شقة 2' },
      { name: 'سلمان خليفة فيصل', phone: '+97333221199', address: 'سترة، شارع الخارج، مجمع 606، منزل 4' }
    ];

    const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
    // Random product
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const vendorRecord = users.find(u => u.id === randomProduct.vendorId);
    const calculatedDelivery = vendorRecord?.deliveryCost !== undefined ? vendorRecord.deliveryCost : 1.500;

    const finalPrice = randomProduct.discount 
      ? randomProduct.price * (1 - randomProduct.discount / 100) 
      : randomProduct.price;

    const simulatedOrder: Order = {
      id: 'order_sim_' + (Date.now().toString().substring(8)),
      buyer: randomBuyer,
      vendor: {
        id: randomProduct.vendorId,
        name: randomProduct.vendorName,
        phone: vendorRecord?.phone || '+97338888123'
      },
      products: [
        {
          id: randomProduct.id,
          name: randomProduct.name,
          price: finalPrice,
          image: randomProduct.image,
          quantity: Math.floor(Math.random() * 2) + 1
        }
      ],
      deliveryCost: calculatedDelivery,
      totalAmount: (finalPrice * 1) + calculatedDelivery,
      paymentMethod: Math.random() > 0.5 ? 'BenefitPay' : 'CashOnDelivery',
      status: 'new',
      trackingStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [simulatedOrder, ...prev]);
  };

  // 5. Ad Management Actions
  const handleAddAdRequest = (newAd: Omit<AdRequest, 'id' | 'status' | 'createdAt'>) => {
    const createdAd: AdRequest = {
      ...newAd,
      id: 'ad_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setAdRequests(prev => [createdAd, ...prev]);
  };

  const handleApproveAd = (adId: string) => {
    setAdRequests(prev => prev.map(a => a.id === adId ? { ...a, status: 'approved' } : a));
  };

  const handleRejectAd = (adId: string) => {
    setAdRequests(prev => prev.filter(a => a.id !== adId));
  };

  // Helper variables for current role routing
  const isSuperAdmin = currentUser?.email === 'al7anjri@gmail.com';
  const isVendor = currentUser?.role === 'vendor' && !isSuperAdmin;

  return (
    <div id="mix-bh-root-container" className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-red-205">
      
      {/* 2. REAL BRAND NAVBAR WITH DELIBERATE USER BRANDING REQUIREMENTS */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 px-4 md:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          
          {/* BRAND INFORMATION DELIGENTLY PLACED NEXT TO LOGO */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <AnimatedLogo size="sm" />
            <div className="bg-brand-red/15 h-8 w-px hidden sm:block" />
            
            <div className="text-right">
              <h2 className="text-xs md:text-sm font-black text-gray-950 leading-tight">
                دليل مملكة البحرين المباشر والأسر المنتجة 🇧🇭
              </h2>
              {/* Active simulated logged-in username & details cleanly nested next to brand info */}
              <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                {currentUser ? (
                  <div className="flex items-center gap-1.5 text-gray-650 bg-red-50/50 px-2 py-0.5 rounded-full border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>مرحباً بك: <strong className="text-brand-red">{currentUser.name}</strong></span>
                    <button 
                      onClick={() => handleSwitchUser(null)}
                      className="text-gray-400 hover:text-red-700 underline font-extrabold cursor-pointer text-[9px] mr-1.5"
                    >
                      تسجيل خروج
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowPartnerLogin(true)}
                    className="text-brand-red bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-full font-black cursor-pointer transition-all hover:scale-102 flex items-center gap-1 shadow-xs"
                  >
                    🔐 الدخول والتحكم للشركاء والمدونة
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info status badges right aligned */}
          <div className="flex items-center gap-2.5">
            {isSuperAdmin && (
              <span className="bg-red-100 text-brand-red text-[11px] px-3 py-1 rounded-full font-black flex items-center gap-1 shadow-xs">
                <Crown className="w-3.5 h-3.5" /> لوحة الإشراف المباشرة (سيد محمد الحنجري)
              </span>
            )}
            
            {isVendor && (
              <span className="bg-emerald-105 text-emerald-805 text-[11px] px-3 py-1 rounded-full font-black flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> مساحتك المقيدة كبائع
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 3. CORE PAGE WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* BANNER NOTIFICATION IF ADMIN */}
        {isSuperAdmin && (
          <div className="bg-gradient-to-r from-red-800 to-amber-900 text-white p-4 rounded-2.5xl flex items-center justify-between gap-3 flex-wrap text-right" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <p className="text-xs md:text-sm font-semibold">
                أهلاً بك يا <strong>مُدير المنصة (سيد محمد الحنجري)</strong>. لوحة القيادة العليا مفعلة وتلقائية أدناه. قم بالنزول لرؤية التغييرات المباشرة!
              </p>
            </div>
            <div className="text-[10px] bg-white/20 px-2.0 py-0.5 rounded font-mono">al7anjri@gmail.com</div>
          </div>
        )}

        {/* ADMIN WORKSPACE */}
        {isSuperAdmin && (
          <AdminPanel 
            users={users}
            orders={orders}
            adRequests={adRequests}
            products={products}
            onPromoteUser={handlePromoteUser}
            onDemoteUser={handleDemoteUser}
            onApproveAd={handleApproveAd}
            onRejectAd={handleRejectAd}
            onAddAdRequest={handleAddAdRequest}
            onDeleteOrder={handleDeleteOrder}
            onSimulateOrder={handleSimulateLiveOrder}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleToggleNotifications}
            onTestNotificationSound={playNotificationSound}
            onAddProduct={handleAdminAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {/* RESTRICTED VENDOR WORKSPACE */}
        {isVendor && currentUser && (
          <VendorPanel 
            currentUser={currentUser}
            vendorProducts={products.filter(p => p.vendorId === currentUser.id)}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateDeliveryCost={handleUpdateDeliveryCost}
          />
        )}

        {/* USER-FACING HOME MARKETPLACE VIEW */}
        <div>
          {isVendor && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-100 p-3.5 rounded-2xl mb-5 text-xs text-right" dir="rtl">
              📢 <strong>ملاحظة بائع:</strong> أنت بائع معتمد بالمنصة الآن. تصفح موقع الزوار بالأسفل لمعاينة سلع متجرك وإشعال المنافسة!
            </div>
          )}

          <HomeView 
            products={products}
            events={events}
            ads={adRequests}
            currentUser={currentUser}
            cart={cart}
            orders={orders}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onClearCart={handleClearCart}
            onOpenCheckout={(checkoutItems) => {
              // Extract unique vendor delivery
              const vId = checkoutItems[0].product.vendorId;
              const vendorRecord = users.find(u => u.id === vId);
              const calculatedDelivery = vendorRecord?.deliveryCost !== undefined ? vendorRecord.deliveryCost : 1.500;

              setActiveCheckout({
                products: checkoutItems,
                deliveryCost: calculatedDelivery
              });
            }}
            onSubmitAdRequest={handleAddAdRequest}
            onAuthLogin={(user) => setCurrentUser(user)}
            onAuthLogout={() => setCurrentUser(null)}
            onAuthRegister={(name, phone, email) => {
              const newUser: User = {
                id: 'user_custom_' + Date.now(),
                name,
                phone,
                email,
                role: 'user'
              };
              setUsers(prev => [...prev, newUser]);
              setCurrentUser(newUser);
            }}
          />
        </div>
      </main>

      {/* 4. FAST CHECKOUT SECURE MODAL */}
      {activeCheckout && (
        <CheckoutModal 
          products={activeCheckout.products}
          deliveryCost={activeCheckout.deliveryCost}
          currentUser={currentUser}
          onClose={() => setActiveCheckout(null)}
          onSubmitOrder={handlePlaceOrder}
          onOpenAuth={() => {
            alert('يرجى تسجيل حساب موحد فوري برقم هاتفك أولاً بالمنصة لإتمام عملية الشحن والتواصل.');
          }}
        />
      )}

      {/* REAL-TIME NOTIFICATION OVERLAY TOAST */}
      <AnimatePresence>
        {lastOrderToast && (
          <motion.div
            key={lastOrderToast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[420px] bg-slate-900 border-l-4 border-brand-red text-white p-5 rounded-2xl shadow-2xl z-50 overflow-hidden"
            dir="rtl"
            id="creative-order-toast"
          >
            {/* Top red progress alert */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-brand-red animate-pulse" />
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping" />
                <span className="text-xs font-black text-brand-red tracking-wide flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 fill-brand-red text-brand-red" /> طلب فوري حي الآن! 🇧🇭
                </span>
              </div>
              <button 
                onClick={() => setLastOrderToast(null)}
                className="text-slate-400 hover:text-white text-xs bg-white/10 hover:bg-white/25 w-6 h-6 rounded-full flex items-center justify-center font-bold transition-all"
              >
                ×
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <img 
                src={lastOrderToast.products[0]?.image} 
                alt={lastOrderToast.products[0]?.name} 
                className="w-14 h-14 rounded-xl object-cover border border-white/20"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className="text-[10px] text-slate-450 font-bold">رقم الطلب #{lastOrderToast.id}</p>
                    <span className="text-[10px] text-slate-405 font-mono">{new Date(lastOrderToast.createdAt).toLocaleTimeString('ar-BH', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h4 className="text-xs font-black truncate text-white mb-1 leading-snug">
                    {lastOrderToast.products[0]?.name} {lastOrderToast.products.length > 1 && `(+${lastOrderToast.products.length - 1} سلع أخرى)`}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 text-xs">
                  <span className="bg-white/15 px-2 py-0.5 rounded text-[10px] font-bold">الكمية: {lastOrderToast.products.reduce((sum, p) => sum + p.quantity, 0)}</span>
                  <span className="text-emerald-450 font-black">{lastOrderToast.totalAmount.toFixed(3)} د.ب شامل التوصيل</span>
                </div>
              </div>
            </div>

            {/* Quick Buyer metadata */}
            <div className="text-[11px] text-slate-300 mt-2 bg-white/5 p-2 rounded-lg border border-white/5 space-y-0.5">
              <p>👤 المستلم: <strong className="text-white">{lastOrderToast.buyer.name}</strong> ({lastOrderToast.buyer.phone})</p>
              <p>📍 الوجهة لـ: {lastOrderToast.buyer.address}</p>
              <p>🏪 البائع المتكفل: {lastOrderToast.vendor.name}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setLastOrderToast(null);
                  const adminW = document.getElementById('super-admin-panel');
                  if (adminW) {
                    adminW.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-brand-red hover:bg-red-700 text-white font-extrabold text-[11px] px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md hover:shadow-red-900/30"
              >
                فتح في لوحة الإدارة العامة 👑
              </button>
              <button
                onClick={() => setLastOrderToast(null)}
                className="bg-white/10 hover:bg-white/20 text-slate-350 hover:text-white font-black text-[11px] px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                تجاهل
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4.5 BEAUTIFUL PARTNER/ADMIN QUICK LOGIN MODAL (Requested to replace simulator) */}
      {showPartnerLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-fade-in" dir="rtl">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 p-5 space-y-4 text-right relative animate-scale-up">
            {/* Close button */}
            <button 
              onClick={() => setShowPartnerLogin(false)}
              className="absolute top-4 left-4 text-xs font-black bg-gray-50 hover:bg-gray-100 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all border"
            >
              ×
            </button>

            <div className="space-y-1">
              <span className="text-[9px] bg-red-50 text-brand-red px-2 py-0.5 rounded font-black inline-block">حسابات وبث مباشر 🇧🇭</span>
              <h3 className="text-sm font-black text-gray-900">تسجيل الدخول وبوابة التحكم</h3>
              <p className="text-[10px] text-gray-500 leading-normal">اختر هويتك لتفعيل لوحة التحكم أو قم بتسجيل حسابك برقم هاتف مخصص لتتبع طلبياتك تلقائياً.</p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[9px] text-gray-400 font-extrabold block uppercase tracking-wider">الحسابات التجريبية المضمنة للشركاء:</span>
              
              <button
                onClick={() => {
                  const adminUser = users.find(u => u.email === 'al7anjri@gmail.com') || {
                    id: 'admin_root',
                    name: 'سيد محمد الحنجري',
                    email: 'al7anjri@gmail.com',
                    phone: '97339123456',
                    role: 'admin'
                  };
                  handleSwitchUser(adminUser as User);
                  setShowPartnerLogin(false);
                }}
                className="w-full text-right p-3 rounded-xl border border-red-200 hover:border-red-400 bg-red-50/10 hover:bg-red-50/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <strong className="text-xs text-[#D01C1F] block">👑 مدير المنصة (سيد محمد الحنجري)</strong>
                  <span className="text-[9px] text-gray-450 font-mono">البريد المعتمد: al7anjri@gmail.com</span>
                </div>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black group-hover:scale-105 transition-all">تفعيل الإشراف 🔐</span>
              </button>

              <button
                onClick={() => {
                  const vendorUser = users.find(u => u.role === 'vendor' && u.email !== 'al7anjri@gmail.com') || {
                    id: 'vendor_prod_demo',
                    name: 'مطبخ أم حور للأكلات البحرينية 🇧🇭',
                    email: 'um.hoor@gmail.com',
                    phone: '97333554411',
                    role: 'vendor',
                    deliveryCost: 1.500
                  };
                  handleSwitchUser(vendorUser as User);
                  setShowPartnerLogin(false);
                }}
                className="w-full text-right p-3 rounded-xl border border-emerald-200 hover:border-emerald-400 bg-emerald-50/10 hover:bg-emerald-50/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <strong className="text-xs text-emerald-800 block">🍳 بائع وصانع حرفي معتمد</strong>
                  <span className="text-[9px] text-gray-450 font-mono">إدارة، رفع وبث منتجات متجرك الخاصة</span>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-black group-hover:scale-105 transition-all">مساحة البائع 🔐</span>
              </button>
            </div>

            {/* Registration Input Form */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <span className="text-[9px] text-gray-400 font-extrabold block">إنشاء حساب زائر بحريني جديد:</span>
              <form onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                const name = (f.elements.namedItem('regName') as HTMLInputElement).value;
                const phone = (f.elements.namedItem('regPhone') as HTMLInputElement).value;
                const email = (f.elements.namedItem('regEmail') as HTMLInputElement).value;
                if(!name || !phone) {
                  alert('يرجى ملء الاسم الكامل ورقم الهاتف لتجهيز السلة بنجاح.');
                  return;
                }
                const newUser: User = {
                  id: 'user_custom_' + Date.now(),
                  name,
                  phone,
                  email: email || `${Date.now()}@mix.bh`,
                  role: 'user'
                };
                setUsers(prev => [...prev, newUser]);
                handleSwitchUser(newUser);
                setShowPartnerLogin(false);
              }} className="space-y-2 text-right">
                <input 
                  name="regName"
                  required
                  type="text" 
                  placeholder="الاسم الرباعي للمشتري..."
                  className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-white text-right"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    name="regPhone"
                    required
                    type="tel" 
                    placeholder="رقم الهاتف..."
                    className="p-2 border border-gray-200 rounded-xl text-xs bg-white text-left font-mono"
                    dir="ltr"
                  />
                  <input 
                    name="regEmail"
                    type="email" 
                    placeholder="البريد (اختياري)..."
                    className="p-2 border border-gray-200 rounded-xl text-xs bg-white text-left font-mono"
                    dir="ltr"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white font-black text-xs py-2 rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1 shadow"
                >
                  🚀 تسجيل الدخول والبدء كزائر جديد بالكامل
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. ROYAL FOOTER */}
      <footer className="bg-white border-t border-gray-150 py-8 px-4 text-center mt-auto" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex justify-center items-center gap-2">
            <span className="w-4 h-3 bg-brand-red rounded-sm inline-block" />
            <span className="w-4 h-3 bg-white border border-gray-200 rounded-sm inline-block" />
            <span className="text-gray-450 text-xs font-black">mix.bh ديرتنا البحرين الموحدة</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-lg mx-auto">
            منصة تضامنية متكاملة لتسويق فخر الأسر البحرينية المنتجة، ومصانع وورش طموحات الشباب المحلي مع دليل تغطية متكامل للخصومات والفعاليات. كافة المبيعات تدار بضمان ووساطة مغلقة تامة من المشرف العام مجاناً.
          </p>
          <div className="text-[10px] text-gray-400 font-mono">
            © 2026 mix.bh - al7anjri@gmail.com. جميع الحقوق معتمدة ومحفوظة للجهة المطورة و سيد محمد الحنجري.
          </div>
        </div>
      </footer>
    </div>
  );
}
