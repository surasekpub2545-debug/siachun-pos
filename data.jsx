// Shared data + utilities for ร้านเสี่ยจุ้น POS prototype

const fmtTHB = (n) => '฿' + n.toLocaleString('th-TH');
const fmtCount = (n) => n.toLocaleString('th-TH');

// All "ดั้งเดิม 100" — flat ฿100 base price, with size variations.
const MENU_SEED = [
  // หมวด: น้ำคั้นสด
  { id: 'm01', cat: 'juice', name: 'น้ำส้มคั้นสด',        price: 100, color: '#F4A540', cost: 38, stock: true,  fav: true  },
  { id: 'm02', cat: 'juice', name: 'น้ำแตงโม',             price: 100, color: '#E26B6B', cost: 32, stock: true,  fav: true  },
  { id: 'm03', cat: 'juice', name: 'น้ำสับปะรด',           price: 100, color: '#E8C547', cost: 35, stock: true,  fav: false },
  { id: 'm04', cat: 'juice', name: 'น้ำฝรั่ง',              price: 100, color: '#B5D17A', cost: 30, stock: true,  fav: false },
  { id: 'm05', cat: 'juice', name: 'น้ำมะนาว',             price: 100, color: '#D5E07A', cost: 22, stock: true,  fav: true  },
  { id: 'm06', cat: 'juice', name: 'น้ำมะม่วง',            price: 100, color: '#F2B743', cost: 40, stock: true,  fav: true  },
  { id: 'm07', cat: 'juice', name: 'น้ำแครอท',             price: 100, color: '#E0823A', cost: 28, stock: true,  fav: false },
  { id: 'm08', cat: 'juice', name: 'น้ำเสาวรส',           price: 100, color: '#E5A33D', cost: 36, stock: false, fav: false },
  { id: 'm09', cat: 'juice', name: 'น้ำมะพร้าวสด',         price: 100, color: '#EFE7C8', cost: 45, stock: true,  fav: false },
  { id: 'm10', cat: 'juice', name: 'น้ำอัญชันมะนาว',       price: 100, color: '#6B7DB8', cost: 25, stock: true,  fav: false },
  // หมวด: ปั่น
  { id: 'm11', cat: 'smoothie', name: 'ปั่นรวมมิตร',       price: 100, color: '#D88FAE', cost: 42, stock: true,  fav: true  },
  { id: 'm12', cat: 'smoothie', name: 'ปั่นมะม่วง',         price: 100, color: '#F2B743', cost: 44, stock: true,  fav: false },
  { id: 'm13', cat: 'smoothie', name: 'ปั่นสตรอว์เบอร์รี',  price: 100, color: '#D85767', cost: 50, stock: true,  fav: true  },
  { id: 'm14', cat: 'smoothie', name: 'ปั่นบลูเบอร์รี',     price: 100, color: '#5E5F9E', cost: 55, stock: true,  fav: false },
  { id: 'm15', cat: 'smoothie', name: 'ปั่นอะโวคาโด',       price: 100, color: '#9CB279', cost: 48, stock: true,  fav: false },
  // หมวด: น้ำผัก
  { id: 'm16', cat: 'veg',  name: 'น้ำคะน้า-แอปเปิล',     price: 100, color: '#7FA86A', cost: 36, stock: true,  fav: false },
  { id: 'm17', cat: 'veg',  name: 'น้ำบีทรูท',              price: 100, color: '#A03658', cost: 38, stock: true,  fav: false },
  { id: 'm18', cat: 'veg',  name: 'น้ำขึ้นฉ่าย-แอปเปิล',   price: 100, color: '#88AC68', cost: 34, stock: false, fav: false },
];

const CATEGORIES = [
  { id: 'all',    name: 'ทั้งหมด' },
  { id: 'small',  name: 'เล็ก' },
  { id: 'medium', name: 'กลาง' },
  { id: 'large',  name: 'ใหญ่' },
  { id: 'drink',  name: 'น้ำ' },
  { id: 'syrup',  name: 'ไซรัป' },
  { id: 'kratom', name: 'ใบกระท่อม' },
  { id: 'other',  name: 'อื่นๆ' },
];

// Mock 14 days of sales for dashboard
function seedSales() {
  const out = [];
  const base = [12, 15, 18, 14, 20, 26, 32, 16, 19, 22, 18, 24, 28, 35];
  for (let i = 0; i < 14; i++) {
    const orders = base[i];
    const revenue = orders * 100 + Math.round((Math.sin(i) * 30 + 50));
    out.push({ day: i, orders, revenue });
  }
  return out;
}

// Mock recent expenses
const EXPENSES_SEED = [
  { id: 'e1', date: 'วันนี้',         label: 'ผลไม้ตลาดสี่มุมเมือง',  amount: 1850, cat: 'วัตถุดิบ' },
  { id: 'e2', date: 'วันนี้',         label: 'แก้วพลาสติก 500 ใบ',     amount: 420,  cat: 'บรรจุภัณฑ์' },
  { id: 'e3', date: 'เมื่อวาน',       label: 'น้ำตาล + น้ำผึ้ง',        amount: 380,  cat: 'วัตถุดิบ' },
  { id: 'e4', date: 'เมื่อวาน',       label: 'ค่าไฟ พ.ย.',              amount: 1240, cat: 'ค่าน้ำ-ไฟ' },
  { id: 'e5', date: '3 วันก่อน',      label: 'หลอด + ฝา',                amount: 290,  cat: 'บรรจุภัณฑ์' },
  { id: 'e6', date: '3 วันก่อน',      label: 'เงินเดือนน้องแอม',          amount: 4500, cat: 'พนักงาน' },
];

// Mock today's orders (already closed)
const TODAY_ORDERS_SEED = [
  { id: '#0034', time: '14:22', items: 2, total: 200, pay: 'cash',     cashier: 'แอม'   },
  { id: '#0033', time: '14:08', items: 1, total: 100, pay: 'transfer', cashier: 'แอม'   },
  { id: '#0032', time: '13:51', items: 3, total: 300, pay: 'transfer', cashier: 'เสี่ย' },
  { id: '#0031', time: '13:30', items: 1, total: 100, pay: 'cash',     cashier: 'เสี่ย' },
  { id: '#0030', time: '13:11', items: 4, total: 400, pay: 'cash',     cashier: 'แอม'   },
  { id: '#0029', time: '12:48', items: 2, total: 200, pay: 'transfer', cashier: 'แอม'   },
  { id: '#0028', time: '12:30', items: 1, total: 100, pay: 'cash',     cashier: 'แอม'   },
];

// Users for login
const USERS = [
  { pin: '1234', name: 'เสี่ยจุ้น', role: 'เจ้าของร้าน',  initial: 'จ' },
  { pin: '5678', name: 'น้องแอม',    role: 'พนักงาน',      initial: 'A' },
];

Object.assign(window, {
  fmtTHB, fmtCount,
  MENU_SEED, CATEGORIES, USERS,
  seedSales, EXPENSES_SEED, TODAY_ORDERS_SEED,
});
