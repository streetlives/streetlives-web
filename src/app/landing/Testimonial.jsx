import React from 'react';
import PropTypes from 'prop-types';
import './Testimonial.css';

const Testimonial = ({ name, img, text }) => (
  <div className="Testimonial">
    <picture>
      <source
        className="Testimonial-image"
        media="(min-aspect-ratio: 2/3)"
        srcSet={img.large}
        alt={`${name}'s face`}
      />
      <img
        className="Testimonial-image"
        src={img.small}
        alt={`${name}'s face`}
      />
    </picture>
    <div className="Testimonial-separator" />
    <div className="Testimonial-text">“{text}”</div>
    <div className="Testimonial-name">– {name}</div>
  </div>
);

Testimonial.propTypes = {
  name: PropTypes.string.isRequired,
  img: PropTypes.shape({
    small: PropTypes.string,
    large: PropTypes.string,
  }),
  text: PropTypes.string.isRequired,
};

export default Testimonial;
