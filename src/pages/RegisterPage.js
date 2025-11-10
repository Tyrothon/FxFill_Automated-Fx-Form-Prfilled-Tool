import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Phone, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 24px;
  font-weight: 700;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  color: #1f2937;
  background: white;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  color: #1f2937;
  background: white;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #9ca3af;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #6b7280;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const Checkbox = styled.input`
  margin-top: 2px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
  
  a {
    color: #6366f1;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const RegisterButton = styled.button`
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
  transition: background 0.2s;
  
  &:hover {
    background: #5856eb;
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }
  
  span {
    padding: 0 16px;
    font-size: 14px;
    color: #6b7280;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  
  a {
    color: #6366f1;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const RegisterPage = () => {
  const { login, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 简单校验：密码一致
    if (formData.password !== formData.confirmPassword) {
      setIsLoading(false);
      alert('Passwords do not match.');
      return;
    }

    // 保存注册信息到全局用户资料（邮箱、姓名、电话、生日、性别）
    const profile = {
      email: formData.email,
      fullName: formData.fullName,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      avatarUrl: '',
      notifications: true,
    };

    // 模拟注册过程
    setTimeout(() => {
      updateProfile(profile);
      setIsLoading(false);
      login(formData.email);
      navigate('/');
    }, 1500);
  };

  return (
    <Container>
      <RegisterCard>
        <Header>
          <BackButton onClick={() => navigate('/login')}>
            <ArrowLeft size={24} />
          </BackButton>
          <Logo>GF</Logo>
          <Title>Create Account</Title>
          <Subtitle>Join GlobalForex today</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputLabel>Full Name</InputLabel>
            <InputWrapper>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <Input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel>Email Address</InputLabel>
            <InputWrapper>
              <InputIcon>
                <Mail size={20} />
              </InputIcon>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel>Phone Number</InputLabel>
            <InputWrapper>
              <InputIcon>
                <Phone size={20} />
              </InputIcon>
              <Input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel>Date of Birth</InputLabel>
            <InputWrapper>
              <InputIcon>
                <Calendar size={20} />
              </InputIcon>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel>Gender</InputLabel>
            <InputWrapper>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel>Password</InputLabel>
            <InputWrapper>
              <InputIcon>
                <Lock size={20} />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel>Confirm Password</InputLabel>
            <InputWrapper>
              <InputIcon>
                <Lock size={20} />
              </InputIcon>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              required
            />
            <CheckboxLabel>
              I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
            </CheckboxLabel>
          </CheckboxGroup>

          <RegisterButton type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
            {!isLoading && <ArrowRight size={20} />}
          </RegisterButton>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <LoginLink>
          Already have an account? <a href="#" onClick={() => navigate('/login')}>Sign in</a>
        </LoginLink>
      </RegisterCard>
    </Container>
  );
};

export default RegisterPage;