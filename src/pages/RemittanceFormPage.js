import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { canonicalizeBankName } from '../utils/bankDictionary'
import { buildComplianceChecklist } from '../utils/validators';
import { listAvailableBankTemplates, listSceneTemplates, applyTemplate } from '../utils/templates';

const FormContainer = styled.div`
  padding: 0;
  background-color: #fff;
  font-family: Arial, sans-serif;
  border: 2px solid #000;
  max-width: 800px;
  margin: 20px auto;
  font-size: 11px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #000;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  letter-spacing: 1px;
`;

const BankLogo = styled.div`
  border: 1px solid #000;
  padding: 8px 12px;
  font-size: 10px;
  font-weight: normal;
  text-align: center;
`;

const Instructions = styled.div`
  padding: 8px 15px;
  border-bottom: 1px solid #000;
  font-size: 10px;
`;

const CheckboxInstruction = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 3px;
`;

const SmallCheckbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 5px;
  transform: scale(0.8);
`;

const SectionHeader = styled.div`
  background-color: #000;
  color: white;
  padding: 6px 15px;
  font-weight: bold;
  font-size: 11px;
`;

const SectionContent = styled.div`
  padding: 10px 15px;
  border-bottom: 1px solid #000;
`;

const FieldRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: center;
`;

const FieldLabel = styled.label`
  font-size: 10px;
  margin-right: 10px;
  min-width: ${props => props.width || '120px'};
`;

const FieldInput = styled.input`
  border: none;
  border-bottom: 1px solid #000;
  flex-grow: 1;
  font-size: 10px;
  padding: 2px 0;
  background: transparent;
`;

const TwoColumnRow = styled.div`
  display: flex;
  margin-bottom: 8px;
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  margin-right: 20px;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-right: 20px;
  font-size: 10px;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 5px;
  transform: scale(0.8);
`;

const CurrencyAccountRow = styled.div`
  display: flex;
  margin-bottom: 3px;
  align-items: flex-end;
`;

const CurrencyLabel = styled.div`
  font-size: 9px;
  text-align: center;
  margin-right: 15px;
  min-width: 80px;
`;

const AccountLabel = styled.div`
  font-size: 9px;
  text-align: center;
  flex: 1;
  margin-left: 20px;
`;

const SignatureSection = styled.div`
  margin-top: 10px;
  padding: 8px;
  border: 1px solid #000;
  min-height: 60px;
  background: white;
`;

const SignatureLabel = styled.div`
  font-size: 9px;
  font-weight: normal;
  margin-bottom: 3px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  margin: 16px;
`;

const TemplateBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  border-bottom: 1px solid #000;
  background: #f9fafb;
`;

const Select = styled.select`
  font-size: 10px;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  background: white;
`;

