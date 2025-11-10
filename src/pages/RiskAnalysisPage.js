// RiskAnalysisPage 组件
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AlertTriangle, TrendingUp, Shield, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import StatusTime from '../components/StatusTime';
import { requestJson } from '../utils/api';

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

const RiskOverview = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const RiskLevel = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const RiskIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f9fafb;
  border: 2px solid ${props => getRiskColor(props.score)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => getRiskColor(props.score)};
`;

const RiskInfo = styled.div`
  flex: 1;
`;

const RiskTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const RiskSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
`;

const RiskScore = styled.div`
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 20px;
`;

// 颜色映射函数：>80 绿色、60-80 橙色、<60 红色
const getRiskColor = (score) => {
  const n = Number(score) || 0;
  if (n > 80) return '#90EE90';   // 浅绿色
  if (n >= 60) return '#f59e0b';  // 橙色
  return '#dc2626';               // 红色
};

const ScoreValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => getRiskColor(props.score)};
  margin-bottom: 4px;
`;

const ScoreLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const AnalysisSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FactorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FactorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
`;

const FactorIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.status === 'pass' ? '#10b981' : '#dc2626'};
`;

const FactorContent = styled.div`
  flex: 1;
`;

const FactorTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

const FactorDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const RecommendationSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const RecommendationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RecommendationItem = styled.div`
  padding: 12px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
`;

const RecommendationText = styled.div`
  font-size: 14px;
  color: #92400e;
  line-height: 1.4;
`;

const ActionButton = styled.button`
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
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 18px;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 18px;
  color: #dc2626;
  text-align: center;
  padding: 20px;
`;

const RiskAnalysisPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { remittanceData } = location.state || {};

  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!remittanceData) {
      // If there's no data, redirect to the start of the process
      navigate('/upload');
      return;
    }

    const fetchRiskAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/risk-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ remittanceData }),
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch risk analysis');
          } catch (jsonError) {
            throw new Error('Failed to parse error response from server.');
          }
        }

        const data = await response.json();
        console.log('Received analysis data:', JSON.stringify(data, null, 2));
        setAnalysisResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskAnalysis();
  }, [remittanceData, navigate]);

  const handleProceed = () => {
    navigate('/download', { state: { remittanceData } });
  };

  if (loading) {
    return (
      <Container>
        <Header><Title>Risk Analysis</Title></Header>
        <LoadingContainer>Generating Risk Report...</LoadingContainer>
        <BottomNavigation />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header><Title>Risk Analysis</Title></Header>
        <ErrorContainer>
          Error: {error}
        </ErrorContainer>
        <BottomNavigation />
      </Container>
    );
  }

  if (!analysisResult) {
    return (
      <Container>
        <Header><Title>Risk Analysis</Title></Header>
        <ErrorContainer>
          No analysis data available.
        </ErrorContainer>
        <BottomNavigation />
      </Container>
    );
  }
  
  const { overallRiskLevel, riskScore, riskFactors, recommendations } = analysisResult;
  const riskLevel = overallRiskLevel.toLowerCase();

  return (
    <Container>
      <Header>
        <Title>Risk Analysis</Title>
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
          <>
            <RiskOverview>
              <RiskLevel>
                <RiskIcon score={Number(riskScore)}>
                  <AlertTriangle size={24} />
                </RiskIcon>
                <RiskInfo>
                  <RiskTitle>{overallRiskLevel} Risk Transaction</RiskTitle>
                  <RiskSubtitle>Additional review recommended</RiskSubtitle>
                </RiskInfo>
              </RiskLevel>
              
              <RiskScore>
                <ScoreValue score={Number(riskScore)}>{riskScore}/100</ScoreValue>
                <ScoreLabel>Risk Score</ScoreLabel>
              </RiskScore>
            </RiskOverview>
          
            <AnalysisSection>
              <SectionTitle>
                <TrendingUp size={20} />
                Risk Factors Analysis
              </SectionTitle>
              <FactorList>
                {riskFactors.map((factor, index) => (
                  <FactorItem key={index}>
                    <FactorIcon status={factor.status.toLowerCase() === 'pass' ? 'pass' : 'fail'}>
                      {factor.status.toLowerCase() === 'pass' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </FactorIcon>
                    <FactorContent>
                      <FactorTitle>{factor.factor}</FactorTitle>
                      <FactorDescription>{factor.reason}</FactorDescription>
                    </FactorContent>
                  </FactorItem>
                ))}
              </FactorList>
            </AnalysisSection>
          
            {recommendations && recommendations.length > 0 && (
              <RecommendationSection>
                <SectionTitle>
                  <Shield size={20} />
                  Compliance Recommendations
                </SectionTitle>
                <RecommendationList>
                  {recommendations.map((rec, index) => (
                    <RecommendationItem key={index}>
                      <RecommendationText>{rec}</RecommendationText>
                    </RecommendationItem>
                  ))}
                </RecommendationList>
              </RecommendationSection>
            )}
          
            <ActionButton onClick={handleProceed}>
              Proceed to FX Form
              <ArrowRight size={20} />
            </ActionButton>
          </>
      </Content>
      <BottomNavigation />
    </Container>
  );
};

export default RiskAnalysisPage;