import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
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

const ForgotPassword = styled.a`
  font-size: 14px;
  color: #6366f1;
  text-decoration: none;
  text-align: right;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled.button`
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

const SignupLink = styled.div`
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

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 模拟登录过程
    setTimeout(() => {
      setIsLoading(false);
      // 保存登录邮箱到全局用户资料，供 Profile 显示与一致性校验
      login(formData.email);
      navigate('/');
    }, 1500);
  };

  return (
    <Container>
      <LoginCard>
        <Header>
          <Logo>FxFill</Logo>
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to your account</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
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
            <InputLabel>Password</InputLabel>
            <InputWrapper>
              <InputIcon>
                <Lock size={20} />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
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

          <ForgotPassword href="#forgot">
            Forgot your password?
          </ForgotPassword>

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
            {!isLoading && <ArrowRight size={20} />}
          </LoginButton>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <SignupLink>
          Don't have an account? <a href="#" onClick={() => navigate('/register')}>Sign up</a>
        </SignupLink>
      </LoginCard>
    </Container>
  );
};

export default LoginPage;