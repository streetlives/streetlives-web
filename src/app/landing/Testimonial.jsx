import React from 'react';
import PropTypes from 'prop-types';
import './Testimonial.css';

const Testimonial = ({ imagePartialPath, name, text }) => (
  <div className="Testimonial">
    <picture>
      {/* desktop jpg */}
      <source
        media="(min-width: 1224px)"
        srcSet={`/img/landing_page/${imagePartialPath}_desktop1x.jpg`}
        type="image/jpeg"
      />
      {/* desktop webp */}
      <source
        media="(min-width: 1224px)"
        srcSet={`/img/landing_page/${imagePartialPath}_desktop1x.webp`}
        type="image/webp"
      />
      {/* mobile jpg */}
      <source
        srcSet={`/img/landing_page/${imagePartialPath}_mobile2x.jpg`}
        type="image/jpeg"
      />
      {/* mobile webp */}
      <source
        srcSet={`/img/landing_page/${imagePartialPath}_mobile2x.webp`}
        type="image/webp"
      />
      <img
        className="Testimonial-image"
        src={`/img/landing_page/${imagePartialPath}_mobile2x.jpg`}
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
