// Mock data for Vietnamese Car Marketplace

export interface CarListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: 'Xăng' | 'Dầu' | 'Điện' | 'Hybrid';
  transmission: 'Số sàn' | 'Số tự động';
  locationProvince: string;
  description: string;
  status: 'active' | 'pending' | 'sold' | 'hidden';
  images: string[];
  isVerified: boolean;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  createdAt: string;
  features: string[];
  color: string;
  origin: 'Trong nước' | 'Nhập khẩu';
  seats: number;
}

export interface PlateListing {
  id: string;
  plateNumber: string;
  province: string;
  vehicleType: 'Ô tô' | 'Xe máy';
  price: number;
  originalAuctionPrice: number;
  originalAuctionDate: string;
  description: string;
  status: 'active' | 'pending' | 'sold';
  images: string[];
  hasRegistration: boolean;
  hasTransferPaper: boolean;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  createdAt: string;
  views: number;
}

// Vietnamese car brands and models
export const carBrands = [
  { name: 'Toyota', models: ['Camry', 'Corolla Altis', 'Vios', 'Fortuner', 'Land Cruiser', 'Innova', 'Yaris', 'Rush'] },
  { name: 'Honda', models: ['City', 'Civic', 'CR-V', 'HR-V', 'Accord', 'BR-V'] },
  { name: 'Mazda', models: ['Mazda 2', 'Mazda 3', 'Mazda 6', 'CX-3', 'CX-5', 'CX-8', 'BT-50'] },
  { name: 'Hyundai', models: ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Grand i10', 'Creta', 'Stargazer'] },
  { name: 'Kia', models: ['Morning', 'Seltos', 'Sportage', 'Sorento', 'Carnival', 'Cerato', 'K3'] },
  { name: 'Ford', models: ['Ranger', 'Everest', 'Territory', 'Explorer', 'EcoSport'] },
  { name: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class'] },
  { name: 'BMW', models: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7'] },
  { name: 'VinFast', models: ['VF 8', 'VF 9', 'VF e34', 'Lux A2.0', 'Lux SA2.0', 'Fadil'] },
  { name: 'Mitsubishi', models: ['Xpander', 'Outlander', 'Pajero Sport', 'Attrage', 'Triton'] },
];

export const provinces = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Bà Rịa - Vũng Tàu', 'Quảng Ninh',
  'Thừa Thiên Huế', 'Lâm Đồng', 'Bắc Ninh', 'Hưng Yên', 'Thanh Hóa',
  'Nghệ An', 'Long An', 'Bình Thuận', 'Ninh Bình', 'Hà Nam'
];

// Generate mock car listings
export const mockCarListings: CarListing[] = [
  {
    id: 'car-1',
    title: 'Toyota Camry 2.5Q 2022 - Xe đẹp như mới',
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 1150000000,
    mileage: 25000,
    fuel: 'Xăng',
    transmission: 'Số tự động',
    locationProvince: 'Hà Nội',
    description: 'Xe gia đình sử dụng, bảo dưỡng định kỳ tại hãng. Nội thất còn mới, không va chạm. Biển Hà Nội đẹp.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    isVerified: true,
    sellerId: 'seller-1',
    sellerName: 'Nguyễn Văn An',
    sellerPhone: '0901234567',
    createdAt: '2024-01-15',
    features: ['Cửa sổ trời', 'Ghế da', 'Camera 360', 'Cảm biến va chạm', 'Đèn LED'],
    color: 'Trắng ngọc trai',
    origin: 'Nhập khẩu',
    seats: 5,
  },
  {
    id: 'car-2',
    title: 'Honda CR-V 1.5L Turbo 2023 - Full option',
    brand: 'Honda',
    model: 'CR-V',
    year: 2023,
    price: 980000000,
    mileage: 12000,
    fuel: 'Xăng',
    transmission: 'Số tự động',
    locationProvince: 'TP. Hồ Chí Minh',
    description: 'Xe mới mua, ít đi, full option bản cao cấp nhất. Còn bảo hành chính hãng.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    isVerified: true,
    sellerId: 'seller-2',
    sellerName: 'Trần Minh Đức',
    sellerPhone: '0912345678',
    createdAt: '2024-01-10',
    features: ['Honda Sensing', 'Ghế chỉnh điện', 'Màn hình cảm ứng 9 inch', 'Apple CarPlay'],
    color: 'Đen ánh kim',
    origin: 'Trong nước',
    seats: 7,
  },
  {
    id: 'car-3',
    title: 'Mazda CX-5 2.0 Premium 2021',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2021,
    price: 785000000,
    mileage: 45000,
    fuel: 'Xăng',
    transmission: 'Số tự động',
    locationProvince: 'Đà Nẵng',
    description: 'Xe chính chủ sử dụng, đi đúng km. Bảo dưỡng định kỳ, nội thất sạch sẽ.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg'],
    isVerified: false,
    sellerId: 'seller-3',
    sellerName: 'Lê Hoàng Nam',
    sellerPhone: '0923456789',
    createdAt: '2024-01-08',
    features: ['BOSE', 'Cửa sổ trời', 'Ghế da Nappa', 'Đèn pha thích ứng'],
    color: 'Đỏ pha lê',
    origin: 'Trong nước',
    seats: 5,
  },
  {
    id: 'car-4',
    title: 'VinFast VF 8 Plus 2023 - Xe điện thông minh',
    brand: 'VinFast',
    model: 'VF 8',
    year: 2023,
    price: 1050000000,
    mileage: 8000,
    fuel: 'Điện',
    transmission: 'Số tự động',
    locationProvince: 'Hải Phòng',
    description: 'Xe điện VinFast VF 8 bản Plus, đầy đủ tính năng tự lái cấp 2. Pin còn 98%.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    isVerified: true,
    sellerId: 'seller-4',
    sellerName: 'Phạm Thị Hương',
    sellerPhone: '0934567890',
    createdAt: '2024-01-05',
    features: ['Tự lái cấp 2', 'Màn hình 15.6 inch', 'Sạc nhanh', 'Kết nối 4G'],
    color: 'Xanh Neptune',
    origin: 'Trong nước',
    seats: 5,
  },
  {
    id: 'car-5',
    title: 'Mercedes-Benz C300 AMG 2022',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2022,
    price: 1680000000,
    mileage: 18000,
    fuel: 'Xăng',
    transmission: 'Số tự động',
    locationProvince: 'TP. Hồ Chí Minh',
    description: 'Mercedes C300 AMG Line, xe đẹp như mới, full option. Biển số VIP.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    isVerified: true,
    sellerId: 'seller-5',
    sellerName: 'Vũ Đình Tuấn',
    sellerPhone: '0945678901',
    createdAt: '2024-01-03',
    features: ['AMG Package', 'Burmester', 'Cửa sổ trời toàn cảnh', 'Digital Light'],
    color: 'Trắng',
    origin: 'Nhập khẩu',
    seats: 5,
  },
  {
    id: 'car-6',
    title: 'Hyundai Tucson 2.0 AT 2023',
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2023,
    price: 865000000,
    mileage: 15000,
    fuel: 'Xăng',
    transmission: 'Số tự động',
    locationProvince: 'Bình Dương',
    description: 'Tucson thế hệ mới, thiết kế đẹp, tiết kiệm nhiên liệu. Còn bảo hành 4 năm.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg'],
    isVerified: true,
    sellerId: 'seller-6',
    sellerName: 'Ngô Thanh Tùng',
    sellerPhone: '0956789012',
    createdAt: '2024-01-01',
    features: ['Smart Sense', 'Ghế thông gió', 'Màn hình 10.25 inch', 'Sạc không dây'],
    color: 'Xám',
    origin: 'Trong nước',
    seats: 5,
  },
  {
    id: 'car-7',
    title: 'Ford Ranger Wildtrak 2.0L Bi-Turbo 2022',
    brand: 'Ford',
    model: 'Ranger',
    year: 2022,
    price: 920000000,
    mileage: 35000,
    fuel: 'Dầu',
    transmission: 'Số tự động',
    locationProvince: 'Đồng Nai',
    description: 'Ranger Wildtrak bản cao cấp nhất, động cơ Bi-Turbo mạnh mẽ. Xe còn rất đẹp.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    isVerified: false,
    sellerId: 'seller-7',
    sellerName: 'Đặng Văn Hải',
    sellerPhone: '0967890123',
    createdAt: '2023-12-28',
    features: ['SYNC 3', 'Camera 360', 'Ghế da', 'Nắp thùng điện'],
    color: 'Cam',
    origin: 'Nhập khẩu',
    seats: 5,
  },
  {
    id: 'car-8',
    title: 'Kia Seltos 1.4 Turbo Premium 2023',
    brand: 'Kia',
    model: 'Seltos',
    year: 2023,
    price: 719000000,
    mileage: 10000,
    fuel: 'Xăng',
    transmission: 'Số tự động',
    locationProvince: 'Cần Thơ',
    description: 'Seltos bản Turbo cao cấp, trang bị đầy đủ. Xe ít đi, còn mới 99%.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg'],
    isVerified: true,
    sellerId: 'seller-8',
    sellerName: 'Bùi Thị Lan',
    sellerPhone: '0978901234',
    createdAt: '2023-12-25',
    features: ['ADAS', 'Cửa sổ trời', 'Màn hình HUD', 'Điều hòa tự động 2 vùng'],
    color: 'Xanh dương',
    origin: 'Trong nước',
    seats: 5,
  },
  {
    id: 'car-9',
    title: 'Toyota Fortuner Legender 2.8 AT 4x4 2023',
    brand: 'Toyota',
    model: 'Fortuner',
    year: 2023,
    price: 1375000000,
    mileage: 20000,
    fuel: 'Dầu',
    transmission: 'Số tự động',
    locationProvince: 'Hà Nội',
    description: 'Fortuner Legender bản cao cấp nhất, 2 cầu, động cơ 2.8L mạnh mẽ.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    isVerified: true,
    sellerId: 'seller-9',
    sellerName: 'Hoàng Minh Quân',
    sellerPhone: '0989012345',
    createdAt: '2023-12-20',
    features: ['Toyota Safety Sense', 'JBL', 'Ghế chỉnh điện 10 hướng', 'Phanh đĩa 4 bánh'],
    color: 'Đen',
    origin: 'Nhập khẩu',
    seats: 7,
  },
  {
    id: 'car-10',
    title: 'BMW X5 xDrive40i 2021',
    brand: 'BMW',
    model: 'X5',
    year: 2021,
    price: 2850000000,
    mileage: 30000,
    fuel: 'Xăng',
    transmission: 'Số tự động',
    locationProvince: 'TP. Hồ Chí Minh',
    description: 'BMW X5 bản xDrive40i, xe nhập Mỹ, full option. Biển số đẹp.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    isVerified: true,
    sellerId: 'seller-10',
    sellerName: 'Lý Quốc Khánh',
    sellerPhone: '0990123456',
    createdAt: '2023-12-15',
    features: ['Harman Kardon', 'Ghế massage', 'Cửa hít', 'Driving Assistant Pro'],
    color: 'Xanh rêu',
    origin: 'Nhập khẩu',
    seats: 7,
  },
  {
    id: 'car-11',
    title: 'Mitsubishi Xpander AT 2022',
    brand: 'Mitsubishi',
    model: 'Xpander',
    year: 2022,
    price: 545000000,
    mileage: 40000,
    fuel: 'Xăng',
    transmission: 'Số tự động',
    locationProvince: 'Khánh Hòa',
    description: 'Xpander bản AT, xe gia đình 7 chỗ tiện dụng. Tiết kiệm nhiên liệu.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg'],
    isVerified: false,
    sellerId: 'seller-11',
    sellerName: 'Trương Văn Minh',
    sellerPhone: '0901234568',
    createdAt: '2023-12-10',
    features: ['Màn hình cảm ứng', 'Camera lùi', 'Cảm biến sau', 'Khởi động nút bấm'],
    color: 'Bạc',
    origin: 'Trong nước',
    seats: 7,
  },
  {
    id: 'car-12',
    title: 'Honda City RS 2023 - Bản thể thao',
    brand: 'Honda',
    model: 'City',
    year: 2023,
    price: 599000000,
    mileage: 5000,
    fuel: 'Xăng',
    transmission: 'Số tự động',
    locationProvince: 'Quảng Ninh',
    description: 'City RS bản thể thao, đầy đủ Honda Sensing. Xe gần như mới 100%.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    isVerified: true,
    sellerId: 'seller-12',
    sellerName: 'Phan Anh Tuấn',
    sellerPhone: '0912345679',
    createdAt: '2023-12-05',
    features: ['Honda Sensing', 'Ghế da', 'LaneWatch', 'Cốp mở điện'],
    color: 'Đỏ',
    origin: 'Trong nước',
    seats: 5,
  },
];

