import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FileText, Receipt, AlertCircle, FolderOpen, Upload } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import StatusTime from '../components/StatusTime';


const documentTypes = [
  { id: 'invoice', label: 'Invoice', icon: Receipt },
  { id: 'contract', label: 'Contract', icon: FileText }
];

// Bank style options (selected at upload stage)
const bankStyles = [
  { id: 'boc', label: '中国银行' },
  { id: 'hsbc', label: 'HSBC' },
  { id: 'scb', label: 'Standard Chartered' }
];

const guidelines = [
  { label: 'File Format', text: 'PDF, DOCX, JPG, PNG' },
  { label: 'Max Size', text: '10MB per file' },
  { label: 'Image Quality', text: 'Ensure text is clear and legible' },
];

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

const DocumentTypeSection = styled.div`
  margin-bottom: 32px;
`;

const BankStyleSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TypeOptions = styled.div`
  display: flex;
  gap: 12px;
`;

const TypeOption = styled.div`
  flex: 1;
  background: ${props => props.selected ? '#6366f1' : 'white'};
  color: ${props => props.selected ? 'white' : '#374151'};
  border: 2px solid ${props => props.selected ? '#6366f1' : '#e5e7eb'};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #6366f1;
    background: ${props => props.selected ? '#5856eb' : '#f8fafc'};
  }
`;

const BankOptions = styled.div`
  display: flex;
  gap: 12px;
`;

const BankOption = styled.div`
  flex: 1;
  background: ${props => props.selected ? '#10b981' : 'white'};
  color: ${props => props.selected ? 'white' : '#374151'};
  border: 2px solid ${props => props.selected ? '#10b981' : '#e5e7eb'};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #10b981;
    background: ${props => props.selected ? '#0ea271' : '#f8fafc'};
  }
`;

const TypeIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
`;

const TypeLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const GuidelinesSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
`;

const GuidelinesTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GuidelineItem = styled.div`
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const GuidelineLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
`;

const GuidelineText = styled.div`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
`;

const UploadSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const UploadTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
`;

const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #6366f1;
    background: #f8fafc;
  }
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  color: #9ca3af;
`;

const UploadText = styled.div`
  font-size: 16px;
  color: #374151;
  margin-bottom: 8px;
`;

const UploadButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  
  &:hover {
    background: #5856eb;
  }
`;

const FileStatus = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
`;

const ProcessButton = styled.button`
  width: 100%;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: #5856eb;
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

// 资料清单面板
const ChecklistSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px dashed #e5e7eb;
`;
const ChecklistTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
`;
const ChecklistList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const ChecklistItemRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #f3f4f6;
  &:last-child { border-bottom: none; }
`;
const ItemLabel = styled.span`
  font-size: 14px;
  color: #374151;
`;
const StatusBadge = styled.span`
  font-size: 12px;
  border-radius: 6px;
  padding: 4px 8px;
  ${props => props.status === 'uploaded' ? `
    background: #dcfce7; color: #166534; border: 1px solid #22c55e;
  ` : props.status === 'completed' ? `
    background: #e0e7ff; color: #1e3a8a; border: 1px solid #6366f1;
  ` : `
    background: #fee2e2; color: #991b1b; border: 1px solid #ef4444;
  `}
`;
const MarkButton = styled.button`
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  &:hover { background: #e5e7eb; }
`;



const UploadPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('invoice');
  const [selectedBankStyle, setSelectedBankStyle] = useState('');
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // 新增：进度与错误状态、取消引用
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const xhrRef = useRef(null);

  // 资料清单：根据文档类型生成需求
  const getChecklist = (type) => {
    if (type === 'contract') {
      return [
        { id: 'contract', label: 'Contract 文件', required: true },
        { id: 'invoice', label: 'Invoice（如已开具）', required: false },
        { id: 'proofOfService', label: '服务完成证明', required: false },
        { id: 'proofOfPayment', label: '付款凭证/水单', required: false },
      ];
    }
    // 默认 invoice
    return [
      { id: 'invoice', label: 'Invoice 发票', required: true },
      { id: 'contract', label: 'Contract（如有）', required: false },
      { id: 'customsDeclaration', label: '报关单/提单（货物类）', required: false },
      { id: 'proofOfPayment', label: '付款凭证/水单', required: false },
    ];
  };
  const checklist = getChecklist(selectedType);
  const [completedDocs, setCompletedDocs] = useState({});
  const markCompleted = (id) => setCompletedDocs(prev => ({ ...prev, [id]: true }));
  const unmarkCompleted = (id) => setCompletedDocs(prev => ({ ...prev, [id]: false }));
  const statusOf = (id) => {
    const uploaded = file && ((selectedType === 'invoice' && id === 'invoice') || (selectedType === 'contract' && id === 'contract'));
    if (uploaded) return 'uploaded';
    if (completedDocs[id]) return 'completed';
    return 'missing';
  };

  // 文件预检（大小≤10MB、扩展名/类型合理）
  const validateFile = (f) => {
    if (!f) return 'No file selected.';
    const maxBytes = 10 * 1024 * 1024;
    if (f.size > maxBytes) return 'File is larger than 10MB.';
    const allowedExt = ['pdf', 'docx', 'jpg', 'jpeg', 'png'];
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    if (!allowedExt.includes(ext)) return 'Only PDF, DOCX, JPG, JPEG, PNG are allowed.';
    return '';
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
    setErrorMsg('');
    const picked = e.target.files?.[0] || null;
    const err = validateFile(picked);
    if (err) {
      setFile(null);
      setErrorMsg(err);
      return;
    }
    setFile(picked);
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  };

  const handleAiExtraction = async () => {
    if (!file) {
      alert('Please select a file to process.');
      return;
    }
    if (!selectedBankStyle) {
      alert('请选择银行样式（中国银行 / HSBC / Standard Chartered）。');
      return;
    }
    const err = validateFile(file);
    if (err) {
      setErrorMsg(err);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setErrorMsg('');

    const maxRetries = 2;
    const backoff = (attempt) => new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt - 1)));

    const attemptUpload = (attempt = 1) =>
      new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.open('POST', '/api/extract', true);
        xhr.responseType = 'text'; // 统一以 text 解析再转 JSON

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText || '{}');
              resolve(data);
            } catch (parseErr) {
              reject(new Error('Failed to parse server response.'));
            }
          } else {
            let message = `Upload failed with status ${xhr.status}`;
            try {
              const j = JSON.parse(xhr.responseText || '{}');
              message = j.message || message;
            } catch (_) {}
            reject(new Error(message));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.onabort = () => reject(new Error('Upload cancelled.'));

        xhr.send(formData);
      });

    try {
      let result;
      for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
          result = await attemptUpload(attempt);
          break;
        } catch (e) {
          if (e.message === 'Upload cancelled.') throw e;
          if (attempt <= maxRetries) {
            await backoff(attempt);
            continue;
          }
          throw e;
        }
      }
      // 跳转到银行专用填表页，携带解析信息与银行样式
      const routeMap = {
        hsbc: '/remittance-form-HSBC',
        boc: '/remittance-form-BOC',
        scb: '/remittance-form-SCB'
      };
      const targetRoute = routeMap[selectedBankStyle] || '/remittance-form';
      navigate(targetRoute, { state: { extractedInfo: result, bankStyle: selectedBankStyle } });
    } catch (error) {
      console.error('Error during AI extraction:', error);
      setErrorMsg(error.message || 'Failed to upload. Please try again.');
      alert(error.message || 'Failed to upload. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      xhrRef.current = null;
    }
  };

  return (
    <Container>
      <Header>
        <Title>Upload Document</Title>
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
        <DocumentTypeSection>
          <SectionTitle>
            <FileText size={20} />
            Document Type
          </SectionTitle>
          <TypeOptions>
            {documentTypes.map(type => (
              <TypeOption
                key={type.id}
                selected={selectedType === type.id}
                onClick={() => setSelectedType(type.id)}
              >
                <TypeIcon>
                  <type.icon size={24} />
                </TypeIcon>
                <TypeLabel>{type.label}</TypeLabel>
              </TypeOption>
            ))}
          </TypeOptions>
        </DocumentTypeSection>

        {/* 银行样式选择（上传页设置） */}
        <BankStyleSection>
          <SectionTitle>
            <FileText size={20} />
            Bank Style
          </SectionTitle>
          <BankOptions>
            {bankStyles.map((b) => (
              <BankOption
                key={b.id}
                selected={selectedBankStyle === b.id}
                onClick={() => setSelectedBankStyle(b.id)}
              >
                <TypeLabel>{b.label}</TypeLabel>
              </BankOption>
            ))}
          </BankOptions>
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
            选择在下载页渲染的银行版式
          </div>
        </BankStyleSection>

        <GuidelinesSection>
          <GuidelinesTitle>
            <AlertCircle size={20} />
            File Upload Guidelines
          </GuidelinesTitle>
          {guidelines.map((guideline, index) => (
            <GuidelineItem key={index}>
              <GuidelineLabel>{guideline.label}</GuidelineLabel>
              <GuidelineText>{guideline.text}</GuidelineText>
            </GuidelineItem>
          ))}
        </GuidelinesSection>

        {/* 资料清单与缺失检测 */}
        <ChecklistSection>
          <ChecklistTitle>Required Documents Checklist</ChecklistTitle>
          <ChecklistList>
            {checklist.map(doc => {
              const st = statusOf(doc.id);
              return (
                <ChecklistItemRow key={doc.id}>
                  <ItemLabel>
                    {doc.label} {doc.required ? '(必需)' : '(可选)'}
                  </ItemLabel>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={st}>
                      {st === 'uploaded' ? '已上传' : st === 'completed' ? '已补充' : '缺失'}
                    </StatusBadge>
                    {st === 'missing' ? (
                      <MarkButton type="button" onClick={() => markCompleted(doc.id)}>标记已补充</MarkButton>
                    ) : st === 'completed' ? (
                      <MarkButton type="button" onClick={() => unmarkCompleted(doc.id)}>取消标记</MarkButton>
                    ) : null}
                  </div>
                </ChecklistItemRow>
              );
            })}
          </ChecklistList>
        </ChecklistSection>

        <UploadSection>
          <UploadTitle>Select Your File</UploadTitle>
          <UploadArea onClick={() => document.getElementById('fileInput').click()}>
            <UploadIcon>
              <FolderOpen size={48} />
            </UploadIcon>
            <UploadText>Drag & drop your file here or</UploadText>
            <UploadButton type="button">Choose File</UploadButton>
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </UploadArea>
          {file ? (
            <FileStatus>
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </FileStatus>
          ) : (
            <FileStatus>No file selected</FileStatus>
          )}

          {/* 进度条与取消 */}
          {isProcessing && (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4 }}>
                <div
                  style={{
                    width: `${progress}%`,
                    height: 8,
                    background: '#6366f1',
                    borderRadius: 4,
                    transition: 'width 0.2s',
                  }}
                />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                Uploading... {progress}%
              </div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel Upload
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ color: '#dc2626', marginTop: 8, textAlign: 'center' }}>{errorMsg}</div>
          )}
        </UploadSection>

        <ProcessButton onClick={handleAiExtraction} disabled={!file || isProcessing || !selectedBankStyle}>
          {isProcessing ? 'Processing...' : 'Fill Remittance Form with AI'}
        </ProcessButton>
      </Content>

      <BottomNavigation />
    </Container>
);
};

export default UploadPage;