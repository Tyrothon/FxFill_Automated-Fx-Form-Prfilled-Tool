// Templates library: bank templates, scene templates, and apply helpers
// This module is intentionally lightweight and extendable.

import { BANK_ALIASES } from './bankDictionary';

// Basic bank templates keyed by canonical bank name.
// Only a few examples are provided; you can extend freely.
export const BANK_TEMPLATES = {
  'Standard Chartered Bank': {
    defaultCurrency: 'USD',
    swift: 'SCBLHKHHXXX',
    ibanExample: '',
    routingScheme: 'SWIFT',
    beneficiaryBank: 'Standard Chartered Bank',
    intermediaryBank: 'Standard Chartered Bank',
  },
  'HSBC': {
    defaultCurrency: 'USD',
    swift: 'HSBCHKHHHKH',
    ibanExample: '',
    routingScheme: 'SWIFT',
    beneficiaryBank: 'HSBC',
    intermediaryBank: 'HSBC',
  },
  'Bank of China': {
    defaultCurrency: 'CNY',
    swift: 'BKCHCNBJ',
    ibanExample: '',
    routingScheme: 'CN-Domestic',
    beneficiaryBank: 'Bank of China',
  }
};

// Scene templates focus on typical fields for common remittance scenarios.
export const SCENE_TEMPLATES = {
  invoicePayment: {
    label: 'Invoice Payment',
    preset: {
      paymentMethod: 'From Account',
      chargesDebitAcCurrency: 'USD',
    }
  },
  salaryRemittance: {
    label: 'Salary Remittance',
    preset: {
      paymentMethod: 'From Account',
      debitAcCurrency: 'USD',
    }
  },
  supplierPayment: {
    label: 'Supplier Payment',
    preset: {
      paymentMethod: 'From Account',
    }
  }
};

export function getBankTemplateByName(name) {
  const n = String(name || '').trim();
  if (!n) return null;
  const hit = Object.keys(BANK_TEMPLATES).find(k => n.toLowerCase().includes(k.toLowerCase()));
  return hit ? BANK_TEMPLATES[hit] : null;
}

export function listAvailableBankTemplates() {
  const set = new Set(BANK_ALIASES.map(b => b.canonical));
  const supported = Array.from(set).filter(n => BANK_TEMPLATES[n]);
  return supported.map(n => ({ name: n, template: BANK_TEMPLATES[n] }));
}

export function listSceneTemplates() {
  return Object.entries(SCENE_TEMPLATES).map(([key, v]) => ({ key, label: v.label, preset: v.preset }));
}

// FX form specific scene templates
export const FX_SCENE_TEMPLATES = {
  spotFx: { label: 'Spot FX', preset: { status: 'Spot', valueDate: 'T+2' } },
  forwardFx: { label: 'Forward Contract', preset: { status: 'Forward', valueDate: '2025-12-31' } },
  fxSwap: { label: 'FX Swap', preset: { status: 'Swap', valueDate: 'T+2' } },
};

export function listFxSceneTemplates() {
  return Object.entries(FX_SCENE_TEMPLATES).map(([key, v]) => ({ key, label: v.label, preset: v.preset }));
}

// Apply a template to a form model
// Fields chosen to be non-destructive: only overwrite when target missing or explicitly allowed.
export function applyTemplate(form, template, opts = { overwriteExisting: false }) {
  const out = { ...form };
  if (!template) return out;
  const setField = (key, value) => {
    if (value == null) return;
    if (opts.overwriteExisting || !out[key] || String(out[key]).trim() === '') {
      out[key] = value;
    }
  };

  // Bank-specific
  if (template.defaultCurrency) {
    setField('debitAcCurrency', template.defaultCurrency);
    setField('chargesDebitAcCurrency', template.defaultCurrency);
  }
  setField('beneficiaryBank', template.beneficiaryBank);
  setField('intermediaryBank', template.intermediaryBank);

  // Scene presets
  if (template.preset) {
    Object.entries(template.preset).forEach(([k, v]) => setField(k, v));
  }

  return out;
}

// Compose multiple sources into a single template-like preset.
// Placeholder implementation — wire up to company records/payees/history later.
export function composeAutoPrefill({ companyProfile, commonPayee, historyItem, aiExtract }) {
  const preset = {};
  if (companyProfile) {
    preset.senderName = companyProfile.legalName;
    preset.address = companyProfile.registeredAddress;
  }
  if (commonPayee) {
    preset.beneficiaryName = commonPayee.name;
    preset.beneficiaryBank = commonPayee.bankName;
    preset.debitAcCurrency = commonPayee.currency;
  }
  if (historyItem) {
    preset.paymentMethod = historyItem.paymentMethod;
    preset.fxRates = historyItem.fxRates;
  }
  if (aiExtract) {
    // Minimal safe fields
    preset.beneficiaryName = preset.beneficiaryName || aiExtract.beneficiaryName;
    preset.beneficiaryBank = preset.beneficiaryBank || aiExtract.beneficiaryBank;
  }
  return { label: 'Auto Prefill', preset };
}