// Generate mock plate listings (biển số đã đấu giá - rao bán lại)
export const mockPlateListings: PlateListing[] = [
  {
    id: 'plate-1',
    plateNumber: '30A-888.88',
    province: 'Hà Nội',
    vehicleType: 'Ô tô',
    price: 2500000000,
    originalAuctionPrice: 2150000000,
    originalAuctionDate: '2024-01-15',
    description: 'Biển số siêu đẹp, tứ quý 8 - con số may mắn, phát tài. Đã trúng đấu giá từ Bộ Công an, giấy tờ đầy đủ, sang tên nhanh chóng.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg'],
    hasRegistration: true,
    hasTransferPaper: true,
    sellerId: 'seller-1',
    sellerName: 'Nguyễn Văn An',
    sellerPhone: '0901234567',
    createdAt: '2024-12-20',
    views: 1250,
  },
  {
    id: 'plate-2',
    plateNumber: '51G-666.66',
    province: 'TP. Hồ Chí Minh',
    vehicleType: 'Ô tô',
    price: 2200000000,
    originalAuctionPrice: 1850000000,
    originalAuctionDate: '2024-01-10',
    description: 'Biển số lộc phát, tứ quý 6 cực đẹp. Biển Sài Gòn hot, giấy tờ pháp lý rõ ràng, hỗ trợ sang tên toàn quốc.',
    status: 'active',
    images: ['/placeholder.svg'],
    hasRegistration: true,
    hasTransferPaper: true,
    sellerId: 'seller-2',
    sellerName: 'Trần Minh Đức',
    sellerPhone: '0912345678',
    createdAt: '2024-12-18',
    views: 980,
  },
  {
    id: 'plate-3',
    plateNumber: '43A-111.11',
    province: 'Đà Nẵng',
    vehicleType: 'Ô tô',
    price: 450000000,
    originalAuctionPrice: 350000000,
    originalAuctionDate: '2024-02-01',
    description: 'Biển ngũ quý 1, độc nhất vô nhị. Đã hoàn tất thủ tục đấu giá, sẵn sàng sang tên.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    hasRegistration: true,
    hasTransferPaper: true,
    sellerId: 'seller-3',
    sellerName: 'Lê Hoàng Nam',
    sellerPhone: '0923456789',
    createdAt: '2024-12-15',
    views: 650,
  },
  {
    id: 'plate-4',
    plateNumber: '29A-567.89',
    province: 'Hà Nội',
    vehicleType: 'Ô tô',
    price: 550000000,
    originalAuctionPrice: 450000000,
    originalAuctionDate: '2024-01-18',
    description: 'Biển số tiến lên 56789, rất đẹp và ý nghĩa. Thích hợp cho người làm kinh doanh.',
    status: 'active',
    images: ['/placeholder.svg'],
    hasRegistration: true,
    hasTransferPaper: false,
    sellerId: 'seller-4',
    sellerName: 'Phạm Thị Hương',
    sellerPhone: '0934567890',
    createdAt: '2024-12-10',
    views: 420,
  },
  {
    id: 'plate-5',
    plateNumber: '59A-999.99',
    province: 'TP. Hồ Chí Minh',
    vehicleType: 'Ô tô',
    price: 3800000000,
    originalAuctionPrice: 3200000000,
    originalAuctionDate: '2024-01-05',
    description: 'Biển ngũ quý 9, cực kỳ hiếm và giá trị. Biển số VIP nhất trong đợt đấu giá, giấy tờ hoàn chỉnh.',
    status: 'active',
    images: ['/placeholder.svg', '/placeholder.svg'],
    hasRegistration: true,
    hasTransferPaper: true,
    sellerId: 'seller-5',
    sellerName: 'Vũ Đình Tuấn',
    sellerPhone: '0945678901',
    createdAt: '2024-12-05',
    views: 2100,
  },
  {
    id: 'plate-6',
    plateNumber: '79-B1 234.56',
    province: 'Khánh Hòa',
    vehicleType: 'Xe máy',
    price: 120000000,
    originalAuctionPrice: 85000000,
    originalAuctionDate: '2024-02-10',
    description: 'Biển xe máy số tiến đẹp, dễ nhớ. Giá tốt, giấy tờ đầy đủ.',
    status: 'active',
    images: ['/placeholder.svg'],
    hasRegistration: true,
    hasTransferPaper: true,
    sellerId: 'seller-6',
    sellerName: 'Ngô Thanh Tùng',
    sellerPhone: '0956789012',
    createdAt: '2024-12-01',
    views: 180,
  },
  {
    id: 'plate-7',
    plateNumber: '30K-777.77',
    province: 'Hà Nội',
    vehicleType: 'Ô tô',
    price: 1800000000,
    originalAuctionPrice: 1500000000,
    originalAuctionDate: '2024-01-20',
    description: 'Biển tứ quý 7, con số may mắn. Biển Hà Nội VIP, đã hoàn tất mọi thủ tục pháp lý.',
    status: 'sold',
    images: ['/placeholder.svg', '/placeholder.svg'],
    hasRegistration: true,
    hasTransferPaper: true,
    sellerId: 'seller-7',
    sellerName: 'Đặng Văn Hải',
    sellerPhone: '0967890123',
    createdAt: '2024-11-25',
    views: 890,
  },
  {
    id: 'plate-8',
    plateNumber: '51F-123.45',
    province: 'TP. Hồ Chí Minh',
    vehicleType: 'Ô tô',
    price: 280000000,
    originalAuctionPrice: 200000000,
    originalAuctionDate: '2024-02-05',
    description: 'Biển số tiến 12345, dễ nhớ. Giá hợp lý cho biển Sài Gòn.',
    status: 'active',
    images: ['/placeholder.svg'],
    hasRegistration: true,
    hasTransferPaper: true,
    sellerId: 'seller-8',
    sellerName: 'Bùi Thị Lan',
    sellerPhone: '0978901234',
    createdAt: '2024-12-22',
    views: 320,
  },
];

// Format price to VND
export const formatPrice = (price: number): string => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(price % 1000000000 === 0 ? 0 : 2)} tỷ`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(0)} triệu`;
  }
  return price.toLocaleString('vi-VN') + ' đ';
};

// Format full price
export const formatFullPrice = (price: number): string => {
  return price.toLocaleString('vi-VN') + ' VNĐ';
};

// Format mileage
export const formatMileage = (mileage: number): string => {
  return mileage.toLocaleString('vi-VN') + ' km';
};

// Format date
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Format time remaining
export const formatTimeRemaining = (endAt: string): { days: number; hours: number; minutes: number; seconds: number; isExpired: boolean } => {
  const end = new Date(endAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
};
