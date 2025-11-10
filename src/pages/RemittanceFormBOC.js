import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { renderBocRemittanceForm } from '../utils/pdfRenderers';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { buildComplianceChecklist } from '../utils/validators';

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
  min-width: 170px;
`;

const FieldInput = styled.input`
  border: none;
  border-bottom: 1px solid ${props => props['data-error'] ? '#ef4444' : '#000'};
  flex-grow: 1;
  font-size: 10px;
  padding: 2px 0;
  background: ${props => props['data-error'] ? 'rgba(239,68,68,0.06)' : 'transparent'};
`;

// Extra input types to better match BOC form
const FieldSelect = styled.select`
  border: none;
  border-bottom: 1px solid ${props => props['data-error'] ? '#ef4444' : '#000'};
  flex-grow: 1;
  font-size: 10px;
  padding: 2px 0;
  background: ${props => props['data-error'] ? 'rgba(239,68,68,0.06)' : 'transparent'};
`;

const FieldTextarea = styled.textarea`
  border: 1px solid ${props => props['data-error'] ? '#ef4444' : '#000'};
  width: 100%;
  min-height: 70px;
  font-size: 10px;
  padding: 6px;
  background: ${props => props['data-error'] ? 'rgba(239,68,68,0.06)' : 'transparent'};
  resize: vertical;
