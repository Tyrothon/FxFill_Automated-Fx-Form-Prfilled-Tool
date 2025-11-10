import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { renderHsbcRemittanceForm } from '../utils/pdfRenderers';
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
  background-color: #b91c1c;
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
  min-width: 140px;
`;

const FieldInput = styled.input`
  border: none;
  border-bottom: 1px solid #000;
  flex-grow: 1;
  font-size: 10px;
  padding: 2px 0;
  background: transparent;
`;

const FieldSelect = styled.select`
  border: none;
  border-bottom: 1px solid #000;
  flex-grow: 1;
  font-size: 10px;
  padding: 2px 0;
  background: transparent;
`;

const FieldTextarea = styled.textarea`
  border: 1px solid #000;
  width: 100%;
  min-height: 48px;
  font-size: 10px;
  padding: 6px;
  background: transparent;
  resize: vertical;
`;

const SmallNote = styled.div`
  font-size: 9px;
  color: #374151;
  margin-top: 4px;
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


const RemittanceFormHSBC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.extractedInfo || location.state?.remittanceData || {};
  const normalizedInitial = { ...initialData, bank: 'HSBC' };

  const [formData, setFormData] = useState(normalizedInitial);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewGenerating, setPreviewGenerating] = useState(false);

  const normalizeCurrency = (v) => (v || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);

  const validateRequired = () => {
    const e = {};
    if (!formData.debitAcCurrency || formData.debitAcCurrency.length !== 3) e.debitAcCurrency = '需要3位货币代码';
    if (!formData.debitAc || String(formData.debitAc).trim() === '') e.debitAc = '需要账户号码';
    if (!formData.chargesDebitAcCurrency || formData.chargesDebitAcCurrency.length !== 3) e.chargesDebitAcCurrency = '需要3位货币代码';
    if (!formData.chargesDebitAc || String(formData.chargesDebitAc).trim() === '') e.chargesDebitAc = '需要账户号码';
    if (!formData.amount || String(formData.amount).trim() === '') e.amount = '需要汇款金额';
    if (!formData.beneficiaryName) e.beneficiaryName = '需要收款人名称';
    if (!formData.beneficiaryAccount) e.beneficiaryAccount = '需要收款人账号/IBAN';
    if (!formData.beneficiaryBank) e.beneficiaryBank = '需要收款银行';
    if (!formData.chargeType) e.chargeType = '需要选择费用承担方式';
    setErrors(e);
    return e;
  };

  const handlePreviewPdf = () => {
    setPreviewGenerating(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const page = { width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight() };
      const margin = { left: 30, right: 30, top: 30, bottom: 30 };
      const data = { ...formData };
      renderHsbcRemittanceForm(doc, page, margin, data);
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
    navigate('/download', { state: { remittanceData: { ...formData, layoutBank: 'hsbc' }, fileType: 'remittance', from: '/remittance-form-HSBC' } });
  };

  return (
    <FormContainer>
      <Header>
        <Title>HSBC TT APPLICATION FORM</Title>
        <BankLogo>HSBC</BankLogo>
      </Header>

      <SectionHeader>Header / Meta</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Application Ref No.</FieldLabel>
          <FieldInput value={formData.applicationRefNo || ''} onChange={e => setFormData({ ...formData, applicationRefNo: e.target.value })} placeholder="例如：TT-2025-0001" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Language</FieldLabel>
          <FieldSelect value={formData.language || ''} onChange={e => setFormData({ ...formData, language: e.target.value })}>
            <option value="">请选择</option>
            <option value="English">English</option>
            <option value="中文">中文</option>
          </FieldSelect>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Country / Territory</FieldLabel>
          <FieldInput value={formData.countryTerritory || ''} onChange={e => setFormData({ ...formData, countryTerritory: e.target.value })} placeholder="Hong Kong SAR" />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Account Holder Information</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Debit A/C Currency</FieldLabel>
          <FieldInput value={formData.debitAcCurrency || ''} onChange={e => setFormData({ ...formData, debitAcCurrency: normalizeCurrency(e.target.value) })} maxLength={3} placeholder="USD" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Debit Account Number</FieldLabel>
          <FieldInput value={formData.debitAc || ''} onChange={e => setFormData({ ...formData, debitAc: e.target.value })} placeholder="Account number" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Account Type</FieldLabel>
          <FieldInput value={formData.debitAcType || ''} onChange={e => setFormData({ ...formData, debitAcType: e.target.value })} placeholder="如：HKD Current / HKD Savings" />
        </FieldRow>
        <SmallNote>对于综合账户/商业综合账户，请填写具体账户类型（如：HKD Current / HKD Savings）。</SmallNote>
      </SectionContent>

      <SectionHeader>Payment Details</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Amount in Remittance Currency</FieldLabel>
          <FieldInput value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Amount in Debit Account Currency</FieldLabel>
          <FieldInput value={formData.amountDebitCurrency || ''} onChange={e => setFormData({ ...formData, amountDebitCurrency: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Remittance Currency</FieldLabel>
          <FieldInput value={formData.remitCurrency || ''} onChange={e => setFormData({ ...formData, remitCurrency: normalizeCurrency(e.target.value) })} maxLength={3} placeholder="USD" />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Beneficiary Bank Details</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Bank Name</FieldLabel>
          <FieldInput value={formData.beneficiaryBank || ''} onChange={e => setFormData({ ...formData, beneficiaryBank: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>SWIFT / BIC</FieldLabel>
          <FieldInput value={formData.beneficiarySwift || ''} onChange={e => setFormData({ ...formData, beneficiarySwift: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Bank Code Type</FieldLabel>
          <FieldSelect value={formData.bankCodeType || ''} onChange={e => setFormData({ ...formData, bankCodeType: e.target.value })}>
            <option value="">请选择</option>
            <option value="CHIPS">CHIPS</option>
            <option value="Fedwire">Fedwire</option>
            <option value="SortCode">Sort Code</option>
            <option value="CNAPS">CNAPS</option>
          </FieldSelect>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Bank Code</FieldLabel>
          <FieldInput value={formData.bankCode || ''} onChange={e => setFormData({ ...formData, bankCode: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Country / Territory</FieldLabel>
          <FieldInput value={formData.beneficiaryBankCountry || ''} onChange={e => setFormData({ ...formData, beneficiaryBankCountry: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>City</FieldLabel>
          <FieldInput value={formData.beneficiaryBankCity || ''} onChange={e => setFormData({ ...formData, beneficiaryBankCity: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Province / State</FieldLabel>
          <FieldInput value={formData.beneficiaryBankProvince || ''} onChange={e => setFormData({ ...formData, beneficiaryBankProvince: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Branch</FieldLabel>
          <FieldInput value={formData.beneficiaryBankBranch || ''} onChange={e => setFormData({ ...formData, beneficiaryBankBranch: e.target.value })} />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Beneficiary Details</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Name</FieldLabel>
          <FieldInput value={formData.beneficiaryName || ''} onChange={e => setFormData({ ...formData, beneficiaryName: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Account Number / IBAN</FieldLabel>
          <FieldInput value={formData.beneficiaryAccount || ''} onChange={e => setFormData({ ...formData, beneficiaryAccount: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Currency / Account Type</FieldLabel>
          <FieldInput value={formData.beneficiaryCurrency || ''} onChange={e => setFormData({ ...formData, beneficiaryCurrency: normalizeCurrency(e.target.value) })} maxLength={3} placeholder="USD" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Address Line 1</FieldLabel>
          <FieldInput value={formData.beneficiaryAddress1 || ''} onChange={e => setFormData({ ...formData, beneficiaryAddress1: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Address Line 2</FieldLabel>
          <FieldInput value={formData.beneficiaryAddress2 || ''} onChange={e => setFormData({ ...formData, beneficiaryAddress2: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Address Line 3</FieldLabel>
          <FieldInput value={formData.beneficiaryAddress3 || ''} onChange={e => setFormData({ ...formData, beneficiaryAddress3: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Address Line 4</FieldLabel>
          <FieldInput value={formData.beneficiaryAddress4 || ''} onChange={e => setFormData({ ...formData, beneficiaryAddress4: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Country / Territory</FieldLabel>
          <FieldInput value={formData.beneficiaryCountry || ''} onChange={e => setFormData({ ...formData, beneficiaryCountry: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>City</FieldLabel>
          <FieldInput value={formData.beneficiaryCity || ''} onChange={e => setFormData({ ...formData, beneficiaryCity: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Province / State</FieldLabel>
          <FieldInput value={formData.beneficiaryProvince || ''} onChange={e => setFormData({ ...formData, beneficiaryProvince: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Postcode</FieldLabel>
          <FieldInput value={formData.beneficiaryPostcode || ''} onChange={e => setFormData({ ...formData, beneficiaryPostcode: e.target.value })} />
        </FieldRow>
        <SmallNote>对于向阿联酋、约旦、巴基斯坦、卡塔尔、阿曼的付款，以及欧盟/欧洲经济区（以欧元结算），必须提供 IBAN。</SmallNote>
      </SectionContent>

      <SectionHeader>Fund Transfer Charges</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Charge A/C Currency</FieldLabel>
          <FieldInput value={formData.chargesDebitAcCurrency || ''} onChange={e => setFormData({ ...formData, chargesDebitAcCurrency: normalizeCurrency(e.target.value) })} maxLength={3} placeholder="USD" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Charge Account Number</FieldLabel>
          <FieldInput value={formData.chargesDebitAc || ''} onChange={e => setFormData({ ...formData, chargesDebitAc: e.target.value })} placeholder="Account number" />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Charge Type</FieldLabel>
          <FieldSelect value={formData.chargeType || ''} onChange={e => setFormData({ ...formData, chargeType: e.target.value })}>
            <option value="">请选择</option>
            <option value="OUR">OUR - 汇款人承担所有银行费用</option>
            <option value="BEN">BEN - 收款人承担所有银行费用</option>
            <option value="SHA">SHA - 汇款人与收款人各自承担本行/他行费用</option>
          </FieldSelect>
        </FieldRow>
        <SmallNote>费用处理选项与截图一致，OUR/BEN/SHA 三种方式可选。</SmallNote>
      </SectionContent>

      <SectionHeader>Ordering Party Details</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Full Name</FieldLabel>
          <FieldInput value={formData.senderName || ''} onChange={e => setFormData({ ...formData, senderName: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Address</FieldLabel>
          <FieldInput value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Contact Telephone Number</FieldLabel>
          <FieldInput value={formData.contactNumber || ''} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Purpose of Payment</FieldLabel>
          <FieldTextarea value={formData.purposeOfPayment || ''} onChange={e => setFormData({ ...formData, purposeOfPayment: e.target.value })} placeholder="跨境人民币用途等，简要说明用途。" />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Intermediary Bank (If Any)</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Bank Name</FieldLabel>
          <FieldInput value={formData.intermediaryBankName || ''} onChange={e => setFormData({ ...formData, intermediaryBankName: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>SWIFT / BIC</FieldLabel>
          <FieldInput value={formData.intermediarySwift || ''} onChange={e => setFormData({ ...formData, intermediarySwift: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Account With Intermediary Bank</FieldLabel>
          <FieldInput value={formData.intermediaryAccount || ''} onChange={e => setFormData({ ...formData, intermediaryAccount: e.target.value })} />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Foreign Exchange Details</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Exchange Rate</FieldLabel>
          <FieldInput value={formData.fxRate || ''} onChange={e => setFormData({ ...formData, fxRate: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Rate Given By / Contract No.</FieldLabel>
          <FieldInput value={formData.fxContractNo || ''} onChange={e => setFormData({ ...formData, fxContractNo: e.target.value })} />
        </FieldRow>
      </SectionContent>

      <SectionHeader>Additional Instruction</SectionHeader>
      <SectionContent>
        <FieldRow>
          <FieldLabel>Routing Number / Reference</FieldLabel>
          <FieldInput value={formData.routingReference || ''} onChange={e => setFormData({ ...formData, routingReference: e.target.value })} />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Local / Overseas Charges</FieldLabel>
          <FieldInput value={formData.localOverseasCharges || ''} onChange={e => setFormData({ ...formData, localOverseasCharges: e.target.value })} />
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
            PDF Preview (HSBC)
          </div>
          <iframe src={previewUrl} title="Remittance Preview" style={{ width: '100%', height: 480, border: 'none' }} />
        </div>
      )}
    </FormContainer>
  );
};

export default RemittanceFormHSBC;