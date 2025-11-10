import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Download, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { jsPDF } from 'jspdf';
import { renderHsbcRemittanceForm, renderBocRemittanceForm } from '../utils/pdfRenderers';
import StatusTime from '../components/StatusTime';

const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
`;

const Header = styled.div`
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  text-align: center;
  margin-right: 40px;
`;

const StatusBar = styled.div`
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
`;

const Content = styled.div`
  padding: 24px 16px;
`;

const SuccessSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 32px 16px;
  text-align: center;
  margin-bottom: 24px;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
`;

const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
`;

const SuccessSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
`;

const FileInfo = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const FileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const FileIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #6366f1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const FileSize = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const FileDescription = styled.div`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
`;

const DownloadOptions = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const OptionsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  
  &:hover {
    border-color: #6366f1;
    background: #f8fafc;
  }
`;

const OptionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #6366f1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const OptionContent = styled.div`
  flex: 1;
`;

const OptionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

const OptionDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

// Preview styles
const PreviewContainer = styled.div`
  margin-top: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: #111827;
`;

const PreviewFrame = styled.iframe`
  width: 100%;
  height: 480px;
  border: none;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  ${props => props.primary ? `
    background: #6366f1;
    color: white;
    border: none;
    
    &:hover {
      background: #5856eb;
    }
  ` : `
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
    
    &:hover {
      border-color: #6366f1;
      color: #6366f1;
    }
  `}