const SmallButton = styled.button`
  font-size: 10px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  ${props => props.primary ? `
    background: #6366f1;
    color: white;
    border: none;
    &:hover { background: #5856eb; }
  ` : `
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
    &:hover { border-color: #6366f1; color: #6366f1; }
  `}
`;

// --- Bank-specific renderers (preview only) ---
const detectRemittanceLayout = (data) => {
  const s = String(
    data?.layoutBank ||
    data?.bank ||
    data?.formBank ||
    data?.selectedBank ||
    data?.remittingBank ||
    ''
  ).toLowerCase();
  if (!s) return 'generic';
  if (s.includes('hsbc') || s.includes('hongkong and shanghai banking corporation')) return 'hsbc';
  if (s.includes('standard chartered') || s.includes('scb')) return 'scb';
  if (s.includes('bank of china') || s.includes('boc')) return 'boc';
  return 'generic';
};

const renderHsbcRemittanceForm = (doc, page, margin, data) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  doc.text('Account Holder Information', margin.left + 15, margin.top + 20);

  doc.text('Debit Account Number', margin.left + 15, margin.top + 35);
  doc.line(margin.left + 150, margin.top + 37, page.width - margin.right - 15, margin.top + 37);
  if (data?.debitAc) doc.text(String(data.debitAc), margin.left + 155, margin.top + 34);

  doc.text('Currency / Account Type', margin.left + 15, margin.top + 52);
  doc.line(margin.left + 150, margin.top + 54, page.width - margin.right - 15, margin.top + 54);
  if (data?.debitAcCurrency) doc.text(String(data.debitAcCurrency), margin.left + 155, margin.top + 51);

  doc.text('Payment Details', margin.left + 15, margin.top + 75);

  doc.text('Amount in Remittance Currency', margin.left + 15, margin.top + 90);
  doc.line(margin.left + 200, margin.top + 92, page.width - margin.right - 15, margin.top + 92);
  if (data?.amount) doc.text(String(data.amount), margin.left + 205, margin.top + 89);

  doc.text('Beneficiary Bank Details', margin.left + 15, margin.top + 110);

  doc.text('Bank Name', margin.left + 15, margin.top + 125);
  doc.line(margin.left + 100, margin.top + 127, page.width - margin.right - 15, margin.top + 127);
  if (data?.beneficiaryBank) doc.text(String(data.beneficiaryBank), margin.left + 105, margin.top + 124);

  doc.text('Beneficiary Details', margin.left + 15, margin.top + 145);

  doc.text('Name', margin.left + 15, margin.top + 160);
  doc.line(margin.left + 80, margin.top + 162, page.width - margin.right - 15, margin.top + 162);
  if (data?.beneficiaryName) doc.text(String(data.beneficiaryName), margin.left + 85, margin.top + 159);

  doc.text('Fund Transfer Charges', margin.left + 15, margin.top + 180);

  doc.text('Charge Account Number', margin.left + 15, margin.top + 195);
  doc.line(margin.left + 160, margin.top + 197, page.width - margin.right - 15, margin.top + 197);
  if (data?.chargesDebitAc) doc.text(String(data.chargesDebitAc), margin.left + 165, margin.top + 194);

  doc.text('Currency / Account Type', margin.left + 15, margin.top + 212);
  doc.line(margin.left + 160, margin.top + 214, page.width - margin.right - 15, margin.top + 214);
  if (data?.chargesDebitAcCurrency) doc.text(String(data.chargesDebitAcCurrency), margin.left + 165, margin.top + 211);

  doc.text('Ordering Party Details', margin.left + 15, margin.top + 232);

  doc.text('Full Name', margin.left + 15, margin.top + 247);
  doc.line(margin.left + 100, margin.top + 249, page.width - margin.right - 15, margin.top + 249);
  if (data?.senderName) doc.text(String(data.senderName), margin.left + 105, margin.top + 246);

  doc.text('Address', margin.left + 15, margin.top + 264);
  doc.line(margin.left + 80, margin.top + 266, page.width - margin.right - 15, margin.top + 266);
  if (data?.address) doc.text(String(data.address), margin.left + 85, margin.top + 263);
};

const renderBocRemittanceForm = (doc, page, margin, data) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  doc.setFontSize(12);
  doc.text('Remittance Application (BOC Hong Kong)', margin.left + 15, margin.top + 20);
  doc.setFontSize(9);
  doc.text('BANK OF CHINA (HONG KONG) LIMITED', page.width - margin.right - 250, margin.top + 20);

  doc.setFont('helvetica', 'bold');
  doc.text('Remittance Details', margin.left + 15, margin.top + 40);
  doc.setFont('helvetica', 'normal');

  doc.text('Remittance Currency', margin.left + 15, margin.top + 58);
  doc.line(margin.left + 160, margin.top + 60, page.width - margin.right - 15, margin.top + 60);
  if (data?.remittanceCurrency || data?.debitAcCurrency) {
    doc.text(String(data.remittanceCurrency || data.debitAcCurrency), margin.left + 165, margin.top + 57);
  }

  doc.text('Amount (Remittance Currency)', margin.left + 15, margin.top + 76);
  doc.line(margin.left + 200, margin.top + 78, page.width - margin.right - 15, margin.top + 78);
  if (data?.amount) {
    doc.text(String(data.amount), margin.left + 205, margin.top + 75);
  }

  doc.text('Debit Amount', margin.left + 360, margin.top + 76);
  doc.line(margin.left + 430, margin.top + 78, page.width - margin.right - 15, margin.top + 78);
  if (data?.debitAmount || data?.amount) {
    doc.text(String(data.debitAmount || data.amount), margin.left + 435, margin.top + 75);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Applicant / Accounts', margin.left + 15, margin.top + 98);
  doc.setFont('helvetica', 'normal');

  doc.text('Sender Name', margin.left + 15, margin.top + 116);
  doc.line(margin.left + 100, margin.top + 118, page.width - margin.right - 15, margin.top + 118);
  if (data?.senderName) {
    doc.text(String(data.senderName), margin.left + 105, margin.top + 115);
  }

  doc.text('Contact No.', margin.left + 15, margin.top + 134);
  doc.line(margin.left + 100, margin.top + 136, page.width - margin.right - 15, margin.top + 136);
  if (data?.contactNumber) {
    doc.text(String(data.contactNumber), margin.left + 105, margin.top + 133);
  }

  doc.text('Debit A/C Currency & No.', margin.left + 15, margin.top + 152);
  doc.line(margin.left + 170, margin.top + 154, page.width - margin.right - 15, margin.top + 154);
  if (data?.debitAc || data?.debitAcCurrency) {
    const v = [data.debitAcCurrency, data.debitAc].filter(Boolean).join(' / ');
    doc.text(String(v), margin.left + 175, margin.top + 151);
  }

  doc.text('Charges A/C Currency & No.', margin.left + 15, margin.top + 170);
  doc.line(margin.left + 180, margin.top + 172, page.width - margin.right - 15, margin.top + 172);
  if (data?.chargesDebitAc || data?.chargesDebitAcCurrency) {
    const v = [data.chargesDebitAcCurrency, data.chargesDebitAc].filter(Boolean).join(' / ');
    doc.text(String(v), margin.left + 185, margin.top + 169);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Intermediary Bank', margin.left + 15, margin.top + 192);
  doc.setFont('helvetica', 'normal');

  doc.text('Name & Address', margin.left + 15, margin.top + 210);
  doc.line(margin.left + 120, margin.top + 212, page.width - margin.right - 15, margin.top + 212);
  if (data?.intermediaryBank) {
    doc.text(String(data.intermediaryBank), margin.left + 125, margin.top + 209);
  }

  doc.text('SWIFT Code', margin.left + 15, margin.top + 228);
  doc.line(margin.left + 100, margin.top + 230, page.width - margin.right - 15, margin.top + 230);
  if (data?.intermediarySwift) {
    doc.text(String(data.intermediarySwift), margin.left + 105, margin.top + 227);
  }

  doc.setFont('helvetica', 'bold');
  doc.text("Beneficiary's Bank", margin.left + 15, margin.top + 250);
  doc.setFont('helvetica', 'normal');

  doc.text('Name & Address', margin.left + 15, margin.top + 268);
  doc.line(margin.left + 120, margin.top + 270, page.width - margin.right - 15, margin.top + 270);
  if (data?.beneficiaryBank) {
    doc.text(String(data.beneficiaryBank), margin.left + 125, margin.top + 267);
  }

  doc.text('SWIFT Code', margin.left + 15, margin.top + 286);
  doc.line(margin.left + 100, margin.top + 288, page.width - margin.right - 15, margin.top + 288);
  if (data?.beneficiarySwift) {
    doc.text(String(data.beneficiarySwift), margin.left + 105, margin.top + 285);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Beneficiary', margin.left + 15, margin.top + 308);
  doc.setFont('helvetica', 'normal');

  doc.text('Name', margin.left + 15, margin.top + 326);
  doc.line(margin.left + 80, margin.top + 328, page.width - margin.right - 15, margin.top + 328);
  if (data?.beneficiaryName) {
    doc.text(String(data.beneficiaryName), margin.left + 85, margin.top + 325);
  }
};


// 合规校验清单面板（英文文案）
const ChecklistPanel = styled.div`
  background: #fff7ed; /* amber-50 */
  border: 1px solid #f59e0b; /* amber-500 */
  margin: 12px 16px;
  border-radius: 8px;
`;
const ChecklistHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  font-size: 12px;
  color: #78350f; /* amber-900 */
  font-weight: 600;
`;
const ChecklistList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 8px 12px 12px;
`;
const ChecklistItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 11px;
`;
const Badge = styled.span`
  display: inline-block;
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 10px;
  ${props => props.severity === 'error' ? `
    background: #fee2e2; color: #991b1b; border: 1px solid #ef4444;
  ` : `
    background: #fef3c7; color: #92400e; border: 1px solid #f59e0b;
  `}
`;

const RemittanceFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bankStyle = location.state?.bankStyle || '';

  const bankLabelFromStyle = (style) => {
    switch (style) {
      case 'boc':
        return 'Bank of China';
      case 'hsbc':
        return 'HSBC';
      case 'scb':
        return 'Standard Chartered';
      default:
        return 'Standard Chartered';
    }
  };
  const initialData = location.state?.extractedInfo || location.state?.remittanceData || {};

  const normalizeBankName = (name) => {
    const s = String(name || '');
    if (!s) return '';
    let out = s
      .replace(/[\,\s]*Account\s*(No\.|Number).*$/i, '')
      .replace(/[\,\s]*A\/C\s*No\..*$/i, '')
      .replace(/[\,\s]*SWIFT\s*[:：]?.*$/i, '')
      .replace(/[\,\s]*地址[:：]?.*$/i, '')
      .replace(/[\,\s]*Tel\.?[:：]?.*$/i, '')
      .replace(/[\,\s]*电话[:：]?.*$/i, '');
    out = out
      .replace(/\s{2,}/g, ' ')
      .replace(/[，,]+/g, ', ')
      .replace(/[。.;]+$/g, '')
      .trim();
    out = out.replace(/(Bank of [A-Za-z\s]+)(,\s*)/i, '$1 ');
    return canonicalizeBankName(out);
  };

  const normalizeSenderName = (name) => {
    return String(name || '')
      .replace(/^THE\s*BUYER\s*[:：]\s*/i, '')
      .replace(/^Buyer\s*[:：\-]?\s*/i, '')
      .replace(/^采购方\s*[:：]\s*/i, '')
      .trim();
  };

  const normalizedInitial = {
    ...initialData,
    // senderName: normalizeSenderName(initialData.senderName),
    // beneficiaryBank: normalizeBankName(initialData.beneficiaryBank),
    // intermediaryBank: normalizeBankName(initialData.intermediaryBank),
    bank: bankLabelFromStyle(bankStyle)
  };

  const [formData, setFormData] = useState(normalizedInitial);
  const [errors, setErrors] = useState({});
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedScene, setSelectedScene] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewGenerating, setPreviewGenerating] = useState(false);

  const normalizeCurrency = (v) => (v || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const validateRequired = () => {
    const e = {};
    if (!formData.debitAcCurrency || formData.debitAcCurrency.length !== 3) e.debitAcCurrency = '需要3位货币代码';
    if (!formData.debitAc || String(formData.debitAc).trim() === '') e.debitAc = '需要账户号码';
    if (!formData.chargesDebitAcCurrency || formData.chargesDebitAcCurrency.length !== 3) e.chargesDebitAcCurrency = '需要3位货币代码';
    if (!formData.chargesDebitAc || String(formData.chargesDebitAc).trim() === '') e.chargesDebitAc = '需要账户号码';
    setErrors(e);
    return e;
  };

  const handleEdit = () => {
    navigate('/chatbot', { state: { remittanceData: formData } });
  };

  const handleConfirmDownload = () => {
    const err = validateRequired();
    const checklist = buildComplianceChecklist(formData);
    // 高亮错误项（严重错误）
    const highlight = { ...err };
    checklist.forEach(it => { if (it.severity === 'error') highlight[it.key] = true; });
    setErrors(highlight);

    if (Object.keys(err).length > 0 || checklist.length > 0) {
      const critical = checklist.filter(i => i.severity === 'error').map(i => i.message);
      const missing = [
        err.debitAcCurrency && 'Debit A/C Currency',
        err.debitAc && 'Debit A/C No.',
        err.chargesDebitAcCurrency && 'Charges Debit A/C Currency',
        err.chargesDebitAc && 'Charges Debit A/C No.'
      ].filter(Boolean).join(', ');
      const summary = [
        missing && `Please provide required currency/account info: ${missing}`,
        critical.length ? `Compliance issues: ${critical.join('; ')}` : null
      ].filter(Boolean).join('\n');
      alert(summary || 'There are items to fix. Please review the checklist.');
      return;
    }
    navigate('/download', { state: { remittanceData: formData, fileType: 'remittance', from: '/remittance-form' } });
  };

  const handlePreviewPdf = () => {
    setPreviewGenerating(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const page = { width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight() };
      const margin = { left: 30, right: 30, top: 30, bottom: 30 };
      const data = { ...formData };

      let layout = bankStyle ? (bankStyle === 'boc' ? 'boc' : bankStyle === 'hsbc' ? 'hsbc' : bankStyle === 'scb' ? 'scb' : 'generic') : detectRemittanceLayout(data);

      if (layout === 'hsbc') {
        renderHsbcRemittanceForm(doc, page, margin, data);
      } else if (layout === 'boc') {
        renderBocRemittanceForm(doc, page, margin, data);
      } else {
        // Minimal generic preview: title + key fields
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('REMITTANCE APPLICATION FORM', margin.left + 15, margin.top + 24);
        doc.setFontSize(10);
        doc.text(bankLabelFromStyle(bankStyle || ''), margin.left + 15, margin.top + 40);

        doc.setFontSize(9);
        doc.text('Name of Sender', margin.left + 15, margin.top + 70);
        doc.line(margin.left + 120, margin.top + 72, page.width - margin.right - 15, margin.top + 72);
        if (data?.senderName) doc.text(String(data.senderName), margin.left + 125, margin.top + 69);

        doc.text('Debit A/C No.', margin.left + 15, margin.top + 90);
        doc.line(margin.left + 100, margin.top + 92, page.width - margin.right - 15, margin.top + 92);
        if (data?.debitAc) doc.text(String(data.debitAc), margin.left + 105, margin.top + 89);

        doc.text("Beneficiary's Bank Name", margin.left + 15, margin.top + 110);
        doc.line(margin.left + 160, margin.top + 112, page.width - margin.right - 15, margin.top + 112);
        if (data?.beneficiaryBank) doc.text(String(data.beneficiaryBank), margin.left + 165, margin.top + 109);
      }

      const url = doc.output('bloburl');
      setPreviewUrl(url);
    } catch (e) {
      console.error('PDF preview error:', e);
      alert('无法生成预览，请稍后重试。');
    } finally {
      setPreviewGenerating(false);
    }
  };

  const handleApplyTemplate = () => {
    let tpl = null;
    if (selectedBank) {
      const bankTpl = listAvailableBankTemplates().find(b => b.name === selectedBank)?.template;
      if (bankTpl) tpl = { ...bankTpl };
    }
    if (selectedScene) {
      const sceneTpl = listSceneTemplates().find(s => s.key === selectedScene)?.preset;
      if (sceneTpl) tpl = { ...(tpl || {}), preset: sceneTpl };
    }
    const merged = applyTemplate(formData, tpl || {}, { overwriteExisting: false });
    setFormData(merged);
  };

  return (
    <FormContainer>
      <Header>
        <Title>REMITTANCE APPLICATION FORM</Title>
        <BankLogo>
          {bankLabelFromStyle(bankStyle)}
        </BankLogo>
      </Header>

      <TemplateBar>
        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Templates</span>
        <Select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
          <option value="">Bank…</option>
          {listAvailableBankTemplates().map((b) => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </Select>
        <Select value={selectedScene} onChange={e => setSelectedScene(e.target.value)}>
          <option value="">Scene…</option>
          {listSceneTemplates().map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </Select>
        <SmallButton onClick={handleApplyTemplate}>Apply Template</SmallButton>
      </TemplateBar>

      <Instructions>
        <CheckboxInstruction>
          <SmallCheckbox />
          <span>Please '✓' where applicable</span>
        </CheckboxInstruction>
        <div>* Indicating mandatory information to be provided</div>
      </Instructions>

      {/* Compliance checklist (English) */}
      {(() => {
        const checklist = buildComplianceChecklist(formData);
        return (
          <ChecklistPanel>
            <ChecklistHeader>
              <span>Compliance Checklist</span>
              <span>{checklist.length === 0 ? 'All checks passed' : `Found ${checklist.length} item(s) to address`}</span>
            </ChecklistHeader>
            {checklist.length > 0 && (
              <ChecklistList>
                {checklist.map((item, idx) => (
                  <ChecklistItem key={idx}>
                    <Badge severity={item.severity}>{item.severity === 'error' ? 'Error' : 'Warning'}</Badge>
                    <span>{item.message}</span>
                  </ChecklistItem>
                ))}
              </ChecklistList>
            )}
          </ChecklistPanel>
        );
      })()}

      <FieldRow style={{padding: '8px 15px', borderBottom: '1px solid #000'}}>
        <Column>
          <FieldLabel width="60px">Branch</FieldLabel>
          <FieldInput value={formData.branch || ''} onChange={e => setFormData({ ...formData, branch: e.target.value })} />
        </Column>
        <Column>
          <FieldLabel width="40px">Date</FieldLabel>
          <FieldInput value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} />
        </Column>
      </FieldRow>

      <SectionHeader>Applicant's Information</SectionHeader>
      <SectionContent>
        <TwoColumnRow>
          <Column>
            <FieldLabel width="100px">Name of Sender*</FieldLabel>
            <FieldInput value={formData.senderName || ''} onChange={e => setFormData({ ...formData, senderName: e.target.value })} />
          </Column>
          <Column>
            <FieldLabel width="100px">ID/Passport No.</FieldLabel>
            <FieldInput value={formData.idNumber || ''} onChange={e => setFormData({ ...formData, idNumber: e.target.value })} />
          </Column>
        </TwoColumnRow>
        
        <FieldRow>
          <FieldLabel width="60px">Address</FieldLabel>
          <FieldInput value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} />
        </FieldRow>

        <TwoColumnRow>
          <Column>
            <CheckboxLabel>
              <span>Resident (Yes/No)</span>
            </CheckboxLabel>
            <CheckboxLabel>
              <Checkbox />
              <span>Yes</span>
            </CheckboxLabel>
            <CheckboxLabel>
              <Checkbox />
              <span>No</span>
            </CheckboxLabel>
          </Column>
          <Column>
            <FieldLabel width="140px">Contact Telephone Number</FieldLabel>
            <FieldInput value={formData.contactNumber || ''} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
          </Column>
        </TwoColumnRow>
      </SectionContent>

      <SectionHeader>Transfer Instruction</SectionHeader>
      <SectionContent>
        <CheckboxRow>
          <span style={{marginRight: '20px'}}>Payment Method</span>
          <CheckboxLabel>
            <Checkbox />
            <span>From Account</span>
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox />
            <span>By Cash</span>
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox />
            <span>Others</span>
          </CheckboxLabel>
        </CheckboxRow>

        <CurrencyAccountRow>
           <CurrencyLabel>Currency</CurrencyLabel>
           <AccountLabel>Account</AccountLabel>
         </CurrencyAccountRow>
         <FieldRow>
           <FieldInput
             style={{width: '80px', marginRight: '15px', border: errors.debitAcCurrency ? '1px solid #dc2626' : undefined}}
             value={formData.debitAcCurrency || ''}
             onChange={e => setFormData({ ...formData, debitAcCurrency: normalizeCurrency(e.target.value) })}
             maxLength={3}
             placeholder="USD"
           />
           <FieldInput
             style={{flex: 1, marginLeft: '20px', border: errors.debitAc ? '1px solid #dc2626' : undefined}}
             value={formData.debitAc || ''}
             onChange={e => setFormData({ ...formData, debitAc: e.target.value })}
             placeholder="Account number"
           />
         </FieldRow>

        <FieldRow>
          <FieldLabel width="100px">Debit A/C No.*</FieldLabel>
          <FieldInput value={formData.debitAc || ''} onChange={e => setFormData({ ...formData, debitAc: e.target.value })} />
        </FieldRow>

        <CurrencyAccountRow>
           <CurrencyLabel>Currency</CurrencyLabel>
           <AccountLabel>Account</AccountLabel>
         </CurrencyAccountRow>
         <FieldRow>
           <FieldInput
             style={{width: '80px', marginRight: '15px', border: errors.chargesDebitAcCurrency ? '1px solid #dc2626' : undefined}}
             value={formData.chargesDebitAcCurrency || ''}
             onChange={e => setFormData({ ...formData, chargesDebitAcCurrency: normalizeCurrency(e.target.value) })}
             maxLength={3}
             placeholder="USD"
           />
           <FieldInput
             style={{flex: 1, marginLeft: '20px', border: errors.chargesDebitAc ? '1px solid #dc2626' : undefined}}
             value={formData.chargesDebitAc || ''}
             onChange={e => setFormData({ ...formData, chargesDebitAc: e.target.value })}
             placeholder="Account number"
           />
         </FieldRow>

        <FieldRow>
          <FieldLabel width="140px">Charges Debit A/C No.*</FieldLabel>
          <FieldInput value={formData.chargesDebitAc || ''} onChange={e => setFormData({ ...formData, chargesDebitAc: e.target.value })} />
        </FieldRow>

      </SectionContent>

      <SectionContent style={{borderBottom: 'none', paddingTop: '0'}}>
        <FieldRow>
          <FieldLabel width="140px">Intermediary Bank Name</FieldLabel>
          <FieldInput value={formData.intermediaryBank || ''}
            onChange={e => setFormData({ ...formData, intermediaryBank: e.target.value })}
            onBlur={e => setFormData({ ...formData, intermediaryBank: normalizeBankName(e.target.value) })}
          />
        </FieldRow>

        <FieldRow>
          <FieldLabel width="140px">Beneficiary's Bank Name</FieldLabel>
          <FieldInput value={formData.beneficiaryBank || ''}
            onChange={e => setFormData({ ...formData, beneficiaryBank: e.target.value })}
            onBlur={e => setFormData({ ...formData, beneficiaryBank: normalizeBankName(e.target.value) })}
          />
        </FieldRow>

        <FieldRow>
          <FieldLabel width="100px">Beneficiary Name</FieldLabel>
          <FieldInput value={formData.beneficiaryName || ''} onChange={e => setFormData({ ...formData, beneficiaryName: e.target.value })} />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Contract Details (As Applicable)</SectionHeader>
      <SectionContent>
        <TwoColumnRow>
          <Column>
            <FieldLabel width="80px">Dealer's Name</FieldLabel>
            <FieldInput value={formData.dealerName || ''} onChange={e => setFormData({ ...formData, dealerName: e.target.value })} />
          </Column>
          <Column>
            <FieldLabel width="60px">FX rates</FieldLabel>
            <FieldInput value={formData.fxRates || ''} onChange={e => setFormData({ ...formData, fxRates: e.target.value })} />
          </Column>
        </TwoColumnRow>
      </SectionContent>

      <SectionHeader>Customer's Signiture</SectionHeader>
      <SectionContent>
        <div style={{fontSize: '10px', marginBottom: '10px'}}>
          We authorize the bank to debit the above monies for lawful purpose detailed above and agree to abide by the Terms and Conditions printed overleaf
        </div>
        <SignatureSection>
          <SignatureLabel>Customer's Signature</SignatureLabel>
        </SignatureSection>
      </SectionContent>

      <ActionBar>
        <ActionButton onClick={handlePreviewPdf} disabled={previewGenerating}>Preview PDF</ActionButton>
        <ActionButton onClick={handleEdit}>Edit</ActionButton>
        <ActionButton onClick={() => navigate('/risk-analysis', { state: { remittanceData: formData } })}>View Risk Report Analysis</ActionButton>
        <ActionButton primary onClick={handleConfirmDownload}>Confirm & Download</ActionButton>
      </ActionBar>

      {previewUrl && (
        <div style={{ margin: '0 16px 16px', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ background: '#f9fafb', padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 12 }}>
            PDF Preview ({bankLabelFromStyle(bankStyle)})
          </div>
          <iframe src={previewUrl} title="Remittance Preview" style={{ width: '100%', height: 480, border: 'none' }} />
        </div>
      )}
    </FormContainer>
  );
};

export default RemittanceFormPage;