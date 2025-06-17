// src/components/GridItem/GridItem.jsx
import React from 'react';
import './GridItem.css';

const GridItem = ({ item, onClick }) => {
  return (
    <div className="grid-item-wrapper" onClick={() => onClick(item)}>
      <div className="grid-item-content">
        <div className="item-header">
          {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="item-icon" />}
        </div>
        <h2 className="item-title">{item.title}</h2>
        <p className="item-subtitle">{item.subtitle}</p>
      </div>
      <div className="grid-item-banner">
      </div>
    </div>
  );
};

export default GridItem;