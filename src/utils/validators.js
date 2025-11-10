// 轻量前端合规校验工具（不改动现有 API）。
// 提供常用字段校验与清单生成，供页面调用。

// 基础校验函数
export const isNonEmpty = (v) => v != null && String(v).trim() !== '';
export const isCurrencyCode = (code) => {
  const s = String(code || '').toUpperCase();
  return /^[A-Z]{3}$/.test(s);
};
export const isAccountNumber = (num) => {
  const s = String(num || '').replace(/\s+/g, '');
  // 简化校验：长度 6-34，允许字母数字（兼容 IBAN 局部），至少包含 6 个字符
  return /^[A-Za-z0-9]{6,34}$/.test(s);
};
export const isPlausibleBankName = (name) => {
  const s = String(name || '').trim();
  if (!s) return false;
  // 不应包含明显的账号/电话等信息
  const forbidden = /(account\s*(no\.|number)|a\/c\s*no\.|swift|tel\.?|电话|地址)/i;
  return !forbidden.test(s) && s.length >= 3;
};
export const isDateLike = (v) => {
  const s = String(v || '').trim();
  if (!s) return false;
  // 支持 yyyy-mm-dd 或 dd/mm/yyyy 的简单校验
  return /(\d{4}-\d{1,2}-\d{1,2})|(\d{1,2}\/\d{1,2}\/\d{4})/.test(s);
};
export const isPhoneLike = (v) => {
  const s = String(v || '').replace(/[^0-9+]/g, '');
  // 简化校验：至少 7 位数字，允许国家码
  const digits = s.replace(/[^0-9]/g, '');
  return digits.length >= 7;
};

// 合规校验清单生成（返回问题列表）
export const buildComplianceChecklist = (data = {}) => {
  const issues = [];

  // 申请人与日期/电话
  if (!isNonEmpty(data.senderName)) {
    issues.push({ key: 'senderName', message: 'Sender name is required', severity: 'error' });
  }
  if (isNonEmpty(data.date) && !isDateLike(data.date)) {
    issues.push({ key: 'date', message: 'Date format appears invalid. Use YYYY-MM-DD', severity: 'warn' });
  }
  if (isNonEmpty(data.contactNumber) && !isPhoneLike(data.contactNumber)) {
    issues.push({ key: 'contactNumber', message: 'Contact number may be invalid', severity: 'warn' });
  }

  // 转账指令：账户与货币
  if (!isCurrencyCode(data.debitAcCurrency)) {
    issues.push({ key: 'debitAcCurrency', message: 'Debit A/C currency must be a 3-letter code (e.g., USD)', severity: 'error' });
  }
  if (!isAccountNumber(data.debitAc)) {
    issues.push({ key: 'debitAc', message: 'Debit A/C account number appears invalid', severity: 'error' });
  }
  // 费用账户：在 BOC 页面为“如与上述不同”，属于可选；
  // 仅当用户填写其一时才进行完整性与格式校验。
  const hasChargesInfo = isNonEmpty(data.chargesDebitAcCurrency) || isNonEmpty(data.chargesDebitAc);
  if (hasChargesInfo) {
    if (!isCurrencyCode(data.chargesDebitAcCurrency)) {
      issues.push({ key: 'chargesDebitAcCurrency', message: 'Charges Debit A/C currency must be a 3-letter code', severity: 'error' });
    }
    if (!isAccountNumber(data.chargesDebitAc)) {
      issues.push({ key: 'chargesDebitAc', message: 'Charges Debit A/C account number appears invalid', severity: 'error' });
    }
  }

  // 银行信息
  if (isNonEmpty(data.intermediaryBank) && !isPlausibleBankName(data.intermediaryBank)) {
    issues.push({ key: 'intermediaryBank', message: 'Intermediary bank name contains extraneous info or is invalid', severity: 'warn' });
  }
  if (!isNonEmpty(data.beneficiaryBank) || !isPlausibleBankName(data.beneficiaryBank)) {
    issues.push({ key: 'beneficiaryBank', message: 'Beneficiary bank name is missing or invalid', severity: 'error' });
  }
  if (!isNonEmpty(data.beneficiaryName)) {
    issues.push({ key: 'beneficiaryName', message: 'Beneficiary name is required', severity: 'error' });
  }

  return issues;
};