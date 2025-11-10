import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search, Eye, MessageSquare, BarChart3, LogIn } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import StatusTime from '../components/StatusTime';

const Container = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  padding-bottom: 80px;
`;

const Header = styled.div`
  background: white;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  border-bottom: 1px solid #dbeafe;
  position: relative;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1e3a8a;
  text-align: center;
  justify-self: center;
  grid-column: 2;
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #3b82f6;
  grid-column: 3;
  justify-self: end;
`;

const LogoutButton = styled.button`
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  grid-column: 1;
  justify-self: start;
  
  &:hover {
    background: #1e40af;
  }
`;

const SearchContainer = styled.div`
  padding: 16px;
  background: white;
  margin-bottom: 16px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 12px;
  gap: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  color: #1e3a8a;
  
  &::placeholder {
    color: #93c5fd;
  }
`;

const BankCard = styled.div`
  margin: 0 16px 16px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  position: relative;
  overflow: hidden;
`;

const BankCardBackground = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/><circle cx="350" cy="50" r="30" fill="rgba(255,255,255,0.1)"/><circle cx="320" cy="150" r="20" fill="rgba(255,255,255,0.05)"/></svg>') no-repeat;
  background-size: cover;
`;

const BankLogo = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  color: #1e40af;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const BankTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`;

const initialRates = [
  { currency: 'USD', buy: '7.2513', sell: '7.2781' },
  { currency: 'EUR', buy: '8.0134', sell: '8.0452' },
  { currency: 'JPY', buy: '0.0465', sell: '0.0471' },
  { currency: 'HKD', buy: '0.9285', sell: '0.9312' },
];

const ExchangeTable = styled.div`
  background: white;
  border-radius: 8px;
  margin: 0 16px 16px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 12px 16px;
  background: #eff6ff;
  border-bottom: 1px solid #dbeafe;
`;

const TableHeaderCell = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0b2a6e;
  text-align: ${props => props.align || 'left'};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 12px 16px;
  border-bottom: 1px solid #e0eaff;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  font-size: 14px;
  color: #0b2a6e;
  text-align: ${props => props.align || 'left'};
  font-weight: ${props => props.bold ? '600' : '400'};
`;

const LastUpdated = styled.div`
  position: absolute;
  right: 16px;
  bottom: 12px;
  font-size: 12px;
  color: #9ca3af;
  opacity: 0.8;
`;

const NewsSection = styled.div`
  margin: 0 16px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #0b2a6e;
  margin-bottom: 12px;
`;

const NewsItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
`;

const NewsImage = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.color || '#dbeafe'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NewsContent = styled.div`
  flex: 1;
`;

const NewsTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #0b2a6e;
  margin-bottom: 4px;
  line-height: 1.4;
`;

const NewsSource = styled.div`
  font-size: 12px;
  color: #3b82f6;
  margin-bottom: 8px;
`;

const NewsStats = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #3b82f6;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [exchangeRates, setExchangeRates] = useState(initialRates);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [newsItems, setNewsItems] = useState([
    {
      title: 'Financial Times Markets',
      source: 'Financial Times',
      views: 1200,
      comments: '48',
      color: '#dbeafe',
      url: 'https://www.ft.com/markets'
    },
    {
      title: 'Bloomberg Billionaires Index',
      source: 'Bloomberg',
      views: 890,
      comments: '23',
      color: '#e0e7ff',
      url: 'https://www.bloomberg.com/billionaires/'
    },
    {
      title: 'SCMP Business News',
      source: 'South China Morning Post',
      views: 750,
      comments: '15',
      color: '#dbeafe',
      url: 'https://www.scmp.com/business'
    },
    {
      title: 'ECB Press Releases',
      source: 'European Central Bank',
      views: 640,
      comments: '8',
      color: '#e0e7ff',
      url: 'https://www.ecb.europa.eu/press/pubbydate/html/index.en.html'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateRates = () => {
      setExchangeRates(prevRates =>
        prevRates.map(rate => {
          const change = (Math.random() - 0.5) * 0.01;
          const newBuy = (parseFloat(rate.buy) + change).toFixed(4);
          const newSell = (parseFloat(rate.sell) + change).toFixed(4);
          return { ...rate, buy: newBuy, sell: newSell };
        })
      );
    };

    const timer = setInterval(updateRates, 3600000); // Update every hour

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewsClick = (index) => {
    const newNewsItems = [...newsItems];
    newNewsItems[index].views += 1;
    setNewsItems(newNewsItems);
    window.open(newNewsItems[index].url, '_blank');
  };

  const formatDateTime = (d) => {
    const date = new Date(d);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const get = (type) => parts.find(p => p.type === type)?.value;
    const y = get('year');
    const m = get('month');
    const day = get('day');
    const h = get('hour');
    const min = get('minute');
    const s = get('second');
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
  };

  return (
    <Container>
      <Header>
        <LogoutButton onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </LogoutButton>
        <Title>Welcome, {user ? (user.fullName || user.email) : 'Guest'}</Title>
        <StatusBar>
          <StatusTime />
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ width: '4px', height: '4px', background: '#1e3a8a', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', background: '#1e3a8a', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', background: '#1e3a8a', borderRadius: '50%' }}></div>
          </div>
        </StatusBar>
      </Header>
      {/* 页面主体 */}
      <SearchContainer>
        <SearchBox>
          <Search size={20} color="#1e3a8a" />
          <SearchInput placeholder="Search for anything..." />
        </SearchBox>
      </SearchContainer>

      <BankCard>
        <BankCardBackground />
        <BankLogo>Standard Chartered Bank</BankLogo>
        <BankTitle>Real-time Exchange Rates (Base: CNY)</BankTitle>
        <ExchangeTable>
          <TableHeader>
            <TableHeaderCell>Currency</TableHeaderCell>
            <TableHeaderCell align="right">Buy</TableHeaderCell>
            <TableHeaderCell align="right">Sell</TableHeaderCell>
          </TableHeader>
          <div>
            {exchangeRates.map(rate => (
              <TableRow key={rate.currency}>
                <TableCell bold>{rate.currency}</TableCell>
                <TableCell align="right">{rate.buy}</TableCell>
                <TableCell align="right">{rate.sell}</TableCell>
              </TableRow>
            ))}
          </div>
        </ExchangeTable>
        <LastUpdated>Beijing Time: {formatDateTime(lastUpdated)}</LastUpdated>
      </BankCard>

      <NewsSection>
        <SectionTitle>FxFill News</SectionTitle>
        {newsItems.map((item, index) => (
          <NewsItem key={index} onClick={() => handleNewsClick(index)} style={{ cursor: 'pointer' }}>
            <NewsImage color={item.color}>
              <BarChart3 size={24} color="#1e3a8a" />
            </NewsImage>
            <NewsContent>
              <NewsTitle>{item.title}</NewsTitle>
              <NewsSource>{item.source}</NewsSource>
              <NewsStats>
                <StatItem>
                  <Eye size={14} color="#1e3a8a" />
                  <span>{item.views}</span>
                </StatItem>
                <StatItem>
                  <MessageSquare size={14} color="#1e3a8a" />
                  <span>{item.comments}</span>
                </StatItem>
              </NewsStats>
            </NewsContent>
          </NewsItem>
        ))}
      </NewsSection>

      <BottomNavigation />
    </Container>
  );
};

export default HomePage;