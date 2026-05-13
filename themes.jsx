// Three visual themes — all "warm cream + green cafe", but distinct DNA.

const THEME_CLASSIC = {
  id: 'classic',
  name: 'A · คาเฟ่คลาสสิก',
  subtitle: 'กริดใหญ่ ตะกร้าล่าง',
  // Palette
  bg:        '#F2EBDB',          // warm cream
  surface:   '#FBF7EC',          // panel
  card:      '#FFFFFF',
  ink:       '#27241D',          // espresso text
  inkSoft:   '#6B6353',
  inkMute:   '#A89E8A',
  line:      '#E5DCC7',
  accent:    '#3D5A40',          // deep sage
  accentSoft:'#7A9579',
  accentInk: '#FBF7EC',
  warm:      '#C7693A',          // terracotta accent
  danger:    '#B5482F',
  // Type
  ff:        '"IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif',
  ffDisplay: '"IBM Plex Sans Thai", "Sarabun", serif',
  // Radii / shadows
  r:         16,
  rSm:       10,
  rLg:       22,
  shadow:    '0 1px 0 rgba(39,36,29,0.04), 0 6px 18px rgba(39,36,29,0.06)',
  // POS layout flavor
  layout:    'grid-bottom',
};

const THEME_MINIMAL = {
  id: 'minimal',
  name: 'B · มินิมอลครีม',
  subtitle: 'ลิสต์เรียบ ไวท์สเปซเยอะ',
  bg:        '#F8F4EC',
  surface:   '#FFFFFF',
  card:      '#FFFFFF',
  ink:       '#1F2A23',
  inkSoft:   '#5C6B5F',
  inkMute:   '#A6B0A4',
  line:      '#E9E3D5',
  accent:    '#4F6B4E',          // muted sage
  accentSoft:'#A8BCA4',
  accentInk: '#FFFFFF',
  warm:      '#B97C4B',
  danger:    '#A23F2A',
  ff:        '"IBM Plex Sans Thai Looped", "IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif',
  ffDisplay: '"IBM Plex Sans Thai Looped", "IBM Plex Sans Thai", system-ui, sans-serif',
  r:         12,
  rSm:       8,
  rLg:       18,
  shadow:    'none',
  layout:    'list-drawer',
};

const THEME_BOLD = {
  id: 'bold',
  name: 'C · โบลด์ & สดใส',
  subtitle: 'การ์ดใหญ่ เฮดเดอร์เข้ม bottom sheet',
  bg:        '#F4ECDA',          // warm cream
  surface:   '#FFFFFF',
  card:      '#FFFFFF',
  ink:       '#1F2A22',          // dark forest — used for hero too
  inkSoft:   '#4A5A4C',
  inkMute:   '#8C9A8C',
  line:      'rgba(31,42,34,0.10)',
  accent:    '#E07B3C',          // terracotta orange
  accentSoft:'#F4C99A',
  accentInk: '#FFFFFF',
  warm:      '#3D5A40',
  danger:    '#B5482F',
  ff:        '"IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif',
  ffDisplay: '"Bai Jamjuree", "IBM Plex Sans Thai", system-ui, sans-serif',
  r:         20,
  rSm:       12,
  rLg:       28,
  shadow:    '0 8px 24px rgba(31,42,34,0.18)',
  layout:    'cards-sheet',
};

window.THEMES = {
  classic: THEME_CLASSIC,
  minimal: THEME_MINIMAL,
  bold:    THEME_BOLD,
};
