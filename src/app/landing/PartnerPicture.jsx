import React from 'react';
import PropTypes from 'prop-types';
import './PartnerPicture.css';

const PartnerPicture = ({ img, alt = '', link }) => (
  <div className="PartnerPicture">
    <a href={link}>
      <picture>
        <source
          className="OnboardingImage"
          media="(min-aspect-ratio: 2/3)"
          srcSet={img.large}
        />
        <img
          className="OnboardingImage"
          src={img.small}
          alt={alt}
        />
      </picture>
    </a>
  </div>
);

PartnerPicture.propTypes = {
  img: PropTypes.shape({
    small: PropTypes.string,
    large: PropTypes.string,
  }),
  alt: PropTypes.string,
  link: PropTypes.string.isRequired,
};

export default PartnerPicture;
