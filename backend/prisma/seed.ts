import {
  PrismaClient,
  Role,
  Platform,
  ProductType,
  IndicatorCategory,
  BotStatus,
  IndicatorStatus,
  OrderStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch {
    // .env may already be loaded by Prisma CLI
  }
}

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // Clean existing seed data
  await prisma.review.deleteMany({});
  await prisma.license.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.indicator.deleteMany({});
  await prisma.bot.deleteMany({});
  await prisma.user.deleteMany({});

  // 1 Admin Công ty: admin@oceanea.com
  const admin = await prisma.user.create({
    data: {
      email: 'admin@oceanea.com',
      password: hashedPassword,
      fullName: 'OceanEA Official Team',
      role: Role.ADMIN,
      balance: 15840.0,
    },
  });

  // 1 Buyer mẫu: trader@oceanea.com
  const buyer = await prisma.user.create({
    data: {
      email: 'trader@oceanea.com',
      password: hashedPassword,
      fullName: 'John Trader',
      role: Role.BUYER,
      balance: 500.0,
    },
  });

  // =========================================================================
  // PHẦN 1: BẢNG BOT EA (6 Hệ thống Giao dịch Tự động - Expert Advisors)
  // =========================================================================
  const bot1 = await prisma.bot.create({
    data: {
      title: 'OceanGold Scalper Pro XAUUSD',
      slug: 'oceangold-scalper-pro-xauusd',
      shortDesc: 'Scalping vàng siêu tần số trên khung M5 với cơ chế tự động điều chỉnh khối lượng',
      description:
        'OceanGold Scalper Pro XAUUSD là hệ thống giao dịch tự động chuyên biệt cho cặp Vàng (XAUUSD) trên nền tảng MetaTrader 5. Tích hợp thuật toán nhận diện biến động dòng tiền vi mô, tự động cắt lỗ nghiêm ngặt và tối ưu hóa điểm chốt lời động theo sóng giá.',
      price: 149.0,
      platform: Platform.MT5,
      version: '2.1.0',
      fileKey: 'bots/oceangold-scalper-pro/oceangold_v2.1.0.ex5',
      demoFileKey: 'bots/oceangold-scalper-pro/oceangold_demo.ex5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
      winRate: 78.5,
      maxDrawdown: 11.2,
      profitFactor: 2.15,
      status: BotStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.bot.create({
    data: {
      title: 'SkyTrend Grid Master EURUSD',
      slug: 'skytrend-grid-master-eurusd',
      shortDesc: 'Grid trading thông minh với khoảng cách thích ứng và bộ lọc xu hướng đa khung',
      description:
        'SkyTrend Grid Master áp dụng phương pháp lưới lệnh linh hoạt trên EURUSD. Hỗ trợ cả hai nền tảng MT4 và MT5, trang bị thuật toán chống bão giá khi có tin tức mạnh, tính toán tự động Margin Protection.',
      price: 99.0,
      platform: Platform.BOTH,
      version: '3.0.4',
      fileKey: 'bots/skytrend-grid-master/skytrend_v3.0.4.ex5',
      demoFileKey: 'bots/skytrend-grid-master/skytrend_demo.ex5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=600&q=80',
      winRate: 82.0,
      maxDrawdown: 14.8,
      profitFactor: 1.95,
      status: BotStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.bot.create({
    data: {
      title: 'BlueWave News Filter EA',
      slug: 'bluewave-news-filter-ea',
      shortDesc: 'Bộ công cụ lọc tin tức kinh tế và quản lý lệnh tự động hoàn toàn miễn phí',
      description:
        'BlueWave News Filter EA giúp trader bảo vệ tài khoản bằng cách tự động đóng lệnh hoặc tạm ngừng hoạt động trước và sau các bản tin kinh tế đỏ (Non-Farm, CPI, FOMC). Dành cho MetaTrader 4.',
      price: 0.0,
      platform: Platform.MT4,
      version: '1.2.0',
      fileKey: 'bots/bluewave-news-filter/bluewave_v1.2.0.ex4',
      demoFileKey: 'bots/bluewave-news-filter/bluewave_demo.ex4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
      winRate: 68.4,
      maxDrawdown: 8.5,
      profitFactor: 1.82,
      status: BotStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.bot.create({
    data: {
      title: 'DeepSea Swing GBPJPY',
      slug: 'deepsea-swing-gbpjpy',
      shortDesc: 'Đánh swing trung hạn cặp rồng GBPJPY theo cấu trúc sóng thị trường Wyckoff',
      description:
        'DeepSea Swing khai thác biên độ biến động mạnh của cặp GBPJPY trên khung H4. Tỷ lệ Risk/Reward trung bình 1:3, trailing stop tự động đưa điểm hòa vốn khi giá đi đúng hướng.',
      price: 199.0,
      platform: Platform.MT5,
      version: '2.5.0',
      fileKey: 'bots/deepsea-swing/deepsea_v2.5.0.ex5',
      demoFileKey: 'bots/deepsea-swing/deepsea_demo.ex5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=600&q=80',
      winRate: 74.2,
      maxDrawdown: 9.4,
      profitFactor: 2.38,
      status: BotStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.bot.create({
    data: {
      title: 'Marine PropFirm Challenge Passer',
      slug: 'marine-propfirm-challenge-passer',
      shortDesc: 'Thuật toán kiểm soát Drawdown cực thấp <5%, chuyên dùng thi quỹ FTMO, MFF',
      description:
        'Được thiết kế chuyên biệt để vượt qua các bài thi tuyển Trader của quỹ Prop Firm. Giới hạn drawdown ngày tối đa 2%, target lợi nhuận đều đặn hàng tuần với cơ chế risk per trade cố định 0.5%.',
      price: 249.0,
      platform: Platform.BOTH,
      version: '4.1.2',
      fileKey: 'bots/marine-propfirm/marine_v4.1.2.ex5',
      demoFileKey: 'bots/marine-propfirm/marine_demo.ex5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      winRate: 81.0,
      maxDrawdown: 4.5,
      profitFactor: 2.65,
      status: BotStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.bot.create({
    data: {
      title: 'Coral Reef Hedging System',
      slug: 'coral-reef-hedging-system',
      shortDesc: 'Chiến lược phòng hộ rủi ro đa cặp tiền tương quan âm trên MT4',
      description:
        'Hệ thống Hedging cân bằng rủi ro bằng cách mở các vị thế đối ứng trên các cặp tương quan nghịch như EURUSD và USDCHF. Giảm thiểu biến động vốn và giữ đường cong Equity luôn ổn định.',
      price: 120.0,
      platform: Platform.MT4,
      version: '1.8.0',
      fileKey: 'bots/coral-reef-hedging/coral_v1.8.0.ex4',
      demoFileKey: 'bots/coral-reef-hedging/coral_demo.ex4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=600&q=80',
      winRate: 76.5,
      maxDrawdown: 12.0,
      profitFactor: 1.78,
      status: BotStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  // =========================================================================
  // PHẦN 2: BẢNG INDICATOR (6 Chỉ báo Tín hiệu & Phân tích Kỹ thuật riêng biệt)
  // =========================================================================
  const ind1 = await prisma.indicator.create({
    data: {
      title: 'OceanSMC OrderBlock & FVG Matrix',
      slug: 'oceansmc-orderblock-fvg-matrix',
      shortDesc: 'Tự động vẽ vùng Order Block, Fair Value Gap, BOS/CHoCH chuẩn Smart Money Concept',
      description:
        'Chỉ báo SMC chuyên sâu tự động phát hiện cấu trúc thị trường tổ chức (BOS, CHoCH), vùng thanh khoản (Liquidity Pool) và khối lệnh Order Block còn hiệu lực. Cam kết 100% Non-Repaint sau khi đóng nến, bắn thông báo về điện thoại MT5 và Telegram.',
      price: 79.0,
      platform: Platform.BOTH,
      version: '3.2.0',
      fileKey: 'indicators/oceansmc-matrix/oceansmc_v3.2.0.ex5',
      demoFileKey: 'indicators/oceansmc-matrix/oceansmc_demo.ex5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=600&q=80',
      category: IndicatorCategory.SMC_ICT,
      accuracyRate: 86.5,
      isNonRepaint: true,
      hasAlert: true,
      timeframes: 'M5, M15, H1, H4',
      status: IndicatorStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.indicator.create({
    data: {
      title: 'AquaPulse Non-Repaint Trend Sniper',
      slug: 'aquapulse-non-repaint-trend-sniper',
      shortDesc: 'Mũi tên tín hiệu Buy/Sell theo dòng tiền xu hướng kèm vạch Entry - SL - TP trực quan',
      description:
        'AquaPulse kết hợp bộ lọc biến động ATR kép và động lượng dòng tiền để phát tín hiệu mũi tên vào lệnh kèm sẵn 3 mốc TP1, TP2, TP3 ngay trên biểu đồ. Tuyệt đối không vẽ lại (100% Non-Repaint).',
      price: 65.0,
      platform: Platform.MT5,
      version: '2.4.1',
      fileKey: 'indicators/aquapulse-sniper/aquapulse_v2.4.1.ex5',
      demoFileKey: 'indicators/aquapulse-sniper/aquapulse_demo.ex5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      category: IndicatorCategory.TREND_SIGNAL,
      accuracyRate: 83.2,
      isNonRepaint: true,
      hasAlert: true,
      timeframes: 'M15, M30, H1',
      status: IndicatorStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.indicator.create({
    data: {
      title: 'TidalFlow Institutional Volume Profile',
      slug: 'tidalflow-institutional-volume-profile',
      shortDesc: 'Hiển thị thanh khoản Volume Profile, vùng POC, VAH/VAL và Delta áp lực mua bán thực',
      description:
        'Giúp Trader nhìn xuyên thấu khối lượng khớp lệnh tích lũy tại từng mức giá (Point of Control - POC). Hỗ trợ xác định vùng hỗ trợ/kháng cự cứng của cá mập cho Vàng (XAUUSD), BTCUSD và các cặp Forex chính.',
      price: 89.0,
      platform: Platform.MT5,
      version: '1.9.0',
      fileKey: 'indicators/tidalflow-vp/tidalflow_v1.9.0.ex5',
      demoFileKey: 'indicators/tidalflow-vp/tidalflow_demo.ex5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
      category: IndicatorCategory.VOLUME_FLOW,
      accuracyRate: 88.0,
      isNonRepaint: true,
      hasAlert: true,
      timeframes: 'M5, M15, H1, D1',
      status: IndicatorStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.indicator.create({
    data: {
      title: 'OceanSession Killzone & Liquidity Box',
      slug: 'oceansession-killzone-liquidity-box',
      shortDesc: 'Tự động đóng khung phiên Á - Âu - Mỹ (ICT Killzones) và đánh dấu đỉnh đáy thanh khoản',
      description:
        'Công cụ miễn phí không thể thiếu cho dân đánh phiên London & New York Killzone. Tự động đánh dấu Asian Range High/Low, Prev Day High/Low (PDH/PDL) và cảnh báo khi giá quét râu thanh khoản.',
      price: 0.0,
      platform: Platform.BOTH,
      version: '1.5.0',
      fileKey: 'indicators/oceansession-box/oceansession_v1.5.0.ex4',
      demoFileKey: 'indicators/oceansession-box/oceansession_demo.ex4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?auto=format&fit=crop&w=600&q=80',
      category: IndicatorCategory.SMC_ICT,
      accuracyRate: 80.0,
      isNonRepaint: true,
      hasAlert: true,
      timeframes: 'M1, M5, M15, H1',
      status: IndicatorStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.indicator.create({
    data: {
      title: 'GoldDivergence Pro Oscillator XAU',
      slug: 'golddivergence-pro-oscillator-xau',
      shortDesc: 'Phát hiện phân kỳ thường & phân kỳ kín đa chỉ báo (RSI + MACD + MFI) chuyên trị đảo chiều Vàng',
      description:
        'Quét đồng thời 3 tầng động lượng RSI, MACD và dòng tiền MFI để phát hiện sớm cú đảo chiều của XAUUSD. Chỉ báo vẽ đường phân kỳ trực tiếp trên chart và cửa sổ phụ kèm chuông báo.',
      price: 59.0,
      platform: Platform.MT4,
      version: '2.0.2',
      fileKey: 'indicators/golddivergence-pro/golddivergence_v2.0.2.ex4',
      demoFileKey: 'indicators/golddivergence-pro/golddivergence_demo.ex4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
      category: IndicatorCategory.OSCILLATOR,
      accuracyRate: 81.5,
      isNonRepaint: true,
      hasAlert: true,
      timeframes: 'M5, M15, H1, H4',
      status: IndicatorStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  await prisma.indicator.create({
    data: {
      title: 'Horizon Multi-Timeframe Scanner Dashboard',
      slug: 'horizon-multi-timeframe-scanner-dashboard',
      shortDesc: 'Bảng radar quét 28 cặp tiền & Vàng trên 7 khung giờ từ M5 đến D1 trên cùng 1 màn hình',
      description:
        'Bảng điều khiển tổng hợp sức mạnh tiền tệ (Currency Strength) và đồng thuận xu hướng trên toàn bộ 7 khung thời gian. Click trực tiếp vào tên cặp tiền trên bảng để chuyển biểu đồ ngay lập tức.',
      price: 95.0,
      platform: Platform.BOTH,
      version: '3.1.0',
      fileKey: 'indicators/horizon-mtf-scanner/horizon_v3.1.0.ex5',
      demoFileKey: 'indicators/horizon-mtf-scanner/horizon_demo.ex5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80',
      category: IndicatorCategory.MULTI_TIMEFRAME,
      accuracyRate: 85.4,
      isNonRepaint: true,
      hasAlert: true,
      timeframes: 'M5 → MN1 (7 Khung)',
      status: IndicatorStatus.APPROVED,
      sellerId: admin.id,
    },
  });

  // =========================================================================
  // PHẦN 3: ORDER & LICENSE MẪU CHO CẢ BOT EA VÀ INDICATOR
  // =========================================================================
  await prisma.order.create({
    data: {
      userId: buyer.id,
      productType: ProductType.BOT_EA,
      botId: bot1.id,
      amount: 149.0,
      status: OrderStatus.COMPLETED,
      paymentMethod: 'VIETQR',
      transactionId: 'TXN-EA-DEMO-2026-001',
    },
  });

  await prisma.license.create({
    data: {
      licenseKey: 'EA-DEMO-2026-8888',
      userId: buyer.id,
      productType: ProductType.BOT_EA,
      botId: bot1.id,
      mtAccountNo: '21008899',
      resetCount: 0,
      isActive: true,
      expiresAt: null,
    },
  });

  await prisma.order.create({
    data: {
      userId: buyer.id,
      productType: ProductType.INDICATOR,
      indicatorId: ind1.id,
      amount: 79.0,
      status: OrderStatus.COMPLETED,
      paymentMethod: 'VIETQR',
      transactionId: 'TXN-IND-DEMO-2026-002',
    },
  });

  await prisma.license.create({
    data: {
      licenseKey: 'IND-DEMO-2026-9999',
      userId: buyer.id,
      productType: ProductType.INDICATOR,
      indicatorId: ind1.id,
      mtAccountNo: '21008899',
      resetCount: 0,
      isActive: true,
      expiresAt: null,
    },
  });

  await prisma.review.create({
    data: {
      userId: buyer.id,
      productType: ProductType.BOT_EA,
      botId: bot1.id,
      rating: 5,
      comment: 'Bot chạy rất mượt trên VPS XM, lợi nhuận tuần đầu đạt 4.2% đúng như kỳ vọng!',
    },
  });

  await prisma.review.create({
    data: {
      userId: buyer.id,
      productType: ProductType.INDICATOR,
      indicatorId: ind1.id,
      rating: 5,
      comment: 'Chỉ báo SMC vẽ vùng Order Block & FVG cực chuẩn, không hề vẽ lại, báo Telegram siêu nhạy!',
    },
  });

  console.log('OceanEA seed completed successfully!');
  console.log('Seeded 6 Bot EAs (table Bot) & 6 Indicators (table Indicator).');
  console.log('Sample Bot License: EA-DEMO-2026-8888 | Sample Indicator License: IND-DEMO-2026-9999');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