`;

const SmallNote = styled.div`
  color: #6b7280;
  font-size: 10px;
  margin: 4px 0 8px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  margin: 16px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #d1d5db;
  background: white;
  &:hover { background: #f9fafb; }
  ${props => props.primary ? `
    background: #111827; color: white; border: 1px solid #111827;
    &:hover { background: #1f2937; }
  ` : ''}
`;

// BOC PDF renderer (preview-only) — cover fields close to screenshot
const renderBocRemittanceFormLocal = (doc, page, margin, data) => {
  const left = margin.left;
  const right = page.width - margin.right;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('匯款申請書  APPLICATION FOR REMITTANCE', left + 15, margin.top + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('BANK OF CHINA (HONG KONG) LIMITED', right - 240, margin.top + 18);

  // Remittance currency & amounts
  let y = margin.top + 40;
  doc.setFont('helvetica', 'bold');
  doc.text('匯款貨幣', left + 15, y);
  doc.setFont('helvetica', 'normal');
  doc.line(left + 75, y + 2, right - 300, y + 2);
  if (data?.remittanceCurrency) doc.text(String(data.remittanceCurrency), left + 80, y - 1);
  doc.text('名稱', right - 290, y);
  doc.line(right - 260, y + 2, right - 140, y + 2);
  if (data?.currencyName) doc.text(String(data.currencyName), right - 255, y - 1);

  y += 18;
  doc.text('匯款貨幣金額', left + 15, y);
  doc.line(left + 95, y + 2, right - 240, y + 2);
  if (data?.amount) doc.text(String(data.amount), left + 100, y - 1);
  doc.text('扣賬貨幣金額', right - 230, y);
  doc.line(right - 150, y + 2, right - 15, y + 2);
  if (data?.debitAmount) doc.text(String(data.debitAmount), right - 145, y - 1);

  // Applicant / Accounts
  y += 26;
  doc.setFont('helvetica', 'bold');
  doc.text('匯款人 / 申請人', left + 15, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.text('名稱*', left + 15, y);
  doc.line(left + 60, y + 2, right - 15, y + 2);
  if (data?.senderName) doc.text(String(data.senderName), left + 65, y - 1);

  y += 18;
  doc.text('聯絡電話', left + 15, y);
  doc.line(left + 60, y + 2, right - 300, y + 2);
  if (data?.contactNumber) doc.text(String(data.contactNumber), left + 65, y - 1);
  doc.text('外匯合約號碼', right - 290, y);
  doc.line(right - 215, y + 2, right - 15, y + 2);
  if (data?.fxContractNo) doc.text(String(data.fxContractNo), right - 210, y - 1);

  y += 18;
  doc.text('匯率', left + 15, y);
  doc.line(left + 35, y + 2, left + 140, y + 2);
  if (data?.exchangeRate) doc.text(String(data.exchangeRate), left + 40, y - 1);
  doc.text('扣賬貨幣及賬戶號碼/中銀信用卡*', left + 160, y);
  doc.line(left + 365, y + 2, right - 15, y + 2);
  const debitStr = [data?.debitAcCurrency, data?.debitAc].filter(Boolean).join(' / ');
  if (debitStr) doc.text(String(debitStr), left + 370, y - 1);

  y += 18;
  doc.text('支付費用賬戶及賬戶號碼(如與上述不同)', left + 15, y);
  doc.line(left + 215, y + 2, right - 15, y + 2);
  const chargesStr = [data?.chargesDebitAcCurrency, data?.chargesDebitAc].filter(Boolean).join(' / ');
  if (chargesStr) doc.text(String(chargesStr), left + 220, y - 1);

  // Intermediary Bank
  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.text('中轉銀行', left + 15, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.text('名稱及地址', left + 15, y);
  doc.line(left + 75, y + 2, right - 15, y + 2);
  if (data?.intermediaryBank) doc.text(String(data.intermediaryBank), left + 80, y - 1);
  y += 18;
  doc.text('SWIFT Code', left + 15, y);
  doc.line(left + 80, y + 2, left + 220, y + 2);
  if (data?.swiftCode) doc.text(String(data.swiftCode), left + 85, y - 1);
  doc.text('只適用於特快轉賬  中央結算系統代號', left + 245, y);
  doc.line(left + 470, y + 2, left + 540, y + 2);
  if (data?.ccassCode) doc.text(String(data.ccassCode), left + 475, y - 1);
  doc.text('參與者代碼', left + 560, y);
  doc.line(left + 640, y + 2, right - 15, y + 2);
  if (data?.participantCode) doc.text(String(data.participantCode), left + 645, y - 1);

  // Beneficiary Bank
  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.text('收款銀行*', left + 15, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.text('名稱及地址', left + 15, y);
  doc.line(left + 75, y + 2, right - 15, y + 2);
  const bn = [data?.beneficiaryBank, data?.beneficiaryBankAddress].filter(Boolean).join('  ');
  if (bn) doc.text(String(bn), left + 80, y - 1);

  y += 18;
  doc.text('國家/地區', left + 15, y);
  doc.line(left + 75, y + 2, left + 180, y + 2);
  if (data?.beneficiaryCountry) doc.text(String(data.beneficiaryCountry), left + 80, y - 1);
  doc.text('省', left + 190, y);
  doc.line(left + 210, y + 2, left + 280, y + 2);
  if (data?.beneficiaryProvince) doc.text(String(data.beneficiaryProvince), left + 215, y - 1);
  doc.text('城市', left + 290, y);
  doc.line(left + 320, y + 2, left + 420, y + 2);
  if (data?.beneficiaryCity) doc.text(String(data.beneficiaryCity), left + 325, y - 1);
  doc.text('銀行代碼', left + 430, y);
  doc.line(left + 480, y + 2, right - 15, y + 2);
  if (data?.bankCode) doc.text(String(data.bankCode), left + 485, y - 1);

  // Beneficiary
  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.text('收款人*', left + 15, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.text('賬戶號碼/IBAN*', left + 15, y);
  doc.line(left + 110, y + 2, right - 15, y + 2);
  const acct = data?.beneficiaryAccount || data?.iban;
  if (acct) doc.text(String(acct), left + 115, y - 1);

  y += 18;
  doc.text('姓名*', left + 15, y);
  doc.line(left + 55, y + 2, right - 15, y + 2);
  if (data?.beneficiaryName) doc.text(String(data.beneficiaryName), left + 60, y - 1);

  y += 18;
  doc.text('地址/聯絡電話', left + 15, y);
  doc.line(left + 90, y + 2, right - 15, y + 2);
  const addr = [data?.beneficiaryAddress, data?.beneficiaryPhone].filter(Boolean).join(' / ');
  if (addr) doc.text(String(addr), left + 95, y - 1);

  // Message
  y += 24;
  doc.text('附言', left + 15, y);
  doc.line(left + 45, y + 2, right - 15, y + 2);
  if (data?.message) doc.text(String(data.message), left + 50, y - 1);

  // Charges and purpose
  y += 18;
  doc.text('銀行收費*', left + 15, y);
  doc.line(left + 70, y + 2, left + 180, y + 2);
  if (data?.bankCharges) doc.text(String(data.bankCharges), left + 75, y - 1);
  doc.text('匯款用途*', left + 200, y);
  doc.line(left + 265, y + 2, right - 130, y + 2);
  if (data?.purpose) doc.text(String(data.purpose), left + 270, y - 1);
  doc.line(right - 120, y + 2, right - 15, y + 2);
  if (data?.purposeDetail) doc.text(String(data.purposeDetail), right - 115, y - 1);

  // Bank use / approval
  y += 26;
  doc.setFont('helvetica', 'bold');
  doc.text('銀行專用', right - 120, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.text('即日  翌日  上午  下午  其他:', right - 220, y);
  if (data?.bankUseNote) doc.text(String(data.bankUseNote), right - 140, y);

  y += 26;
  doc.text('Approval', left + 15, y);
  doc.line(left + 70, y + 2, left + 260, y + 2);
  if (data?.approval) doc.text(String(data.approval), left + 75, y - 1);
  doc.text('Checker', left + 280, y);
  doc.line(left + 330, y + 2, right - 15, y + 2);
  if (data?.checker) doc.text(String(data.checker), left + 335, y - 1);

  y += 18;
  doc.text('Remarks', left + 15, y);
  doc.line(left + 70, y + 2, right - 15, y + 2);
  if (data?.remarks) doc.text(String(data.remarks), left + 75, y - 1);

  y += 40;
  doc.text('匯款人簽署*', left + 15, y);
  doc.line(left + 90, y + 2, right - 150, y + 2);
  if (data?.signature) doc.text(String(data.signature), left + 95, y - 1);
  doc.text('日期', right - 135, y);
  doc.line(right - 105, y + 2, right - 15, y + 2);
  if (data?.date) doc.text(String(data.date), right - 100, y - 1);
};

const RemittanceFormBOC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.extractedInfo || location.state?.remittanceData || {};
  const normalizedInitial = { ...initialData, bank: 'Bank of China' };

  const [formData, setFormData] = useState(normalizedInitial);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewGenerating, setPreviewGenerating] = useState(false);

  const normalizeCurrency = (v) => (v || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);

  const validateRequired = () => {
    const e = {};
    if (!formData.remittanceCurrency || formData.remittanceCurrency.length !== 3) e.remittanceCurrency = '需要3位货币代码';
    if (!formData.amount) e.amount = '需要汇款金额';
    if (!formData.debitAcCurrency || formData.debitAcCurrency.length !== 3) e.debitAcCurrency = '需要3位货币代码';
    if (!formData.debitAc || String(formData.debitAc).trim() === '') e.debitAc = '需要账户号码';
    if (!formData.beneficiaryBank) e.beneficiaryBank = '需要收款银行名称';
    if (!formData.beneficiaryAccount && !formData.iban) e.beneficiaryAccount = '需要收款人账户或IBAN';
    if (!formData.beneficiaryName) e.beneficiaryName = '需要收款人姓名';
    if (!formData.bankCharges) e.bankCharges = '请选择银行收费';
    if (!formData.purpose) e.purpose = '请选择用途';
    setErrors(e);
    return e;
  };

  const handlePreviewPdf = async () => {
    setPreviewGenerating(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const page = { width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight() };
      const margin = { left: 30, right: 30, top: 30, bottom: 30 };
      const data = { ...formData };
      renderBocRemittanceForm(doc, page, margin, data);
      const url = doc.output('bloburl');
      setPreviewUrl(url);
    } catch (e) {
      console.error('PDF preview error:', e);
      alert('无法生成预览，请稍后重试。');
    } finally {
      setPreviewGenerating(false);
    }
  };

  const handleConfirmDownload = () => {
    const err = validateRequired();
    const checklist = buildComplianceChecklist(formData);
    const highlight = { ...err };
    checklist.forEach(it => { if (it.severity === 'error') highlight[it.key] = true; });
    setErrors(highlight);
    if (Object.keys(err).length > 0 || checklist.filter(i => i.severity === 'error').length > 0) {
      const labelMap = {
        remittanceCurrency: '汇款货币',
        amount: '汇款金额',
        debitAcCurrency: '扣账货币',
        debitAc: '扣账账户',
        beneficiaryBank: '收款银行',
        beneficiaryAccount: '收款人账户/IBAN',
        beneficiaryName: '收款人姓名',
        bankCharges: '银行收费',
        purpose: '用途',
        senderName: '汇款人/申请人姓名'
      };
      const missingList = Object.keys(err).map(k => labelMap[k] || k);
      const criticalIssues = checklist.filter(i => i.severity === 'error').map(i => i.message);
      const summary = [
        missingList.length ? `请填写以下必填项：${missingList.join('、')}` : null,
        criticalIssues.length ? `合规问题：${criticalIssues.join('；')}` : null
      ].filter(Boolean).join('\n');
      alert(summary || '请检查表单中高亮的字段。');
      return;
    }
    navigate('/download', { state: { remittanceData: { ...formData, layoutBank: 'boc' }, fileType: 'remittance', from: '/remittance-form-BOC' } });
  };

  return (
    <FormContainer>
      <Header>
        <Title>APPLICATION FOR REMITTANCE</Title>
        <BankLogo>Bank of China</BankLogo>
      </Header>

      <SectionHeader>Remittance Details</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Remittance Currency</FieldLabel>
          <FieldInput data-error={errors.remittanceCurrency} style={{maxWidth: 90}} value={formData.remittanceCurrency || ''} onChange={e => setFormData({ ...formData, remittanceCurrency: normalizeCurrency(e.target.value) })} maxLength={3} placeholder="USD" />
          <FieldLabel style={{minWidth: 60, marginLeft: 12}}>Name</FieldLabel>
          <FieldInput value={formData.currencyName || ''} onChange={e => setFormData({ ...formData, currencyName: e.target.value })} placeholder="例如：美元" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Amount (Remittance Currency)</FieldLabel>
          <FieldInput data-error={errors.amount} value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="e.g. 1000.00" />
          <FieldLabel style={{minWidth: 120, marginLeft: 12}}>Debit Amount</FieldLabel>
          <FieldInput value={formData.debitAmount || ''} onChange={e => setFormData({ ...formData, debitAmount: e.target.value })} placeholder="可与汇款金额不同" />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Applicant / Accounts</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Sender Name</FieldLabel>
          <FieldInput value={formData.senderName || ''} onChange={e => setFormData({ ...formData, senderName: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Contact No.</FieldLabel>
          <FieldInput value={formData.contactNumber || ''} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
          <FieldLabel style={{minWidth: 120, marginLeft: 12}}>FX Contract No.</FieldLabel>
          <FieldInput value={formData.fxContractNo || ''} onChange={e => setFormData({ ...formData, fxContractNo: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Debit A/C Currency & No.</FieldLabel>
          <FieldInput data-error={errors.debitAcCurrency} style={{maxWidth: 90, marginRight: 15}} value={formData.debitAcCurrency || ''} onChange={e => setFormData({ ...formData, debitAcCurrency: normalizeCurrency(e.target.value) })} maxLength={3} placeholder="USD" />
          <FieldInput data-error={errors.debitAc} value={formData.debitAc || ''} onChange={e => setFormData({ ...formData, debitAc: e.target.value })} placeholder="Account number" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Charges A/C Currency & No. (if different)</FieldLabel>
          <FieldInput data-error={errors.chargesDebitAcCurrency} style={{maxWidth: 90, marginRight: 15}} value={formData.chargesDebitAcCurrency || ''} onChange={e => setFormData({ ...formData, chargesDebitAcCurrency: normalizeCurrency(e.target.value) })} maxLength={3} placeholder="USD" />
          <FieldInput data-error={errors.chargesDebitAc} value={formData.chargesDebitAc || ''} onChange={e => setFormData({ ...formData, chargesDebitAc: e.target.value })} placeholder="Account number" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Exchange Rate</FieldLabel>
          <FieldInput style={{maxWidth: 120}} value={formData.exchangeRate || ''} onChange={e => setFormData({ ...formData, exchangeRate: e.target.value })} placeholder="例如：7.80" />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Intermediary Bank</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Name & Address</FieldLabel>
          <FieldInput data-error={errors.intermediaryBank} value={formData.intermediaryBank || ''} onChange={e => setFormData({ ...formData, intermediaryBank: e.target.value })} placeholder="Bank name and address" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>SWIFT Code</FieldLabel>
          <FieldInput style={{maxWidth: 200}} value={formData.swiftCode || ''} onChange={e => setFormData({ ...formData, swiftCode: e.target.value })} />
          <FieldLabel style={{minWidth: 160, marginLeft: 12}}>For TT only: CCASS Code</FieldLabel>
          <FieldInput style={{maxWidth: 120}} value={formData.ccassCode || ''} onChange={e => setFormData({ ...formData, ccassCode: e.target.value })} />
          <FieldLabel style={{minWidth: 110, marginLeft: 12}}>Participant Code</FieldLabel>
          <FieldInput style={{maxWidth: 120}} value={formData.participantCode || ''} onChange={e => setFormData({ ...formData, participantCode: e.target.value })} />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Beneficiary Bank</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Name & Address</FieldLabel>
          <FieldInput data-error={errors.beneficiaryBank} value={formData.beneficiaryBank || ''} onChange={e => setFormData({ ...formData, beneficiaryBank: e.target.value })} placeholder="Bank name and address" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Country/Region</FieldLabel>
          <FieldInput style={{maxWidth: 150}} value={formData.beneficiaryCountry || ''} onChange={e => setFormData({ ...formData, beneficiaryCountry: e.target.value })} />
          <FieldLabel style={{minWidth: 60, marginLeft: 12}}>Province</FieldLabel>
          <FieldInput style={{maxWidth: 140}} value={formData.beneficiaryProvince || ''} onChange={e => setFormData({ ...formData, beneficiaryProvince: e.target.value })} />
          <FieldLabel style={{minWidth: 40, marginLeft: 12}}>City</FieldLabel>
          <FieldInput style={{maxWidth: 140}} value={formData.beneficiaryCity || ''} onChange={e => setFormData({ ...formData, beneficiaryCity: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Bank Code</FieldLabel>
          <FieldInput style={{maxWidth: 200}} value={formData.bankCode || ''} onChange={e => setFormData({ ...formData, bankCode: e.target.value })} />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Beneficiary Details</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Account No. / IBAN*</FieldLabel>
          <FieldInput data-error={errors.beneficiaryAccount} value={formData.beneficiaryAccount || ''} onChange={e => setFormData({ ...formData, beneficiaryAccount: e.target.value })} placeholder="Account number or IBAN" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Name*</FieldLabel>
          <FieldInput data-error={errors.beneficiaryName} value={formData.beneficiaryName || ''} onChange={e => setFormData({ ...formData, beneficiaryName: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Address / Contact Tel.</FieldLabel>
          <FieldInput value={formData.beneficiaryAddress || ''} onChange={e => setFormData({ ...formData, beneficiaryAddress: e.target.value })} placeholder="Address and contact number" />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Message & Charges / Purpose</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Message</FieldLabel>
          <FieldTextarea data-error={errors.message} value={formData.message || ''} onChange={e => setFormData({ ...formData, message: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Bank Charges*</FieldLabel>
          <FieldSelect data-error={errors.bankCharges} value={formData.bankCharges || ''} onChange={e => setFormData({ ...formData, bankCharges: e.target.value })}>
            <option value="">请选择</option>
            <option value="OUR">OUR（汇款人承担）</option>
            <option value="SHA">SHA（双方分担）</option>
            <option value="BEN">BEN（收款人承担）</option>
          </FieldSelect>
          <FieldLabel style={{minWidth: 110, marginLeft: 12}}>Purpose*</FieldLabel>
          <FieldSelect data-error={errors.purpose} value={formData.purpose || ''} onChange={e => setFormData({ ...formData, purpose: e.target.value })}>
            <option value="">请选择用途</option>
            <option value="Personal Consumption">Personal Consumption（个人消费）</option>
            <option value="Business Payment">Business Payment（贸易/服务）</option>
            <option value="Savings Transfer">Savings Transfer（存款转移）</option>
            <option value="Tuition">Tuition（学费）</option>
            <option value="Loan Repayment">Loan Repayment（贷款还款）</option>
            <option value="Others">Others（其他）</option>
          </FieldSelect>
          <FieldLabel style={{minWidth: 110, marginLeft: 12}}>Detail</FieldLabel>
          <FieldInput value={formData.purposeDetail || ''} onChange={e => setFormData({ ...formData, purposeDetail: e.target.value })} />
        </FieldRow>
        <SmallNote>“Purpose/Detail”用于对齐截图中的两层下拉与附加描述。</SmallNote>
      </SectionContent>

      <SectionHeader>Bank Use / Approval</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Bank Use Note</FieldLabel>
          <FieldInput value={formData.bankUseNote || ''} onChange={e => setFormData({ ...formData, bankUseNote: e.target.value })} placeholder="即日/翌日/上午/下午/其他" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Approval</FieldLabel>
          <FieldInput value={formData.approval || ''} onChange={e => setFormData({ ...formData, approval: e.target.value })} />
          <FieldLabel style={{minWidth: 80, marginLeft: 12}}>Checker</FieldLabel>
          <FieldInput value={formData.checker || ''} onChange={e => setFormData({ ...formData, checker: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Remarks</FieldLabel>
          <FieldInput value={formData.remarks || ''} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Remitter Signature*</FieldLabel>
          <FieldInput value={formData.signature || ''} onChange={e => setFormData({ ...formData, signature: e.target.value })} />
          <FieldLabel style={{minWidth: 60, marginLeft: 12}}>Date</FieldLabel>
          <FieldInput style={{maxWidth: 160}} value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} placeholder="DD-MM-YYYY" />
        </FieldRow>
      </SectionContent>

      <ActionBar>
        <ActionButton onClick={handlePreviewPdf} disabled={previewGenerating}>Preview PDF</ActionButton>
        <ActionButton onClick={() => navigate('/risk-analysis', { state: { remittanceData: formData } })}>View Risk Report Analysis</ActionButton>
        <ActionButton primary onClick={handleConfirmDownload}>Confirm & Download</ActionButton>
      </ActionBar>

      {previewUrl && (
        <div style={{ margin: '0 16px 16px', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ background: '#f9fafb', padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 12 }}>
            PDF Preview (Bank of China)
          </div>
          <iframe src={previewUrl} title="Remittance Preview" style={{ width: '100%', height: 480, border: 'none' }} />
        </div>
      )}
    </FormContainer>
  );
};

export default RemittanceFormBOC;