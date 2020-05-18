import React from 'react';
import './Testimonial.css';

const Testimonial = ({ name, img, text }) => (
  <div className="Testimonial">
    <img src={img} className="Testimonial-image" alt={`${name}'s face`} />
    <div className="Testimonial-separator" />

    <div className="Testimonial-text">“{text}”</div>
    <div className="Testimonial-name">– {name}</div>
  </div>
);

export default Testimonial;
