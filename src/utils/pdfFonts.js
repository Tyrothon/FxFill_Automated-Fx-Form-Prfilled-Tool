// Helper to load a CJK-capable font into jsPDF at runtime
// It fetches NotoSansSC-Regular from a CDN, converts to base64 and registers it.
// Usage: await ensureCjkFont(doc); then use doc.setFont('NotoSansSC', 'normal').

let fontLoading = null;
let fontReady = false;
let loadedFamily = null;

// Prefer local TTF served from /public/fonts to avoid CDN/CORS issues.
// Fall back to a couple of CDNs if the local file is missing.
const LOCAL_TTF = '/fonts/NotoSansSC-Regular.ttf';
const CDN_TTF_PRIMARY = 'https://cdn.jsdelivr.net/gh/life888888/cjk-fonts-ttf@main/NotoSansSC-Regular.ttf';
const CDN_TTF_BACKUP = 'https://cdn.jsdelivr.net/gh/ChanCJK/cjk-fonts-ttf@master/NotoSansSC-Regular.ttf';
const CDN_OTF_FALLBACK = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@v2.004/Sans/OTF/SimplifiedChinese/NotoSansSC-Regular.otf';
// Traditional Chinese (HK/TW) — prefer for BOC HK forms
const LOCAL_TC_TTF = '/fonts/NotoSansTC-Regular.ttf';
const CDN_TC_TTF_PRIMARY = 'https://cdn.jsdelivr.net/gh/life888888/cjk-fonts-ttf@main/NotoSansTC-Regular.ttf';
const CDN_TC_TTF_BACKUP = 'https://cdn.jsdelivr.net/gh/ChanCJK/cjk-fonts-ttf@master/NotoSansTC-Regular.ttf';
const CDN_TC_OTF_FALLBACK = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@v2.004/Sans/OTF/TraditionalChineseHK/NotoSansHK-Regular.otf';

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
};

export const ensureCjkFont = async (doc) => {
  // If already loaded, set whichever family we recorded
  if (fontReady) {
    try {
      if (loadedFamily) {
        doc.setFont(loadedFamily, 'normal');
      } else {
        try { doc.setFont('NotoSansTC', 'normal'); } catch (_) { doc.setFont('NotoSansSC', 'normal'); }
      }
    } catch (_) {}
    return;
  }
  if (!fontLoading) {
    fontLoading = (async () => {
      try {
        // 1) Try Traditional Chinese first (BOC HK forms often use TC)
        let resTC = await fetch(LOCAL_TC_TTF, { cache: 'force-cache' });
        if (!resTC.ok) {
          resTC = await fetch(CDN_TC_TTF_PRIMARY, { cache: 'force-cache' });
          if (!resTC.ok) {
            resTC = await fetch(CDN_TC_TTF_BACKUP, { cache: 'force-cache' });
          }
        }
        if (resTC.ok) {
          const bufTC = await resTC.arrayBuffer();
          const b64TC = arrayBufferToBase64(bufTC);
          try {
            doc.addFileToVFS('NotoSansTC-Regular.ttf', b64TC);
            doc.addFont('NotoSansTC-Regular.ttf', 'NotoSansTC', 'normal');
            loadedFamily = 'NotoSansTC';
            fontReady = true;
          } catch (_) {
            try {
              doc.addFileToVFS('NotoSansHK-Regular.otf', b64TC);
              doc.addFont('NotoSansHK-Regular.otf', 'NotoSansTC', 'normal');
              loadedFamily = 'NotoSansTC';
              fontReady = true;
            } catch (eTC) {
              console.warn('TC font registration failed:', eTC);
            }
          }
        }

        // 2) If TC not registered, try Simplified Chinese paths
        if (!fontReady) {
          let resSC = await fetch(LOCAL_TTF, { cache: 'force-cache' });
          if (!resSC.ok) {
            resSC = await fetch(CDN_TTF_PRIMARY, { cache: 'force-cache' });
            if (!resSC.ok) {
              resSC = await fetch(CDN_TTF_BACKUP, { cache: 'force-cache' });
            }
          }
          if (!resSC.ok) {
            resSC = await fetch(CDN_OTF_FALLBACK, { cache: 'force-cache' });
          }
          if (resSC.ok) {
            const bufSC = await resSC.arrayBuffer();
            const b64SC = arrayBufferToBase64(bufSC);
            try {
              doc.addFileToVFS('NotoSansSC-Regular.ttf', b64SC);
              doc.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
              loadedFamily = 'NotoSansSC';
              fontReady = true;
            } catch (_) {
              try {
                doc.addFileToVFS('NotoSansSC-Regular.otf', b64SC);
                doc.addFont('NotoSansSC-Regular.otf', 'NotoSansSC', 'normal');
                loadedFamily = 'NotoSansSC';
                fontReady = true;
              } catch (eSC) {
                console.warn('SC font registration failed:', eSC);
              }
            }
          }
        }
      } catch (e) {
        console.warn('CJK font load failed, using fallback font:', e);
      }
    })();
  }
  try { await fontLoading; } catch (_) {}
  try {
    if (loadedFamily) {
      doc.setFont(loadedFamily, 'normal');
    } else {
      try { doc.setFont('NotoSansTC', 'normal'); } catch (_) { doc.setFont('NotoSansSC', 'normal'); }
    }
  } catch (_) {}
};