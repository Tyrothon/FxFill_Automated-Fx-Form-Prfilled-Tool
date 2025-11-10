import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Home, Upload, User } from 'lucide-react';

const NavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  z-index: 1000;
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  color: ${props => props.active ? '#6366f1' : '#9ca3af'};
  
  &:hover {
    color: #6366f1;
  }
`;

const NavText = styled.span`
  font-size: 12px;
  margin-top: 4px;
  font-weight: ${props => props.active ? '600' : '400'};
`;

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 不显示底部导航栏的页面
  const hiddenPages = ['/login', '/register'];
  
  // 如果当前页面在隐藏列表中，不渲染导航栏
  if (hiddenPages.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <NavContainer>
      {navItems.map(({ path, icon: Icon, label }) => (
        <NavItem
          key={path}
          active={location.pathname === path}
          onClick={() => navigate(path)}
        >
          <Icon size={24} />
          <NavText active={location.pathname === path}>{label}</NavText>
        </NavItem>
      ))}
    </NavContainer>
  );
};

export default BottomNavigation;