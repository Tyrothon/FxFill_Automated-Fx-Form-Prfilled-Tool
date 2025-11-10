import React, { useEffect, useState } from 'react';

const StatusTime = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return <span>{`${hours}:${minutes}`}</span>;
};

export default StatusTime;