import React from 'react';
import './PartnerPicture.css';

const PartnerPicture = ({ src, alt, link }) => (
  <div className="PartnerPicture">
    <a href={link}>
      <img src={src} alt={alt} />
    </a>
  </div>
);

export default PartnerPicture;
