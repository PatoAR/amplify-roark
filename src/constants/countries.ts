export const COUNTRY_OPTIONS = [
  { id: 'global', label: 'GLOBAL', code: 'global', fullName: 'Global' },
  { id: 'Q414', label: 'ARG', code:'ar', fullName: 'Argentina' },
  { id: 'Q155', label: 'BRA', code: 'br', fullName: 'Brazil' },
  { id: 'Q298', label: 'CHL', code: 'cl', fullName: 'Chile' },
  { id: 'Q739', label: 'COL', code: 'co', fullName: 'Colombia' },
  { id: 'Q96', label: 'MEX', code: 'mx', fullName: 'Mexico' },
  { id: 'Q733', label: 'PAR', code: 'py', fullName: 'Paraguay' },
  { id: 'Q419', label: 'PER', code: 'pe', fullName: 'Peru' },
  { id: 'Q77', label: 'URU', code: 'uy', fullName: 'Uruguay' },
];

// Helper function to get full country name from ID or code
export const getCountryName = (identifier: string): string | null => {
  const country = COUNTRY_OPTIONS.find(
    c => c.id.toLowerCase() === identifier.toLowerCase() || 
         c.code.toLowerCase() === identifier.toLowerCase() ||
         c.label.toLowerCase() === identifier.toLowerCase()
  );
  return country?.fullName || null;
};

export const INDUSTRY_OPTIONS = [
  { id: '💵 MARKETS', label: 'MARKETS', icon: 'TrendingUp' },
  { id: '📈 ECONOMY', label: 'ECONOMY', icon: 'Building2' },
  { id: '⛏️ MINING', label: 'MINING', icon: 'Pickaxe' },
  { id: '⚡ ENERGY', label: 'ENERGY', icon: 'Zap' },
  { id: '🚜 AGRIBUSINESS', label: 'AGRIBUSINESS', icon: 'Wheat' },
  { id: '🏛️ FINANCIALS', label: 'FINANCIAL SERVICES', icon: 'Banknote' },
  { id: '🏘️ REAL ESTATE', label: 'REAL ESTATE', icon: 'Home' },
  { id: '💊 HEALTHCARE', label: 'HEALTHCARE', icon: 'Stethoscope' },
  { id: '🏭 INDUSTRIALS', label: 'INDUSTRIALS', icon: 'Factory' },
  { id: '💻 TECHNOLOGY', label: 'TECHNOLOGY', icon: 'Cpu' },
  { id: '🎬 MEDIA•ENTERTAINMENT', label: 'MEDIA & ENTERTAINMENT', icon: 'Video' },
  { id: '📡 TELECOM', label: 'TELECOMMUNICATIONS', icon: 'Satellite' },
  { id: '🛍️ RETAIL', label: 'RETAIL & CONSUMER GOODS', icon: 'ShoppingBag' },
  { id: '✈️ TRAVEL•LEISURE', label: 'TRAVEL & LEISURE', icon: 'Plane' },
  { id: '🚂 TRANSPORT•LOGISTICS', label: 'TRANSPORTATION & LOGISTICS', icon: 'Truck' },
  { id: '🏗️ UTILITIES•INFRA', label: 'UTILITIES & INFRASTRUCTURE', icon: 'HardHat' },
  { id: '🚗 AUTOMOTIVE•MOBILITY', label: 'AUTOMOTIVE & MOBILITY', icon: 'Car' },
  { id: '🎓 EDUCATION', label: 'EDUCATION & TRAINING', icon: 'GraduationCap' },
  { id: '🌱 ESG•SUSTAINABILITY', label: 'ESG & SUSTAINABILITY', icon: 'Leaf' },
];