// 地名词典与分行地点标准化
export const EN_CITY_MAP = {
  beijing: 'Beijing',
  shanghai: 'Shanghai',
  shenzhen: 'Shenzhen',
  guangzhou: 'Guangzhou',
  hangzhou: 'Hangzhou',
  nanjing: 'Nanjing',
  ningbo: 'Ningbo',
  qingdao: 'Qingdao',
  tianjin: 'Tianjin',
  dalian: 'Dalian',
  chengdu: 'Chengdu',
  chongqing: 'Chongqing',
  xiamen: 'Xiamen',
  zhuhai: 'Zhuhai',
  guiyang: 'Guiyang',
  yantai: 'Yantai'
};

const DISTRICT_MAP = {
  haidian: 'Haidian',
  chaoyang: 'Chaoyang',
  xicheng: 'Xicheng',
  pudong: 'Pudong',
  nanshan: 'Nanshan',
  tianhe: 'Tianhe'
};

const ZONE_TOKEN_MAP = {
  '经开': 'Economic Development Zone',
  '经济技术开发区': 'Economic Development Zone',
  '开发区': 'Development Zone',
  '自贸区': 'Free Trade Zone',
  '自贸港': 'Free Trade Port',
  '保税区': 'Bonded Zone',
  '保税物流中心': 'Bonded Logistics Center'
};

function normalizePunctuation(s) {
  return String(s || '')
    .replace(/[，]/g, ',')
    .replace(/[／]/g, '/')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Legacy canonicalizeBranchLocation removed; see the new implementation with bilingual options below.

export function getLocationOptionsFromEnv() {
  const mode = (process.env.REACT_APP_LOCATION_LABEL_MODE || 'en').toLowerCase();
  return { mode };
}

function unifyChineseLocationTokens(s) {
  let out = s;
  out = out.replace(/经开区|经济技术开发区|开发区/g, '经济技术开发区');
  out = out.replace(/自贸港|自由贸易港/g, '自贸港');
  out = out.replace(/自贸区|自由贸易试验区/g, '自贸区');
  out = out.replace(/保税物流中心|保税区/g, '保税物流中心');
  return out;
}

export function canonicalizeBranchLocation(raw, opts = { mode: 'en' }) {
  const s0 = normalizePunctuation(String(raw || ''));
  const sZh = unifyChineseLocationTokens(s0);
  const lower = sZh.toLowerCase();
  // city
  let outEn = lower.replace(/beijing|北京/g, 'Beijing')
    .replace(/shanghai|上海/g, 'Shanghai')
    .replace(/shenzhen|深圳/g, 'Shenzhen')
    .replace(/guangzhou|广州/g, 'Guangzhou')
    .replace(/hangzhou|杭州/g, 'Hangzhou')
    .replace(/nanjing|南京/g, 'Nanjing')
    .replace(/ningbo|宁波/g, 'Ningbo')
    .replace(/qingdao|青岛/g, 'Qingdao')
    .replace(/tianjin|天津/g, 'Tianjin')
    .replace(/dalian|大连/g, 'Dalian')
    .replace(/chengdu|成都/g, 'Chengdu')
    .replace(/chongqing|重庆/g, 'Chongqing')
    .replace(/xiamen|厦门/g, 'Xiamen')
    .replace(/zhuhai|珠海/g, 'Zhuhai')
    .replace(/guiyang|贵阳/g, 'Guiyang')
    .replace(/yantai|烟台/g, 'Yantai');
  // province tokens (Chinese -> English)
  outEn = outEn
    .replace(/北京|beijing/g, 'Beijing')
    .replace(/上海|shanghai/g, 'Shanghai')
    .replace(/广东|guangdong/g, 'Guangdong')
    .replace(/浙江|zhejiang/g, 'Zhejiang')
    .replace(/江苏|jiangsu/g, 'Jiangsu')
    .replace(/山东|shandong/g, 'Shandong')
    .replace(/四川|sichuan/g, 'Sichuan')
    .replace(/重庆|chongqing/g, 'Chongqing')
    .replace(/福建|fujian/g, 'Fujian')
    .replace(/贵州|guizhou/g, 'Guizhou')
    .replace(/辽宁|liaoning/g, 'Liaoning')
    .replace(/湖北|hubei/g, 'Hubei')
    .replace(/湖南|hunan/g, 'Hunan')
    .replace(/河南|henan/g, 'Henan');
  // zone tokens
  outEn = outEn
    .replace(/经开|经济技术开发区|开发区/g, 'Economic Development Zone')
    .replace(/自贸港/g, 'Free Trade Port')
    .replace(/自贸区/g, 'Free Trade Zone')
    .replace(/保税物流中心|保税区/g, 'Bonded Logistics Center');

  const outZh = sZh; // 已统一中文同义词与标点

  if (opts.mode === 'zh') return outZh;
  if (opts.mode === 'mixed') {
    const en = outEn.trim();
    const zh = outZh.trim();
    if (en.toLowerCase() === zh.toLowerCase()) return en;
    return `${en} / ${zh}`;
  }
  return outEn.trim();
}

// Optional location metadata to support templates.
export const LOCATION_META = {
  Beijing: { countryCode: 'CN', timezone: 'Asia/Shanghai', postalCodeFormat: '6 digits' },
  Shanghai: { countryCode: 'CN', timezone: 'Asia/Shanghai', postalCodeFormat: '6 digits' },
  Shenzhen: { countryCode: 'CN', timezone: 'Asia/Shanghai', postalCodeFormat: '6 digits' },
  HongKong: { countryCode: 'HK', timezone: 'Asia/Hong_Kong', postalCodeFormat: 'N/A' },
};