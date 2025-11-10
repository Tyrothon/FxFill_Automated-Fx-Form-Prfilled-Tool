// Shared PDF renderers for bank-specific remittance forms
// Currently includes HSBC renderer used by both preview and download pages.

export const renderHsbcRemittanceForm = (doc, page, margin, data) => {
  // helpers for pagination & wrapping
  const bottomY = page.height - margin.bottom;
  const baseLineGap = 18; // default vertical gap between fields
  const wrapLineHeight = 14; // extra height per wrapped line

  const ensureSpace = (needed, y) => {
    if (y + needed > bottomY) {
      doc.addPage();
      return margin.top + 20;
    }
    return y;
  };

  const drawHeader = (label, y) => {
    y = ensureSpace(28, y);
    doc.setFillColor(185, 28, 28);
    doc.rect(margin.left, y - 12, page.width - margin.left - margin.right, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(label, margin.left + 8, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    return y + 16;
  };

  const drawField = (label, value, y, xLabel = margin.left + 10, xInputStart = margin.left + 160) => {
    const xRight = page.width - margin.right - 12;
    const textStartX = xInputStart + 5;
    const maxTextWidth = xRight - textStartX;

    // split long value into wrapped lines
    const valueStr = value == null ? '' : String(value);
    const lines = valueStr
      ? doc.splitTextToSize(valueStr, Math.max(10, maxTextWidth))
      : [];

    const needed = baseLineGap + (lines.length > 1 ? (lines.length - 1) * wrapLineHeight : 0);
    y = ensureSpace(needed, y);

    doc.text(label, xLabel, y);
    doc.line(xInputStart, y + 2, xRight, y + 2);
    if (lines.length) {
      for (let i = 0; i < lines.length; i++) {
        const lineY = y + (i === 0 ? 0 : i * wrapLineHeight);
        doc.text(lines[i], textStartX, lineY);
      }
    }
    return y + needed;
  };

  let y = margin.top + 20;
  y = drawHeader('ACCOUNT HOLDER INFORMATION', y);
  y = drawField('Account Name', data.accountHolderName, y);
  y = drawField('Debit Account Number', data.debitAc, y);
  y = drawField('Currency / Account Type', data.debitAcCurrency || data.debitAcType, y);

  y = drawHeader('PAYMENT DETAILS', y);
  y = drawField('Amount in Remittance Currency', data.amount, y);
  y = drawField('Amount in Debit Account Currency', data.amountDebitCurrency, y);
  y = drawField('Remittance Currency', data.remitCurrency, y);

  y = drawHeader('BENEFICIARY BANK DETAILS', y);
  y = drawField('Bank Name', data.beneficiaryBank, y);
  y = drawField('SWIFT / BIC', data.beneficiarySwift, y);
  y = drawField('Bank Code Type', data.bankCodeType, y);
  y = drawField('Bank Code', data.bankCode, y);
  y = drawField('Country / Territory', data.beneficiaryBankCountry, y);
  y = drawField('City', data.beneficiaryBankCity, y);
  y = drawField('Province / State', data.beneficiaryBankProvince, y);
  y = drawField('Branch', data.beneficiaryBankBranch, y);

  y = drawHeader('BENEFICIARY DETAILS', y);
  y = drawField('Account Name', data.beneficiaryName, y);
  y = drawField('Account Number / IBAN', data.beneficiaryAccount, y);
  y = drawField('Currency / Account Type', data.beneficiaryCurrency || data.beneficiaryAccountType, y);
  y = drawField('Address Line 1', data.beneficiaryAddress1, y);
  y = drawField('Address Line 2', data.beneficiaryAddress2, y);
  y = drawField('Address Line 3', data.beneficiaryAddress3, y);
  y = drawField('Address Line 4', data.beneficiaryAddress4, y);
  y = drawField('Country / Territory', data.beneficiaryCountry, y);
  y = drawField('City', data.beneficiaryCity, y);
  y = drawField('Province / State', data.beneficiaryProvince, y);
  y = drawField('Postcode', data.beneficiaryPostcode, y);

  y = drawHeader('REMITTING PURPOSE / MESSAGE', y);
  y = drawField('Purpose of Payment', data.purposeOfPayment, y);
  y = drawField('Routing Number / Reference', data.routingReference, y);

  y = drawHeader('CHARGE HANDLING', y);
  y = drawField('Charge Type (OUR / BEN / SHA)', data.chargeType, y);
  y = drawField('Local / Overseas Charges', data.localOverseasCharges, y);

  y = drawHeader('ORDERING PARTY DETAILS', y);
  y = drawField('Charge Account Number', data.chargesDebitAc, y);
  y = drawField('Currency / Account Type', data.chargesDebitAcCurrency || data.chargesDebitAcType, y);
  y = drawField('Full Name', data.senderName, y);
  y = drawField('Address', data.address, y);
  y = drawField('Contact Number', data.contactNumber, y);

  y = drawHeader('INTERMEDIARY BANK (IF ANY)', y);
  y = drawField('Bank Name', data.intermediaryBankName, y);
  y = drawField('SWIFT / BIC', data.intermediarySwift, y);
  y = drawField('Account With Intermediary Bank', data.intermediaryAccount, y);

  y = drawHeader('FOREIGN EXCHANGE DETAILS', y);
  y = drawField('Exchange Rate', data.fxRate, y);
  y = drawField('Rate Given By / Contract No.', data.fxContractNo, y);

  y = drawHeader('CUSTOMER DECLARATION', y);
  y = drawField('Signature', data.signature, y);
  y = drawField('Email', data.email, y);
  y = drawField('Telephone', data.telephone, y);
};

// BOC HK Remittance Application — shared renderer with pagination and wrapping
// Helper: base font setter — use helvetica consistently for English output
const setCjkFont = (doc, style = 'normal', _fallbackStyle = 'normal') => {
  doc.setFont('helvetica', style);
  return true;
};

export const renderBocRemittanceForm = (doc, page, margin, data) => {
  // Ensure all dynamic values are ASCII-only to avoid garbled output
  const toAscii = (v) => {
    if (v == null) return '';
    let s = String(v);
    // Normalize common unicode punctuation to ASCII
    s = s
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\uFF08]/g, '(')
      .replace(/[\uFF09]/g, ')')
      .replace(/[\u00A0]/g, ' ');
    // Strip any remaining non-ASCII to guarantee helvetica rendering
    s = s.replace(/[^\x20-\x7E]/g, '');
    return s.trim();
  };
  const left = margin.left;
  const right = page.width - margin.right;
  const bottomY = page.height - margin.bottom;
  const baseGap = 18;
  const wrapGap = 14;
  const defaultFontSize = 9;

  const ensureSpace = (needed, y) => {
    if (y + needed > bottomY) {
      doc.addPage();
      return margin.top + 20;
    }
    return y;
  };

  // Section header (black background, white text) to match BOC preview style
  const drawSectionHeader = (title, y) => {
    y = ensureSpace(25, y);
    doc.setFillColor(0, 0, 0);
    doc.rect(left + 10, y, page.width - left - margin.right - 20, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title, left + 15, y + 13);
    // restore
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(defaultFontSize);
    return y + 25;
  };

  // Shrink-to-fit single-line text within maxWidth
  const drawFittedText = (text, x, y, maxWidth) => {
    const s = toAscii(text);
    if (!s) return;
    const prevSize = doc.getFontSize();
    let size = prevSize;
    let width = doc.getTextWidth(s);
    while (width > maxWidth && size > 7) {
      size -= 0.5;
      doc.setFontSize(size);
      width = doc.getTextWidth(s);
    }
    doc.text(s, x, y);
    doc.setFontSize(prevSize);
  };

  const drawLineField = (label, y, xLabel, xStart, xEnd, value, valueXOffset = 5) => {
    const textStart = xStart + valueXOffset;
    const maxW = xEnd - textStart;
    const str = toAscii(value);
    const lines = str ? doc.splitTextToSize(str, Math.max(10, maxW)) : [];
    const need = baseGap + (lines.length > 1 ? (lines.length - 1) * wrapGap : 0);
    y = ensureSpace(need, y);
    if (label) doc.text(label, xLabel, y);
    doc.line(xStart, y + 2, xEnd, y + 2);
    if (lines.length) {
      for (let i = 0; i < lines.length; i++) {
        const ly = y + (i === 0 ? 0 : i * wrapGap);
        doc.text(lines[i], textStart, ly);
      }
    }
    return y + need;
  };

  // Title row
  setCjkFont(doc, 'normal', 'normal');
  doc.setFontSize(12);
  let y = margin.top + 18;
  y = ensureSpace(24, y);
  doc.text('APPLICATION FOR REMITTANCE', left + 15, y);
  setCjkFont(doc, 'normal', 'normal');
  doc.setFontSize(9);
  doc.text('BANK OF CHINA (HONG KONG) LIMITED', right - 240, y);

  // Remittance currency & amounts
  y += 22;
  y = drawSectionHeader('Remittance Details', y);
  setCjkFont(doc, 'normal', 'normal');
  doc.setFontSize(defaultFontSize);
  y = ensureSpace(20, y);
  doc.text('Remittance Currency', left + 15, y);
  doc.line(left + 75, y + 2, right - 300, y + 2);
  if (data?.remittanceCurrency) doc.text(toAscii(data.remittanceCurrency), left + 80, y - 2);
  doc.text('Name', right - 290, y);
  doc.line(right - 260, y + 2, right - 140, y + 2);
  if (data?.currencyName) doc.text(toAscii(data.currencyName), right - 255, y - 2);

  y += 18;
  y = drawLineField('Amount (Remittance Currency)', y, left + 15, left + 95, right - 240, data?.amount, 5);
  doc.text('Debit Amount', right - 230, y - baseGap);
  doc.line(right - 150, (y - baseGap) + 2, right - 15, (y - baseGap) + 2);
  if (data?.debitAmount) doc.text(toAscii(data.debitAmount), right - 145, (y - baseGap) - 2);

  // Applicant / Accounts
  y += 8;
  y = drawSectionHeader('Applicant / Accounts', y);
  y += 5;
  setCjkFont(doc, 'normal', 'normal');
  y = drawLineField('Sender Name*', y, left + 15, left + 90, right - 15, data?.senderName);

  y = drawLineField('Contact No.', y, left + 15, left + 75, right - 300, data?.contactNumber);
  doc.text('FX Contract No.', right - 290, y - baseGap);
  doc.line(right - 215, (y - baseGap) + 2, right - 15, (y - baseGap) + 2);
  if (data?.fxContractNo) doc.text(toAscii(data.fxContractNo), right - 210, (y - baseGap) - 2);

  y = drawLineField('Exchange Rate', y, left + 15, left + 70, left + 200, data?.exchangeRate);
  doc.text('Debit A/C Currency & No.*', left + 220, y - baseGap);
  doc.line(left + 365, (y - baseGap) + 2, right - 15, (y - baseGap) + 2);
  const debitStr = [toAscii(data?.debitAcCurrency), toAscii(data?.debitAc)].filter(Boolean).join(' / ');
  if (debitStr) drawFittedText(debitStr, left + 370, (y - baseGap) - 2, (right - 15) - (left + 370));

  y = drawLineField('Charges A/C Currency & No. (if different)', y, left + 15, left + 240, right - 15, [data?.chargesDebitAcCurrency, data?.chargesDebitAc].filter(Boolean).join(' / '));

  // Intermediary Bank
  y += 6;
  y = drawSectionHeader('Intermediary Bank', y);
  y += 5;
  setCjkFont(doc, 'normal', 'normal');
  y = drawLineField('Name & Address', y, left + 15, left + 95, right - 15, data?.intermediaryBank);
  y = drawLineField('SWIFT Code', y, left + 15, left + 80, left + 220, data?.swiftCode);
  doc.text('For TT only: CCASS Code', left + 245, y - baseGap);
  doc.line(left + 470, (y - baseGap) + 2, left + 540, (y - baseGap) + 2);
  if (data?.ccassCode) doc.text(toAscii(data.ccassCode), left + 475, (y - baseGap) - 2);
  doc.text('Participant Code', left + 560, y - baseGap);
  doc.line(left + 640, (y - baseGap) + 2, right - 15, (y - baseGap) + 2);
  if (data?.participantCode) drawFittedText(data?.participantCode, left + 645, (y - baseGap) - 2, (right - 15) - (left + 645));

  // Beneficiary Bank
  y += 6;
  y = drawSectionHeader('Beneficiary Bank*', y);
  y += 5;
  setCjkFont(doc, 'normal', 'normal');
  const bn = [toAscii(data?.beneficiaryBank), toAscii(data?.beneficiaryBankAddress)].filter(Boolean).join('  ');
  y = drawLineField('Name & Address', y, left + 15, left + 95, right - 15, bn);

  // grid row for country/province/city/bank code
  // Country
  const rowY = y; // snapshot before row draw
  const countryStr = toAscii(data?.beneficiaryCountry);
  const provinceStr = toAscii(data?.beneficiaryProvince);
  const cityStr = toAscii(data?.beneficiaryCity);
  const bankCodeStr = toAscii(data?.bankCode);
  // compute max needed height among these 4 short fields (no wrap expected, but guard)
  const maxNeed = baseGap;
  y = ensureSpace(maxNeed, y);
  doc.text('Country/Region', left + 15, y);
  doc.line(left + 75, y + 2, left + 192, y + 2);
  if (countryStr) drawFittedText(countryStr, left + 80, y - 2, (left + 192) - (left + 80));
  doc.text('Province', left + 190, y);
  doc.line(left + 210, y + 2, left + 270, y + 2);
  if (provinceStr) drawFittedText(provinceStr, left + 215, y - 2, (left + 270) - (left + 215));
  doc.text('City', left + 290, y);
  doc.line(left + 320, y + 2, left + 432, y + 2);
  if (cityStr) drawFittedText(cityStr, left + 325, y - 2, (left + 432) - (left + 325));
  doc.text('Bank Code', left + 430, y);
  doc.line(left + 480, y + 2, right - 27, y + 2);
  if (bankCodeStr) drawFittedText(bankCodeStr, left + 485, y - 2, (right - 27) - (left + 485));
  y = rowY + baseGap;

  // Beneficiary details
  y += 6;
  y = drawSectionHeader('Beneficiary Details*', y);
  y += 5;
  setCjkFont(doc, 'normal', 'normal');
  y = drawLineField('Account No./IBAN*', y, left + 15, left + 120, right - 15, data?.beneficiaryAccount || data?.iban);
  y = drawLineField('Name*', y, left + 15, left + 55, right - 15, data?.beneficiaryName);
  const addr = [toAscii(data?.beneficiaryAddress), toAscii(data?.beneficiaryPhone)].filter(Boolean).join(' / ');
  y = drawLineField('Address / Contact Tel.', y, left + 15, left + 140, right - 15, addr);

  // Message
  y += 6;
  y = drawLineField('Message', y, left + 15, left + 65, right - 15, data?.message);

  // Charges and purpose
  y += 8;
  y = drawLineField('Bank Charges*', y, left + 15, left + 90, left + 220, data?.bankCharges);
  doc.text('Purpose*', left + 240, y - baseGap);
  doc.line(left + 265, (y - baseGap) + 2, right - 90, (y - baseGap) + 2);
  if (data?.purpose) drawFittedText(data?.purpose, left + 270, (y - baseGap) - 2, (right - 90) - (left + 270));
  doc.line(right - 90, (y - baseGap) + 2, right - 15, (y - baseGap) + 2);
  if (data?.purposeDetail) drawFittedText(data?.purposeDetail, right - 85, (y - baseGap) - 2, (right - 15) - (right - 85));

  // Bank use / approval
  y += 10;
  y = drawSectionHeader('Bank Use / Approval', y);
  y += 5;
  setCjkFont(doc, 'normal', 'normal');
  doc.text('Same Day  Next Day  AM  PM  Others:', right - 220, y);
  if (data?.bankUseNote) drawFittedText(data?.bankUseNote, right - 140, y, (right - 15) - (right - 140));

  y += 20;
  y = drawLineField('Approval', y, left + 15, left + 70, left + 260, data?.approval);
  doc.text('Checker', left + 280, y - baseGap);
  doc.line(left + 330, (y - baseGap) + 2, right - 15, (y - baseGap) + 2);
  if (data?.checker) drawFittedText(data?.checker, left + 335, (y - baseGap) - 2, (right - 15) - (left + 335));

  y = drawLineField('Remarks', y, left + 15, left + 70, right - 15, data?.remarks);

  // Signature & Date
  y = ensureSpace(40, y + 22);
  doc.text('Remitter Signature*', left + 15, y);
  doc.line(left + 90, y + 2, right - 150, y + 2);
  if (data?.signature) drawFittedText(data?.signature, left + 95, y - 2, (right - 150) - (left + 95));
  doc.text('Date', right - 135, y);
  doc.line(right - 105, y + 2, right - 15, y + 2);
  if (data?.date) drawFittedText(data?.date, right - 100, y - 2, (right - 15) - (right - 100));
};