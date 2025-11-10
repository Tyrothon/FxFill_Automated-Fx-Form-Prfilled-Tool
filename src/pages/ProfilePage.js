import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, User, Mail, Phone, Calendar, Globe, Bell, Shield, ChevronRight, LogOut } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import StatusTime from '../components/StatusTime';
import { useAuth } from '../context/AuthContext';

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

const ProfileSection = styled.div`
  background: white;
  padding: 24px 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const UserEmail = styled.p`
  font-size: 14px;
  color: #6b7280;
`;

const UploadButton = styled.button`
  margin-top: 12px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  &:hover { background: #f9fafb; }
`;

const InfoSection = styled.div`
  background: white;
  margin-bottom: 16px;
  border-radius: 8px;
  margin: 0 16px 16px;
  overflow: hidden;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #6b7280;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
`;

const SettingsSection = styled.div`
  background: white;
  margin: 0 16px 16px;
  border-radius: 8px;
  overflow: hidden;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f9fafb;
  }
`;

const SettingIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #6b7280;
`;

const SettingContent = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
`;

const ToggleSwitch = styled.div`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: ${props => props.active ? '#6366f1' : '#d1d5db'};
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s;
  }
`;

const EditForm = styled.div`
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FieldLabel = styled.label`
  width: 120px;
  font-size: 12px;
  color: #6b7280;
`;

const FieldInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  &:focus { outline: none; border-color: #6366f1; }
`;

const FieldSelect = styled.select`
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  &:focus { outline: none; border-color: #6366f1; }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 16px 16px;
`;

const SaveButton = styled.button`
  padding: 10px 16px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  &:hover { background: #5856eb; }
`;

const EditButton = styled.button`
  padding: 8px 12px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 8px;
  &:hover { background: #e5e7eb; }
`;

const LogoutButton = styled.button`
  width: calc(100% - 32px);
  margin: 0 16px 16px;
  padding: 16px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, setAvatar, setNotifications, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    gender: user.gender || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // 邮箱必须与登录/注册信息一致：禁改或不一致则提示
    if (form.email !== user.email) {
      alert('Email must match your login/registration email.');
      setForm(prev => ({ ...prev, email: user.email || '' }));
      return;
    }
    updateProfile({
      fullName: form.fullName,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
    });
    setEditMode(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatar(String(dataUrl));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </BackButton>
        <Title>My Profile</Title>
        <StatusBar>
          <StatusTime />
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
          </div>
        </StatusBar>
      </Header>

      <ProfileSection>
        <Avatar>
          <AvatarImage 
            src={user.avatarUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='15' fill='white'/%3E%3Cpath d='M20 80 Q20 65 35 65 h30 Q80 65 80 80' fill='white'/%3E%3C/svg%3E"}
            alt="Profile"
          />
        </Avatar>
        <UserName>{user.fullName || 'Your Name'}</UserName>
        <UserEmail>{user.email || 'your@email.com'}</UserEmail>
        <UploadButton onClick={() => document.getElementById('avatarUpload')?.click()}>Change Avatar</UploadButton>
        <input id="avatarUpload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        <EditButton onClick={() => setEditMode(v => !v)}>{editMode ? 'Cancel' : 'Edit Profile'}</EditButton>
      </ProfileSection>

      <InfoSection>
        <SectionTitle>Personal Information</SectionTitle>
        {!editMode && (
          <>
            <InfoItem>
              <InfoIcon><User size={20} /></InfoIcon>
              <InfoContent>
                <InfoLabel>Full Name</InfoLabel>
                <InfoValue>{user.fullName || '-'}</InfoValue>
              </InfoContent>
            </InfoItem>
            <InfoItem>
              <InfoIcon><Mail size={20} /></InfoIcon>
              <InfoContent>
                <InfoLabel>Email Address</InfoLabel>
                <InfoValue>{user.email || '-'}</InfoValue>
              </InfoContent>
            </InfoItem>
            <InfoItem>
              <InfoIcon><Phone size={20} /></InfoIcon>
              <InfoContent>
                <InfoLabel>Phone Number</InfoLabel>
                <InfoValue>{user.phone || '-'}</InfoValue>
              </InfoContent>
            </InfoItem>
            <InfoItem>
              <InfoIcon><Calendar size={20} /></InfoIcon>
              <InfoContent>
                <InfoLabel>Date of Birth</InfoLabel>
                <InfoValue>{user.dateOfBirth || '-'}</InfoValue>
              </InfoContent>
            </InfoItem>
            <InfoItem>
              <InfoIcon><Globe size={20} /></InfoIcon>
              <InfoContent>
                <InfoLabel>Gender</InfoLabel>
                <InfoValue>{user.gender || '-'}</InfoValue>
              </InfoContent>
            </InfoItem>
          </>
        )}
        {editMode && (
          <EditForm>
            <FieldRow>
              <FieldLabel>Full Name</FieldLabel>
              <FieldInput name="fullName" value={form.fullName} onChange={handleInputChange} placeholder="Enter your full name" />
            </FieldRow>
            <FieldRow>
              <FieldLabel>Email Address</FieldLabel>
              <FieldInput type="email" name="email" value={form.email} onChange={handleInputChange} disabled />
            </FieldRow>
            <FieldRow>
              <FieldLabel>Phone Number</FieldLabel>
              <FieldInput name="phone" value={form.phone} onChange={handleInputChange} placeholder="Enter your phone number" />
            </FieldRow>
            <FieldRow>
              <FieldLabel>Date of Birth</FieldLabel>
              <FieldInput type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleInputChange} />
            </FieldRow>
            <FieldRow>
              <FieldLabel>Gender</FieldLabel>
              <FieldSelect name="gender" value={form.gender} onChange={handleInputChange}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </FieldSelect>
            </FieldRow>
            <ActionsRow>
              <SaveButton onClick={handleSave}>Save</SaveButton>
            </ActionsRow>
          </EditForm>
        )}
      </InfoSection>

      <SettingsSection>
        <SectionTitle>Settings</SectionTitle>
        <SettingItem>
          <SettingIcon>
            <Bell size={20} />
          </SettingIcon>
          <SettingContent>
            <SettingLabel>Notifications</SettingLabel>
          </SettingContent>
          <ToggleSwitch active={!!user.notifications} onClick={() => setNotifications(!user.notifications)} />
        </SettingItem>
        <SettingItem onClick={() => navigate('/privacy')}>
          <SettingIcon>
            <Shield size={20} />
          </SettingIcon>
          <SettingContent>
            <SettingLabel>Privacy Policy</SettingLabel>
          </SettingContent>
          <ChevronRight size={20} color="#9ca3af" />
        </SettingItem>
      </SettingsSection>

      <LogoutButton onClick={() => { logout(); navigate('/login'); }}>
        <LogOut size={20} />
        Log Out
      </LogoutButton>

      <BottomNavigation />
    </Container>
  );
};

export default ProfilePage;