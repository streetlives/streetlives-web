import React from 'react';
import PropTypes from 'prop-types';
import './Testimonial.css';

const Testimonial = ({ imagePartialPath, name, text }) => (
  <div className="Testimonial">
    <picture>
      <source
        className="Testimonial-image"
        media="(min-width: 1224px)"
        srcSet={`/img/landing_page/${imagePartialPath}.png`}
        alt={`${name}'s face`}
      />
      <img
        className="Testimonial-image"
        src={`/img/landing_page/${imagePartialPath}_mobile.png`}
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
