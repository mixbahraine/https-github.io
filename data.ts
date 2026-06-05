import { User, Product, BahrainEvent, Order, AdRequest } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin_1',
    name: 'سيد محمد الحنجري',
    email: 'al7anjri@gmail.com',
    phone: '+97339123456',
    role: 'admin'
  },
  {
    id: 'user_1',
    name: 'ميثم رضي المعلم',
    email: 'maitham@example.com',
    phone: '+97335678912',
    role: 'user'
  },
  {
    id: 'user_2',
    name: 'سارة جاسم البلوشي',
    email: 'sarah.j@example.com',
    phone: '+97339246810',
    role: 'user'
  },
  {
    id: 'vendor_1',
    name: 'مطبخ أم يوسف للأكلات البحرينية',
    email: 'um_yousif@example.com',
    phone: '+97339999888',
    role: 'vendor',
    deliveryCost: 1.500
  },
  {
    id: 'vendor_2',
    name: 'دار الطيب للعطور والمخلوط البحريني',
    email: 'dar_altayeb@example.com',
    phone: '+97338888123',
    role: 'vendor',
    deliveryCost: 2.000
  },
  {
    id: 'vendor_3',
    name: 'حياكة ديرتنا للمنسوجات والملابس',
    email: 'dyratna@example.com',
    phone: '+97337771234',
    role: 'vendor',
    deliveryCost: 1.800
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'بسكويت تمر بحريني عضوي فاخر',
    description: 'بسكويت التمر البحريني الفاخر المحضر يدوياً بأجود أنواع التمور من نخيل البحرين، مع هيل وزعفران أصلي ومناسب لجميع المناسبات.',
    price: 3.500,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=400',
    vendorId: 'vendor_1',
    vendorName: 'مطبخ أم يوسف للأكلات البحرينية',
    discount: 10,
    category: 'productive_families'
  },
  {
    id: 'prod_2',
    name: 'طقم بهارات بحرينية مخلوطة (حوايج البيت)',
    description: 'تركيبة بهارات بحرينية تقليدية سرية متوارثة، محمصة ومطحونة طازجة تعطي نكهة ديرتنا الأصيلة للكبسة والبرياني والمجبوس البحريني.',
    price: 2.500,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
    vendorId: 'vendor_1',
    vendorName: 'مطبخ أم يوسف للأكلات البحرينية',
    category: 'productive_families'
  },
  {
    id: 'prod_3',
    name: 'دهن عود كمبودي معتق ومخلوط ملكي',
    description: 'مزيج فريد من دهن العود الكمبودي المعتق والورد الطائفي الفاخر مع لمسة من الصندل والمسك. ثبات وفوحان يدوم طويلاً.',
    price: 18.000,
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=400',
    vendorId: 'vendor_2',
    vendorName: 'دار الطيب للعطور والمخلوط البحريني',
    discount: 15,
    category: 'local_projects'
  },
  {
    id: 'prod_4',
    name: 'مرشات عود ومسك للمنازل والمجالس',
    description: 'عبوة مرشة بحجم 500 مل برذاذ عالي الثبات لتعطير غرف الضيوف، الصالونات، والمفارش برائحة تجمع بين الفخامة والترحاب.',
    price: 6.000,
    image: 'https://images.unsplash.com/photo-1528740564264-7a988d39c3cf?auto=format&fit=crop&q=80&w=400',
    vendorId: 'vendor_2',
    vendorName: 'دار الطيب للعطور والمخلوط البحريني',
    category: 'local_projects'
  },
  {
    id: 'prod_5',
    name: 'ثوب نشل بحريني مطرز بخيوط الزري الذهبية',
    description: 'ثوب النشل النسائي البحريني التقليدي الفاخر، صُنع بحرفية تامة من الشيفون عالي الجودة ومطرز بأرقى نقوش الزري الذهبية اللامعة.',
    price: 45.000,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400',
    vendorId: 'vendor_3',
    vendorName: 'حياكة ديرتنا للمنسوجات والملابس',
    category: 'productive_families'
  }
];

