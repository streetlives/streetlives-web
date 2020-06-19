import React from 'react';
import PropTypes from 'prop-types';
import { DESKTOP_BREAKPOINT } from '../../Constants';
import './Testimonial.css';

const Testimonial = ({ imagePartialPath, name, text }) => (
  <div className="Testimonial">
    <picture>
      <source
        media={`(min-width: ${DESKTOP_BREAKPOINT})`}
        srcSet={`/img/landing_page/${imagePartialPath}_desktop1x.webp`}
        type="image/webp"
      />
      <source
        media={`(min-width: ${DESKTOP_BREAKPOINT})`}
        srcSet={`/img/landing_page/${imagePartialPath}_desktop1x.jpg`}
        type="image/jpeg"
      />
      <source
        srcSet={`/img/landing_page/${imagePartialPath}_mobile2x.webp`}
        type="image/webp"
      />
      <source
        srcSet={`/img/landing_page/${imagePartialPath}_mobile2x.jpg`}
        type="image/jpeg"
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
  imagePartialPath: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default Testimonial;
