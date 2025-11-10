import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BottomNavigation from '../components/BottomNavigation';
import { MessageSquare, Send, CheckCircle, ArrowLeft } from 'lucide-react';
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

const ChatSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  ${props => props.role === 'assistant' ? `
    background: #f3f4f6;
    color: #374151;
    border-top-left-radius: 4px;
  ` : `
    background: #6366f1;
    color: white;
    margin-left: auto;
    border-top-right-radius: 4px;
  `}
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  font-size: 14px;
`;

const SendButton = styled.button`
  padding: 12px 16px;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
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
    background: #10b981;
    color: white;
    border: none;
    &:hover { background: #0ea571; }
  ` : `
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
    &:hover { border-color: #6366f1; color: #6366f1; }
  `}
`;

const ChatbotPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.remittanceData || {};
  const [formData, setFormData] = useState(initialData);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: '你好！我会帮助你补充汇款申请表。请按提示回答即可。',
  }]);
  const [input, setInput] = useState('');
  const [currentField, setCurrentField] = useState(null);

  const requiredFields = useMemo(() => ([
    { key: 'senderName', prompt: '请提供发件人姓名（Name of Sender*）' },
    { key: 'address', prompt: '请提供发件人地址（Address）' },
    { key: 'idNumber', prompt: '请提供身份证件号码（ID/Passport No.）' },
    { key: 'isResident', prompt: '请确认是否为居民（Resident）- 请回答 Yes 或 No' },
    { key: 'contactNumber', prompt: '请提供联系电话号码（Contact Telephone Number）' },
    { key: 'paymentMethod', prompt: '请选择付款方式：From Account（从账户）、By Cash（现金）或 Others（其他）' },
    { key: 'debitAcCurrency', prompt: '请提供扣账账户的货币类型（Debit A/C Currency）' },
    { key: 'debitAc', prompt: '请提供扣账账户号码（Debit A/C No.*）' },
    { key: 'chargesDebitAcCurrency', prompt: '请提供手续费扣账账户的货币类型（Charges Debit A/C Currency）' },
    { key: 'chargesDebitAc', prompt: '请提供手续费扣账账户号码（Charges Debit A/C No.*）' },
    { key: 'intermediaryBank', prompt: '请提供中间银行名称（Intermediary Bank Name）' },
    { key: 'beneficiaryBank', prompt: '请提供受益人银行名称（Beneficiary\'s Bank Name）' },
    { key: 'beneficiaryName', prompt: '请提供受益人姓名（Beneficiary Name）' },
    { key: 'dealerName', prompt: '请提供交易员姓名（Dealer\'s Name）' },
    { key: 'fxRates', prompt: '请提供外汇汇率（FX rates）' },
  ]), []);

  const findNextMissing = () => {
    return requiredFields.find(f => !formData[f.key] || String(formData[f.key]).trim() === '');
  };

  useEffect(() => {
    // 初次或每次更新后提示下一个缺失字段
    const next = findNextMissing();
    if (next && next.key !== currentField) {
      setCurrentField(next.key);
      setMessages(m => [...m, { role: 'assistant', text: next.prompt }]);
    }
  }, [formData, currentField]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (!currentField) return;

    // 记录用户回复
    setMessages(m => [...m, { role: 'user', text: input.trim() }]);
    
    // 处理用户输入的值
    let value = input.trim();
    
    // 特殊处理某些字段
    if (currentField === 'isResident') {
      value = value.toLowerCase() === 'yes' ? 'Yes' : 'No';
    } else if (currentField === 'paymentMethod') {
      if (value.toLowerCase().includes('account') || value.toLowerCase().includes('账户')) {
        value = 'From Account';
      } else if (value.toLowerCase().includes('cash') || value.toLowerCase().includes('现金')) {
        value = 'By Cash';
      } else {
        value = 'Others';
      }
    }
    
    // 更新数据
    const updated = { ...formData, [currentField]: value };
    setFormData(updated);
    setInput('');

    // 如果仍有缺失，下一条提示会在 useEffect 中自动追加
    const next = requiredFields.find(f => !updated[f.key] || String(updated[f.key]).trim() === '');
    if (!next) {
      // 全部补齐，给出完成提示
      setMessages(m => [...m, { role: 'assistant', text: '所有必填信息已补充完成。你可以点击下方"确认并下载"。' }]);
      setCurrentField(null);
    }
  };

  const allFilled = requiredFields.every(f => formData[f.key] && String(formData[f.key]).trim() !== '');

  const handleConfirmAndDownload = () => {
    navigate('/download', { state: { remittanceData: formData, fileType: 'remittance', from: '/chatbot' } });
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/remittance-form', { state: { remittanceData: formData } })}>
          <ArrowLeft size={24} />
        </BackButton>
        <Title>Chatbot Assist</Title>
        <StatusBar>
          <StatusTime />
        </StatusBar>
      </Header>

      <Content>
        <ChatSection>
          <MessageRow>
            <MessageSquare size={20} style={{ color: '#6b7280' }} />
            <div style={{ fontSize: 14, color: '#6b7280' }}>
              通过对话补充“REMITTANCE APPLICATION FORM”未填写的部分。
            </div>
          </MessageRow>

          {messages.map((msg, idx) => (
            <MessageRow key={idx}>
              <MessageBubble role={msg.role}>{msg.text}</MessageBubble>
            </MessageRow>
          ))}

          <InputRow>
            <TextInput
              placeholder={currentField ? '请输入信息...' : '所有必填项已完成'}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!currentField}
            />
            <SendButton onClick={handleSend} disabled={!currentField}>
              <Send size={18} />
              发送
            </SendButton>
          </InputRow>
        </ChatSection>

        <ActionButtons>
          <ActionButton primary disabled={!allFilled} onClick={handleConfirmAndDownload}>
            <CheckCircle size={20} />
            {allFilled ? '确认并下载' : '请先补齐必填项'}
          </ActionButton>
        </ActionButtons>
      </Content>

      <BottomNavigation />
    </Container>
  );
};

export default ChatbotPage;