export const INITIAL_EVENTS: BahrainEvent[] = [
  {
    id: 'event_1',
    title: 'سوق بسطة البحرين التراثي السنوي',
    description: 'الحدث الأكبر لدعم الأسر البحرينية المنتجة والمشاريع الصغيرة تحت سقف واحد مع فعاليات تراثية وترفيهية حية لجميع أفراد العائلة.',
    location: 'حلبة البحرين الدولية، الصخير',
    date: 'من 12 ديسمبر إلى 20 ديسمبر 2026',
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=600',
    isOffer: false,
    organizer: 'وزارة التنمية الاجتماعية ومحافظة الجنوبية'
  },
  {
    id: 'event_2',
    title: 'مهرجان صيف البحرين والتسوق العائلي',
    description: 'عروض تسوق مدهشة وتخفيضات كبرى تصل إلى 50% لدى جميع المشاريع البحرينية المسجلة، بالإضافة لورش عمل فنية للأطفال.',
    location: 'مجمع الأفنيوز البحرين',
    date: 'من 1 يوليو إلى 31 يوليو 2026',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=600',
    isOffer: true,
    organizer: 'هيئة البحرين للسياحة والمعارض'
  },
  {
    id: 'event_3',
    title: 'ليالي العزف والتراث الشعبي بالمنامة',
    description: 'أمسيات غنائية شعبية يقدمها كبار العازفين والفرق التراثية البحرينية لإحياء الفنون المحلية مثل الفجري والسامري.',
    location: 'باب البحرين، سوق المنامة القديم',
    date: 'كل ليلة جمعة من الساعة 7 مساءً',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
    isOffer: false,
    organizer: 'هيئة البحرين للثقافة والآثار'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'order_1001',
    buyer: {
      name: 'جعفر جلال حسن',
      phone: '+97333554433',
      address: 'سترة، مجمع 609، طريق 913، منزل 14'
    },
    vendor: {
      id: 'vendor_1',
      name: 'مطبخ أم يوسف للأكلات البحرينية',
      phone: '+97339999888'
    },
    products: [
      {
        id: 'prod_1',
        name: 'بسكويت تمر بحريني عضوي فاخر',
        price: 3.150, // After 10% discount from 3.500 is 3.150
        image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=400',
        quantity: 2
      }
    ],
    deliveryCost: 1.500,
    totalAmount: 7.800, // (3.15 * 2) + 1.5
    paymentMethod: 'BenefitPay',
    status: 'new',
    trackingStatus: 'pending',
    createdAt: '2026-06-04T18:45:00Z'
  },
  {
    id: 'order_1002',
    buyer: {
      name: 'نورة عبدالله الكعبي',
      phone: '+97339876123',
      address: 'المحرق، البسيتين، مجمع 228، بناية 42، شقة 11'
    },
    vendor: {
      id: 'vendor_2',
      name: 'دار الطيب للعطور والمخلوط البحريني',
      phone: '+97338888123'
    },
    products: [
      {
        id: 'prod_3',
        name: 'دهن عود كمبودي معتق ومخلوط ملكي',
        price: 15.300, // After 15% discount
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=400',
        quantity: 1
      }
    ],
    deliveryCost: 2.000,
    totalAmount: 17.300, // 15.300 + 2.000
    paymentMethod: 'CashOnDelivery',
    status: 'new',
    trackingStatus: 'preparing',
    createdAt: '2026-06-04T19:30:11Z'
  }
];

export const INITIAL_AD_REQUESTS: AdRequest[] = [
  {
    id: 'ad_1',
    advertiserName: 'مجوهرات الزين البحرينية',
    whatsapp: '+97336111111',
    adType: 'مجوهرات ومعارض صياغة ذهب',
    title: 'تخفيضات حصرية لعملاء تطبيق mix.bh على تشكيلة هدايا العيد الذهبية',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200',
    durationDays: 30,
    status: 'approved',
    createdAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 'ad_2',
    advertiserName: 'مطعم ومقهى نسيج الطين تراثي',
    whatsapp: '+97339222222',
    adType: 'مأكولات شعبية وتراثية',
    title: 'افتتاح الفرع الجديد في قلعة البحرين ووجبة فطور مجانية لشخصين',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200',
    durationDays: 15,
    status: 'pending',
    createdAt: '2026-06-04T12:00:00Z'
  }
];
