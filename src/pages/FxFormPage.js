import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle, Eye, Edit, Download } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import StatusTime from '../components/StatusTime';
import { listFxSceneTemplates, applyTemplate } from '../utils/templates';

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
  justify-content: center;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
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

const TemplateBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const Select = styled.select`
  font-size: 12px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  background: white;
`;

const SmallButton = styled.button`
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
`;

const FileInfo = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
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
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: #6b7280;
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
  background: #6366f1;
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

const FormSummary = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const SummaryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const SummaryValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
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

const FxFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scannedData } = location.state || {};
  const [data, setData] = React.useState(scannedData || null);
  const [selectedFxScene, setSelectedFxScene] = React.useState('');

  const handleReviewForm = () => {
    console.log('Reviewing form...', scannedData);
    // In a real app, this would navigate to a form editing/reviewing interface
  };

  const handleEditForm = () => {
    console.log('Editing form...', scannedData);
    // In a real app, this would navigate to a form editing interface
  };

  const handleConfirmDownload = () => {
    navigate('/download', { state: { remittanceData: data, fileType: 'fx', from: '/fx-form' } });
  };

  const handleApplyTemplate = () => {
    if (!data) return;
    const tpl = listFxSceneTemplates().find(s => s.key === selectedFxScene)?.preset;
    const merged = applyTemplate(data, { preset: tpl }, { overwriteExisting: false });
    setData(merged);
  };

  if (!data) {
    return (
      <Container>
        <Header>
          <Title>Error</Title>
        </Header>
        <Content>
          <p>No data available. Please upload a document first.</p>
        </Content>
        <BottomNavigation />
      </Container>
    );
  }

  const formData = [
    { label: 'Form ID', value: data.formId },
    { label: 'Client Name', value: data.clientName },
    { label: 'Currency Pair', value: data.currencyPair },
    { label: 'Amount', value: data.amount },
    { label: 'Exchange Rate', value: data.exchangeRate },
    { label: 'Value Date', value: data.valueDate },
    { label: 'Status', value: data.status }
  ];

  return (
    <Container>
      <Header>
        <Title>FX Form Generated</Title>
        <StatusBar>
          <StatusTime />
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
          </div>
        </StatusBar>
      </Header>

      <TemplateBar>
        <span style={{ fontSize: '12px', fontWeight: '600' }}>Templates</span>
        <Select value={selectedFxScene} onChange={e => setSelectedFxScene(e.target.value)}>
          <option value="">FX Scene…</option>
          {listFxSceneTemplates().map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </Select>
        <SmallButton onClick={handleApplyTemplate}>Apply Template</SmallButton>
      </TemplateBar>

      <Content>
        <FileInfo>
          <FileIcon>
            <CheckCircle size={24} />
          </FileIcon>
          <FileDetails>
            <FileName>FX_Form_Deal23-01-15.pdf (2.5 MB)</FileName>
            <FileSize>Generated successfully</FileSize>
          </FileDetails>
        </FileInfo>

        <SuccessSection>
          <SuccessIcon>
            <CheckCircle size={40} />
          </SuccessIcon>
          <SuccessTitle>Form Generated Successfully!</SuccessTitle>
          <SuccessSubtitle>
            Your FX form is now ready. Review the details below before finalizing.
          </SuccessSubtitle>
        </SuccessSection>

        <FormSummary>
          <SummaryTitle>FX Form Summary</SummaryTitle>
          {formData.map((item, index) => (
            <SummaryItem key={index}>
              <SummaryLabel>{item.label}</SummaryLabel>
              <SummaryValue>{item.value}</SummaryValue>
            </SummaryItem>
          ))}
        </FormSummary>

        <ActionButtons>
          <ActionButton onClick={handleReviewForm}>
            <Eye size={20} />
            Review Form
          </ActionButton>
          
          <ActionButton onClick={handleEditForm}>
            <Edit size={20} />
            Edit Form
          </ActionButton>
          
          <ActionButton primary onClick={handleConfirmDownload}>
            <Download size={20} />
            Confirm & Export
          </ActionButton>
        </ActionButtons>
      </Content>

      <BottomNavigation />
    </Container>
  );
};

export default FxFormPage;