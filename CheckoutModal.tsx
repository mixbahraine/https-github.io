import React, { useState } from 'react';
import { Product, User } from '../types';
import { 
  CreditCard, MapPin, Phone, User as UserIcon, X, Check, AlertCircle 
} from 'lucide-react';

interface CheckoutModalProps {
  products: { product: Product; quantity: number }[];
  deliveryCost: number;
  currentUser: User | null;
  onClose: () => void;
  onSubmitOrder: (buyerName: string, buyerPhone: string, buyerAddress: string, paymentMethod: 'BenefitPay' | 'CashOnDelivery') => void;
  onOpenAuth: () => void;
}

export default function CheckoutModal({
  products,
  deliveryCost,
  currentUser,
  onClose,
  onSubmitOrder,
  onOpenAuth
}: CheckoutModalProps) {
  const [buyerName, setBuyerName] = useState(currentUser?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'BenefitPay' | 'CashOnDelivery'>('BenefitPay');
  const [step, setStep] = useState<'details' | 'done'>('details');
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  // Calculate totals
  const itemsTotal = products.reduce((sum, item) => {
    const price = item.product.discount 
      ? item.product.price * (1 - item.product.discount / 100) 
      : item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  const orderGrandTotal = itemsTotal + deliveryCost;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!buyerName || !buyerPhone || !buyerAddress) {
      alert('الرجاء تعبئة كافة الحقول المطلوبة لضمان دقة واستكمال عملية الشحن بنجاح.');
      return;
    }
    
    // Generate order ID
    const randomId = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOrderId(randomId);

    // Call submit handler
    onSubmitOrder(buyerName, buyerPhone, buyerAddress, paymentMethod);
    setStep('done');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto animate-fade-in" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header decoration as red background */}
        <div className="bg-gradient-to-r from-red-750 to-red-850 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] bg-red-900/40 text-red-100 px-2 py-0.5 rounded font-black">mix.bh | الدفع والمراجعة</span>
            <h3 className="text-sm md:text-base font-black mt-1">صفحة الدفع الآمن والتوصيل</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
          {step === 'details' && (
            <form onSubmit={handleNextStep} className="space-y-4 text-right">
              {/* Alert if not logged in */}
              {!currentUser && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 text-xs text-brand-red flex gap-2">
                  <AlertCircle className="w-7 h-7 text-brand-red shrink-0" />
                  <div className="space-y-1">
                    <p className="font-extrabold">التسجيل المسبق مطلوب للشراء:</p>
                    <p className="leading-relaxed text-[11px] text-gray-700">تصفح تطبيق (mix.bh) مجاني بالكامل! ولكن عند تأكيد طلب الشحن، يرجى تسجيل حسابك لضمان تواجد العنوان ورقم الهاتف لدى السائق.</p>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="mt-1 bg-brand-red text-white py-1 px-3 rounded-lg font-black hover:bg-red-700 text-[10px] transition-all"
                    >
                      إنشاء حساب / تسجيل فوري بالمنصة 🔐
                    </button>
                  </div>
                </div>
              )}

              {/* Order summary small box */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                <span className="text-[10px] text-gray-400 font-extrabold block">الملخص الحالي للسلة:</span>
                
                <div className="max-h-36 overflow-y-auto space-y-2.5 pr-1">
                  {products.map((item, idx) => {
                    const price = item.product.discount 
                      ? item.product.price * (1 - item.product.discount / 100) 
                      : item.product.price;
                    return (
                      <div key={idx} className="flex gap-2.5 items-center border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-[11px] text-gray-800 truncate">{item.product.name}</h4>
                          <p className="text-[10px] text-brand-red font-bold">
                            العدد: {item.quantity} حبة × {price.toFixed(3)} د.ب
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 pt-2 text-xs space-y-1 text-gray-600">
                  <div className="flex justify-between items-center text-[11px]">
                    <span>قيمة المبيعات الإجمالية:</span>
                    <span className="font-bold">{itemsTotal.toFixed(3)} د.ب</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>سعر التوصيل الثابت الموحد:</span>
                    <span className="font-bold">{deliveryCost.toFixed(3)} د.ب</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-black text-gray-900 pt-1 border-t border-dashed">
                    <span>المبلغ الكلي المستحق:</span>
                    <span className="text-[#D01C1F] text-sm">{orderGrandTotal.toFixed(3)} د.ب</span>
                  </div>
                </div>
              </div>

              {currentUser && (
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 text-xs border-r-4 border-red-700 pr-1.5">معلومات الاستلام والوجهة:</h4>
                  
                  {/* Name field */}
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-gray-650 font-bold flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-gray-400" /> الاسم الرباعي للمستلم:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سيد محمد الحنجري"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-gray-650 font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> الرقم المباشر للتواصل:
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="مثال: 97339123456"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  {/* Address detailed */}
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-gray-650 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> عنوان التوصيل بالتفصيل:
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="مثال: الرفاع، مجمع 902، بناية 100، شقة 15"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  {/* Payment selection list */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-650 font-bold block">طريقة التحويل المفضلة للدفع:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('BenefitPay')}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                          paymentMethod === 'BenefitPay'
                            ? 'border-red-600 bg-red-50/20'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span className="font-black text-[11px] text-brand-red">حساب بنفت باي 🇧🇭</span>
                        <p className="text-[9px] text-gray-450 mt-1 leading-normal">الدفع يدوي لحساب المدير al7anjri</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CashOnDelivery')}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                          paymentMethod === 'CashOnDelivery'
                            ? 'border-emerald-600 bg-emerald-55/5'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span className="font-bold text-[11px] text-emerald-800">الدفع عند الاستلام 💵</span>
                        <p className="text-[9px] text-gray-450 mt-1 leading-normal">السداد نقداً للمندوب فور التسليم</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit panel */}
              <div className="pt-3 border-t border-gray-200 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-white hover:bg-gray-55 text-gray-700 text-xs font-semibold py-2 rounded-xl border border-gray-250 cursor-pointer text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!currentUser}
                  className={`flex-2 py-2 rounded-xl text-xs font-black text-white transition-all flex items-center justify-center gap-1 ${
                    currentUser 
                      ? 'bg-brand-red hover:bg-[#A31618] cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>تأكيد وشحن {orderGrandTotal.toFixed(3)} د.ب</span>
                </button>
              </div>
            </form>
          )}

          {/* SUCCESS AND ID ONLY PRESENTATION AS REQUESTED */}
          {step === 'done' && (
            <div className="py-8 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-605 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8" />
              </div>

              {/* Clean, minimalist and highly aligned Order ID card */}
              <div className="border border-dashed border-red-200 rounded-3xl bg-red-50/30 p-5 max-w-xs mx-auto space-y-2">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">رقم الطلب الخاص بك</span>
                <span className="text-2xl font-black text-[#D01C1F] tracking-widest block">#{generatedOrderId}</span>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-gray-850">سيتم التواصل معك قريباً</h3>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">يقوم المدير العام والمندوبين بتنسيق وشحن الفاتورة ومراسلتك فورياً.</p>
              </div>

              <div className="pt-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-brand-red hover:bg-[#A31618] text-white font-black text-xs py-2.5 rounded-xl cursor-pointer shadow-sm transition-all"
                >
                  موافق والعودة للرئيسية 👍
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
