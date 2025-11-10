import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
  background: white;
  margin: 16px;
  border-radius: 8px;
  padding: 20px 16px;
  line-height: 1.7;
  color: #374151;
  font-size: 14px; /* smaller body text */
`;

const SectionTitle = styled.h2`
  font-size: 15px; /* slightly smaller section title */
  font-weight: 600;
  color: #1f2937;
  margin: 16px 0 8px;
`;

const Paragraph = styled.p`
  margin: 8px 0;
  font-size: 14px; /* smaller paragraph text */
`;

const List = styled.ul`
  margin: 8px 0 8px 18px;
  list-style: disc;
  font-size: 14px; /* smaller list text */
`;

const Updated = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
`;

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const updatedDate = new Date().toISOString().slice(0, 10);

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </BackButton>
        <Title>Privacy Policy</Title>
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
        <SectionTitle>Introduction</SectionTitle>
        <Paragraph>
          This Privacy Policy is provided for demonstration purposes only. It explains, in English, how information may be collected, used, shared, and protected within this demo application. It does not constitute a binding legal agreement or an undertaking for any production service.
        </Paragraph>

        <SectionTitle>Scope</SectionTitle>
        <Paragraph>
          This Policy applies to your interactions across the features available in the demo, including registration and sign-in, document upload, form completion, risk analysis, and file downloads.
        </Paragraph>

        <SectionTitle>Definitions</SectionTitle>
        <List>
          <li><strong>"Personal Data"</strong> means any information that relates to an identified or identifiable individual, such as name and email.</li>
          <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, storage, use, and disclosure.</li>
          <li><strong>"Demo Application"</strong> refers to this non-production environment intended for testing and demonstration.</li>
        </List>

        <SectionTitle>Information We Collect</SectionTitle>
        <List>
          <li><strong>Account Details</strong>: full name, email address, phone number, date of birth, and gender.</li>
          <li><strong>Uploaded Content</strong>: documents and fields provided during the upload and form workflow (for demo purposes).</li>
          <li><strong>Device and Usage Data</strong>: browser type, pages visited, actions taken, and diagnostics (to improve user experience).</li>
          <li><strong>Cookies and Local Storage</strong>: used to maintain session state and preferences (e.g., notification toggle).</li>
        </List>

        <SectionTitle>How We Use Information</SectionTitle>
        <List>
          <li><strong>Provide and Improve Features</strong>: render pages, perform form workflows, and show risk analysis results in a demo context.</li>
          <li><strong>Security and Integrity</strong>: basic checks and error diagnostics, aiming to maintain a stable demo experience.</li>
          <li><strong>Communications</strong>: send important updates and notifications where applicable (simulated).</li>
          <li><strong>Analytics</strong>: aggregated evaluations of feature usage to refine the demo’s usability.</li>
        </List>

        <SectionTitle>Legal Bases (where applicable)</SectionTitle>
        <Paragraph>
          In jurisdictions requiring a legal basis for processing, we rely on legitimate interests to provide and improve the demo, and on consent for optional features such as notifications or analytics.
        </Paragraph>

        <SectionTitle>Sharing and Disclosure</SectionTitle>
        <Paragraph>
          We do not sell Personal Data. We may share information only in limited scenarios:
        </Paragraph>
        <List>
          <li><strong>Service Providers</strong>: technical infrastructure that enables page builds, hosting, and diagnostics (demo environment).</li>
          <li><strong>Legal Requirements</strong>: disclosures mandated by applicable law, regulation, or judicial process (simulated).
          </li>
        </List>

        <SectionTitle>Cookies and Local Storage</SectionTitle>
        <Paragraph>
          This demo uses local storage and may use cookies to preserve your session, preferences (e.g., notifications), and certain UI states. You may clear these by resetting your browser data.
        </Paragraph>

        <SectionTitle>Data Retention</SectionTitle>
        <Paragraph>
          Data is stored in your browser’s local storage. You can remove it at any time by logging out or clearing your browser data. No persistent server-side storage is used for demo-only flows unless explicitly stated.
        </Paragraph>

        <SectionTitle>Your Rights</SectionTitle>
        <List>
          <li><strong>Access and Rectification</strong>: review and edit your profile details within the “Profile” page (email remains aligned with your login/registration).</li>
          <li><strong>Deletion</strong>: clear browser data or use the app’s reset/logout functions to remove local data.</li>
          <li><strong>Withdraw Consent</strong>: disable optional features, such as notifications, at any time (simulated).</li>
        </List>

        <SectionTitle>International Transfers</SectionTitle>
        <Paragraph>
          The demo infrastructure may involve servers or content delivery networks across regions. We aim to apply reasonable safeguards within the constraints of a non-production environment.
        </Paragraph>

        <SectionTitle>Security</SectionTitle>
        <Paragraph>
          We implement reasonable technical and organizational measures to protect information in transit and at rest within the demo scope. However, no system is completely secure, and this environment is not intended for production use.
        </Paragraph>

        <SectionTitle>Children’s Privacy</SectionTitle>
        <Paragraph>
          The demo is not directed to children under the age of 13. If we become aware of data from a child, we will take reasonable steps to delete it.
        </Paragraph>

        <SectionTitle>Changes to This Policy</SectionTitle>
        <Paragraph>
          We may update this Privacy Policy to reflect changes to features or workflows. Any updates will be displayed on this page.
        </Paragraph>

        <SectionTitle>Contact Us</SectionTitle>
        <Paragraph>
          For questions or feedback regarding this Privacy Policy, please use the contact methods provided within the demo application (simulated).
        </Paragraph>

        <Updated>Last updated: {updatedDate}</Updated>
      </Content>
    </Container>
  );
};

export default PrivacyPolicyPage;