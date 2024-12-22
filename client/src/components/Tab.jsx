import React from 'react';
import { useSnapshot } from 'valtio';

import state from '../store';

const Tab = ({ tab, isFilterTab, isActiveTab, handleClick }) => {
  const snap = useSnapshot(state);

  // Kiểu động dựa trên trạng thái active
  const activeStyle = isFilterTab && isActiveTab
    ? { backgroundColor: snap.color || '#d1d5db', opacity: 0.8 }
    : { backgroundColor: 'transparent', opacity: 1 };

  return (
    <div
      key={tab.name}
      className={`tab-btn ${isFilterTab ? 'rounded-full glassmorphism' : 'rounded-lg'} ${
        isActiveTab ? 'active-tab' : ''
      }`}
      style={activeStyle} // Sử dụng kiểu động
      onClick={handleClick}
    >
      <img
        src={tab.icon}
        alt={tab.name}
        className={`${isFilterTab ? 'w-2/3 h-2/3' : 'w-11/12 h-11/12 object-contain'}`}
      />
    </div>
  );
};

export default Tab;