`;

// Helper: load Chinese font from public/fonts, fallback to helvetica
async function loadChineseFont(doc) {
  const fontPath = '/fonts/NotoSansSC-Regular.ttf';
  try {
    const res = await fetch(fontPath);
    if (!res.ok) throw new Error('Font not found');
    const buffer = await res.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    doc.addFileToVFS('NotoSansSC-Regular.ttf', base64);
    doc.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
    doc.setFont('NotoSansSC', 'normal');
    return true;
  } catch (err) {
    console.warn('中文字体加载失败，回退 helvetica', err);
    doc.setFont('helvetica', 'normal');
    return false;
  }
}

// Bank-specific layout detection (prioritize remitting bank / explicit layout)
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


// 封装入口（remittance → bank-specific renderer）
const renderRemittancePdf = async (doc, page, margin, data) => {
  const layout = detectRemittanceLayout(data);
  if (layout === 'hsbc') {
    renderHsbcRemittanceForm(doc, page, margin, data);
    return true;
  }
  if (layout === 'boc') {
    // Use the shared BOC renderer from utils to match the form preview
    renderBocRemittanceForm(doc, page, margin, data);
    return true;
  }
  return false;
};

const DownloadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const remittanceData = location.state?.remittanceData || null;
  const fileType = location.state?.fileType || null;
  const backRoute = location.state?.from || '/fx-form';

  const downloadOptions = [
    {
      icon: Download,
      title: 'Download to Device',
      description: 'Save the PDF file to your device'
    }
  ];

  const handlePreview = async () => {
    setDownloadStarted(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const page = { width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight() };
      const margin = { left: 30, right: 30, top: 30, bottom: 30 };
      let y = margin.top;
      const data = remittanceData || {};

      const fileName = 'Remittance_Application_Form.pdf';

      // 若为汇款类型并匹配银行专用版面，使用专用渲染器（仅字段，不含说明）
      if (fileType === 'remittance' && await renderRemittancePdf(doc, page, margin, data)) {
        doc.save(fileName);
      } else {
        // 默认（通用/非特定银行）版面：沿用现有逻辑
        const FONT = 'helvetica';

        // Safe text function with better handling
        const safeText = (text) => {
          if (!text) return '';
          let s = String(text);
          s = s
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2013\u2014]/g, '-')
            .replace(/[\uFF08]/g, '(')
            .replace(/[\uFF09]/g, ')')
            .replace(/[\u00A0]/g, ' ');
          s = s.replace(/[^\x20-\x7E]/g, '');
          return s.substring(0, 100); // Limit length to prevent overflow
        };

        // Ensure space function
        const ensureSpace = (needed) => {
          if (y + needed > page.height - margin.bottom) {
            doc.addPage();
            y = margin.top;
          }
        };

        // Draw border around entire form
        const drawFormBorder = () => {
          doc.setLineWidth(1);
          doc.rect(margin.left, margin.top, page.width - margin.left - margin.right, page.height - margin.top - margin.bottom);
        };

        // Header section with title and bank info
        const drawHeader = () => {
          ensureSpace(60);
          
          // Main title box with black background
          doc.setFillColor(0, 0, 0);
          doc.rect(margin.left + 10, y + 10, 300, 20, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont(FONT, 'bold');
          doc.setFontSize(12);
          doc.text('REMITTANCE APPLICATION FORM', margin.left + 15, y + 24);
          
          // Bank label box on the right (dynamic, avoids misleading SCB branding)
          doc.setTextColor(0, 0, 0);
          doc.setLineWidth(1);
          doc.rect(page.width - margin.right - 150, y + 10, 140, 20);
          doc.setFont(FONT, 'normal');
          doc.setFontSize(10);
          const bankLabel = (() => {
            const layout = detectRemittanceLayout(data);
            if (layout === 'hsbc') return 'HSBC';
            if (layout === 'boc') return 'Bank of China';
            if (layout === 'scb') return 'Standard Chartered';
            return String(data?.bank || '').trim() || 'Remitting Bank';
          })();
          doc.text(bankLabel, page.width - margin.right - 145, y + 24);
          
          y += 40;
          
          // Instructions
          doc.setFont(FONT, 'normal');
          doc.setFontSize(8);
          doc.text('☐ Please ✓ where applicable', margin.left + 10, y + 10);
          doc.text('* Indicating mandatory information to be provided', margin.left + 10, y + 22);
          
          y += 35;
          
          // Branch and Date fields
          doc.setFontSize(9);
          doc.text('Branch', margin.left + 10, y + 10);
          doc.line(margin.left + 50, y + 12, margin.left + 250, y + 12);
          doc.text('Date', page.width - margin.right - 100, y + 10);
          doc.line(page.width - margin.right - 60, y + 12, page.width - margin.right - 10, y + 12);
          
          y += 25;
        };

        // Section header with black background
        const drawSectionHeader = (title) => {
          ensureSpace(25);
          doc.setFillColor(0, 0, 0);
          doc.rect(margin.left + 10, y, page.width - margin.left - margin.right - 20, 18, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont(FONT, 'bold');
          doc.setFontSize(9);
          doc.text(safeText(title), margin.left + 15, y + 12);
          doc.setTextColor(0, 0, 0);
          y += 23;
        };

        // Standard field row
        const drawFieldRow = (label, value, isRequired = false) => {
          ensureSpace(20);
          doc.setFont(FONT, 'normal');
          doc.setFontSize(8);
          const labelText = isRequired ? `${label}*` : label;
          doc.text(safeText(labelText), margin.left + 15, y + 12);
          
          // Draw underline
          const startX = margin.left + 15 + (label.length * 4) + 10;
          const endX = page.width - margin.right - 15;
          doc.line(startX, y + 14, endX, y + 14);
          
          // Fill in value if provided
          if (value) {
            doc.setFontSize(8);
            doc.text(safeText(value), startX + 5, y + 10);
          }
          
          y += 18;
        };

        // Two column field row
        const drawTwoColumnRow = (label1, value1, label2, value2) => {
          ensureSpace(20);
          doc.setFont(FONT, 'normal');
          doc.setFontSize(8);
          
          const midPoint = (page.width - margin.left - margin.right) / 2;
          
          // Left column
          doc.text(safeText(label1), margin.left + 15, y + 12);
          const leftStart = margin.left + 15 + (label1.length * 4) + 10;
          const leftEnd = margin.left + midPoint - 10;
          doc.line(leftStart, y + 14, leftEnd, y + 14);
          if (value1) {
            doc.text(safeText(value1), leftStart + 5, y + 10);
          }
          
          // Right column
          const rightStart = margin.left + midPoint + 10;
          doc.text(safeText(label2), rightStart, y + 12);
          const rightLineStart = rightStart + (label2.length * 4) + 10;
          const rightLineEnd = page.width - margin.right - 15;
          doc.line(rightLineStart, y + 14, rightLineEnd, y + 14);
          if (value2) {
            doc.text(safeText(value2), rightLineStart + 5, y + 10);
          }
          
          y += 18;
        };

        // Checkbox row for resident status
        const drawResidentRow = (isResident, contactNumber) => {
          ensureSpace(20);
          doc.setFont(FONT, 'normal');
          doc.setFontSize(8);
          
          doc.text('Resident (Yes/No)', margin.left + 15, y + 12);
          
          // Yes checkbox
          const yesX = margin.left + 120;
          doc.rect(yesX, y + 4, 8, 8);
          if (String(isResident).toLowerCase().startsWith('y')) {
            doc.text('✓', yesX + 1, y + 11);
          }
          doc.text('Yes', yesX + 15, y + 12);
          
          // No checkbox
          const noX = yesX + 50;
          doc.rect(noX, y + 4, 8, 8);
          if (String(isResident).toLowerCase().startsWith('n')) {
            doc.text('✓', noX + 1, y + 11);
          }
          doc.text('No', noX + 15, y + 12);
          
          // Contact telephone number on same line
          const contactX = noX + 60;
          doc.text('Contact Telephone Number', contactX, y + 12);
          const contactLineStart = contactX + 140;
          const contactLineEnd = page.width - margin.right - 15;
          doc.line(contactLineStart, y + 14, contactLineEnd, y + 14);
          if (contactNumber) {
            doc.text(safeText(contactNumber), contactLineStart + 5, y + 10);
          }
          
          y += 18;
        };

        // Payment method row with checkboxes
        const drawPaymentMethodRow = (paymentMethod) => {
          ensureSpace(20);
          doc.setFont(FONT, 'normal');
          doc.setFontSize(8);
          
          doc.text('Payment Method', margin.left + 15, y + 12);
          
          const method = String(paymentMethod || '').toLowerCase();
          let x = margin.left + 120;
          
          // From Account
          doc.rect(x, y + 4, 8, 8);
          if (method.includes('account') || method.includes('from')) {
            doc.text('✓', x + 1, y + 11);
          }
          doc.text('From Account', x + 15, y + 12);
          x += 100;
          
          // By Cash
          doc.rect(x, y + 4, 8, 8);
          if (method.includes('cash')) {
            doc.text('✓', x + 1, y + 11);
          }
          doc.text('By Cash', x + 15, y + 12);
          x += 80;
          
          // Others
          doc.rect(x, y + 4, 8, 8);
          if (method && !method.includes('account') && !method.includes('cash') && !method.includes('from')) {
            doc.text('✓', x + 1, y + 11);
          }
          doc.text('Others', x + 15, y + 12);
          
          y += 18;
        };

        // Currency and account fields
        const drawCurrencyAccountRow = (label, currency, account, isRequired = false) => {
          ensureSpace(35);
          doc.setFont(FONT, 'normal');
          doc.setFontSize(8);
          
          // Labels row
          doc.text('Currency', margin.left + 120, y + 8);
          doc.text('Account', margin.left + 250, y + 8);
          y += 12;
          
          // Main label and fields
          const labelText = isRequired ? `${label}*` : label;
          doc.text(safeText(labelText), margin.left + 15, y + 12);
          
          // Currency field
          doc.line(margin.left + 120, y + 14, margin.left + 200, y + 14);
          if (currency) {
            doc.text(safeText(currency), margin.left + 125, y + 10);
          }
          
          // Account field
          doc.line(margin.left + 250, y + 14, page.width - margin.right - 15, y + 14);
          if (account) {
            doc.text(safeText(account), margin.left + 255, y + 10);
          }
          
          y += 18;
        };

        // Start drawing the form
        drawFormBorder();
        drawHeader();

        // Applicant's Information section
        drawSectionHeader("Applicant's Information");
        // 左侧姓名，右侧证件号（同一行）
        drawTwoColumnRow('Name of Sender*', data?.senderName, 'ID/Passport No.', data?.idNumber);
        drawFieldRow('Address', data?.address);
        drawResidentRow(data?.isResident || data?.resident, data?.contactNumber);
        y += 10;

        // Transfer Instruction section
        drawSectionHeader('Transfer Instruction');
        drawPaymentMethodRow(data?.paymentMethod);
        y += 5;
        
        drawCurrencyAccountRow('Debit A/C No.', data?.debitAcCurrency, data?.debitAc, true);
        y += 5;
        drawCurrencyAccountRow('Charges Debit A/C No.', data?.chargesDebitAcCurrency, data?.chargesDebitAc, true);
        y += 15;

        // Bank Information (no section header)
        drawFieldRow('Intermediary Bank Name', data?.intermediaryBank);
        drawFieldRow("Beneficiary's Bank Name", data?.beneficiaryBank);
        drawFieldRow('Beneficiary Name', data?.beneficiaryName);
        y += 15;

        // Contract Details section
        drawSectionHeader('Contract Details (As Applicable)');
        drawTwoColumnRow("Dealer's Name", data?.dealerName, 'FX rates', data?.fxRates);
        y += 15;

        // Customer's Signature section
        drawSectionHeader("Customer's Signature");
        ensureSpace(60);
        doc.setFontSize(7);
        doc.text('We authorize the bank to debit the above monies for lawful purpose detailed above and agree to abide by the', margin.left + 15, y + 10);
        doc.text('Terms and Conditions printed overleaf', margin.left + 15, y + 22);
        y += 35;
        
        // Signature box
        doc.rect(margin.left + 15, y, page.width - margin.left - margin.right - 30, 35);
        doc.setFontSize(8);
        doc.text("Customer's Signature", margin.left + 20, y + 30);

        doc.save(fileName);
      }
    } catch (e) {
      console.error('PDF generation error:', e);
      try {
        const fb = new jsPDF({ unit: 'pt', format: 'a4' });
        fb.setFont('helvetica', 'normal');
        fb.setFontSize(14);
        fb.text('Download unavailable. Generated minimal PDF.', 40, 60);
        fb.save('Remittance_Application_Form.pdf');
      } catch (fallbackErr) {
        console.error('PDF fallback error:', fallbackErr);
        alert('Failed to generate PDF. Please try again later.');
      }
    } finally {
      setDownloadStarted(false);
    }
  };

  const handleNewTransaction = () => {
    navigate('/upload');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(backRoute)}>
          <ArrowLeft size={24} />
        </BackButton>
        <Title>{fileType === 'remittance' ? 'Download Remittance Application Form' : 'Download FX Form'}</Title>
        <StatusBar>
          <StatusTime />
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
          </div>
        </StatusBar>
      </Header>

      <Content>
        <SuccessSection>
          <SuccessIcon style={{ visibility: 'hidden' }}>
            <CheckCircle size={40} />
          </SuccessIcon>
          <SuccessTitle>Form Ready for Download!</SuccessTitle>
          <SuccessSubtitle>
            {fileType === 'remittance' ? 'Your remittance application form is ready for download.' : 'Your FX form has been successfully generated and is ready for download.'}
          </SuccessSubtitle>
        </SuccessSection>

        <FileInfo>
          <FileHeader>
            <FileIcon style={{ visibility: 'hidden' }}>
              <FileText size={24} />
            </FileIcon>
            <FileDetails>
              <FileName>{fileType === 'remittance' ? 'Remittance_Application_Form.pdf' : 'FX_Form_Deal23-01-15.pdf'}</FileName>
              <FileSize>2.5 MB • Generated just now</FileSize>
            </FileDetails>
          </FileHeader>
          <FileDescription>
            {fileType === 'remittance' ? (
              <>This form contains remittance details derived from your invoice/contract, including sender, bank routing, and payment information.</>
            ) : (
              <>This form contains all the transaction details extracted from your uploaded document, including compliance checks and risk analysis results.</>
            )}
          </FileDescription>
        </FileInfo>

        {previewUrl && (
          <PreviewContainer>
            <PreviewHeader>
              <PreviewTitle>PDF Preview</PreviewTitle>
            </PreviewHeader>
            <PreviewFrame src={previewUrl} title="FX Form Preview" />
          </PreviewContainer>
        )}

        <DownloadOptions>
          <OptionsTitle>Download Options</OptionsTitle>
          <OptionsList>
            {downloadOptions.map((option, index) => (
              <OptionItem key={index} onClick={handlePreview}>
                <OptionIcon style={{ visibility: 'hidden' }}>
                  <option.icon size={20} />
                </OptionIcon>
                <OptionContent>
                  <OptionTitle>{option.title}</OptionTitle>
                  <OptionDescription>{option.description}</OptionDescription>
                </OptionContent>
              </OptionItem>
            ))}
          </OptionsList>
        </DownloadOptions>

        <ActionButtons>
          <ActionButton onClick={handlePreview} disabled={downloadStarted}>
            <FileText size={20} />
            {downloadStarted ? 'Generating...' : 'Preview'}
          </ActionButton>
          <ActionButton primary onClick={handlePreview} disabled={downloadStarted}>
            <Download size={20} />
            {downloadStarted ? 'Generating...' : 'Download Now'}
          </ActionButton>
          <ActionButton onClick={handleNewTransaction}>Start New Transaction</ActionButton>
          <ActionButton onClick={handleBackToHome}>Back to Home</ActionButton>
        </ActionButtons>
      </Content>

      <BottomNavigation />
    </Container>
  );
};

export default DownloadPage;

// （已移除底部重复的检测与 HSBC 渲染器定义）

// BOC HK Remittance Application — legacy local renderer (kept for reference, unused)
const renderBocRemittanceFormLocal = (doc, page, margin, data) => {
  // Base typography
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  // Title row
  doc.setFontSize(12);
  doc.text('Remittance Application (BOC Hong Kong)', margin.left + 15, margin.top + 20);
  doc.setFontSize(9);
  doc.text('BANK OF CHINA (HONG KONG) LIMITED', page.width - margin.right - 250, margin.top + 20);

  // 1. Remittance details
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

  // 2. Applicant & accounts
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

  // 3. Intermediary Bank
  doc.setFont('helvetica', 'bold');
  doc.text('Intermediary Bank', margin.left + 15, margin.top + 192);
  doc.setFont('helvetica', 'normal');

  doc.text('Name & Address', margin.left + 15, margin.top + 210);
  doc.line(margin.left + 120, margin.top + 212, page.width - margin.right - 15, margin.top + 212);
  if (data?.intermediaryBank) {
    doc.text(String(data.intermediaryBank), margin.left + 125, margin.top + 209);
  }

  doc.text('SWIFT Code', margin.left + 15, margin.top + 228);
  doc.line(margin.left + 100, margin.top + 230, margin.left + 250, margin.top + 230);
  if (data?.swift || data?.intermediarySwift) {
    doc.text(String(data.swift || data.intermediarySwift), margin.left + 105, margin.top + 227);
  }

  // 4. Beneficiary Bank
  doc.setFont('helvetica', 'bold');
  doc.text('Beneficiary Bank*', margin.left + 15, margin.top + 250);
  doc.setFont('helvetica', 'normal');

  doc.text('Name & Address', margin.left + 15, margin.top + 268);
  doc.line(margin.left + 120, margin.top + 270, page.width - margin.right - 15, margin.top + 270);
  if (data?.beneficiaryBank) {
    doc.text(String(data.beneficiaryBank), margin.left + 125, margin.top + 267);
  }

  doc.text('Country/Region', margin.left + 15, margin.top + 288);
  doc.line(margin.left + 120, margin.top + 290, page.width - margin.right - 350, margin.top + 290);
  if (data?.country) {
    doc.text(String(data.country), margin.left + 125, margin.top + 287);
  }

  doc.text('Province/State', margin.left + 360, margin.top + 288);
  doc.line(margin.left + 450, margin.top + 290, page.width - margin.right - 180, margin.top + 290);
  if (data?.province || data?.state) {
    doc.text(String(data.province || data.state), margin.left + 455, margin.top + 287);
  }

  doc.text('City', margin.left + 540, margin.top + 288);
  doc.line(margin.left + 570, margin.top + 290, page.width - margin.right - 15, margin.top + 290);
  if (data?.city) {
    doc.text(String(data.city), margin.left + 575, margin.top + 287);
  }

  doc.text('Bank Code', margin.left + 15, margin.top + 306);
  doc.line(margin.left + 90, margin.top + 308, page.width - margin.right - 15, margin.top + 308);
  if (data?.bankCode) {
    doc.text(String(data.bankCode), margin.left + 95, margin.top + 305);
  }

  // 5. Beneficiary
  doc.setFont('helvetica', 'bold');
  doc.text('Beneficiary', margin.left + 15, margin.top + 328);
  doc.setFont('helvetica', 'normal');

  doc.text('Account No. / IBAN*', margin.left + 15, margin.top + 346);
  doc.line(margin.left + 140, margin.top + 348, page.width - margin.right - 15, margin.top + 348);
  if (data?.beneficiaryAccount || data?.iban) {
    doc.text(String(data.beneficiaryAccount || data.iban), margin.left + 145, margin.top + 345);
  }

  doc.text('Name*', margin.left + 15, margin.top + 364);
  doc.line(margin.left + 70, margin.top + 366, page.width - margin.right - 15, margin.top + 366);
  if (data?.beneficiaryName) {
    doc.text(String(data.beneficiaryName), margin.left + 75, margin.top + 363);
  }

  doc.text('Address / Contact', margin.left + 15, margin.top + 382);
  doc.line(margin.left + 120, margin.top + 384, page.width - margin.right - 15, margin.top + 384);
  if (data?.beneficiaryAddress || data?.beneficiaryPhone) {
    const v = [data.beneficiaryAddress, data.beneficiaryPhone].filter(Boolean).join(' / ');
    doc.text(String(v), margin.left + 125, margin.top + 381);
  }

  // 6. Others: note, charges, purpose
  doc.setFont('helvetica', 'bold');
  doc.text('Others', margin.left + 15, margin.top + 404);
  doc.setFont('helvetica', 'normal');

  doc.text('Note', margin.left + 15, margin.top + 422);
  doc.line(margin.left + 60, margin.top + 424, page.width - margin.right - 15, margin.top + 424);
  if (data?.note) {
    doc.text(String(data.note), margin.left + 65, margin.top + 421);
  }

  doc.text('Charge Option* (OUR/SHA/BEN)', margin.left + 15, margin.top + 440);
  doc.line(margin.left + 200, margin.top + 442, page.width - margin.right - 15, margin.top + 442);
  if (data?.chargeOption || data?.charges) {
    doc.text(String(data.chargeOption || data.charges), margin.left + 205, margin.top + 439);
  }

  doc.text('Purpose of Remittance*', margin.left + 15, margin.top + 458);
  doc.line(margin.left + 160, margin.top + 460, page.width - margin.right - 15, margin.top + 460);
  if (data?.purpose) {
    doc.text(String(data.purpose), margin.left + 165, margin.top + 457);
  }

  // Signature & date (bottom)
  doc.text('Signature', margin.left + 15, margin.top + 494);
  doc.rect(margin.left + 80, margin.top + 474, page.width - margin.right - margin.left - 190, 40);
  doc.text('Date', page.width - margin.right - 120, margin.top + 494);
  doc.line(page.width - margin.right - 80, margin.top + 496, page.width - margin.right - 15, margin.top + 496);
};

// （已移除底部重复的封装入口 renderRemittancePdf）