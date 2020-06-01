import React from 'react';
import PropTypes from 'prop-types';
import './PartnerPicture.css';

const PartnerPicture = ({ imagePartialPath, alt = "", link }) => (
  <div className="PartnerPicture">
    <a href={link}>
      <picture>
        <source
          className="OnboardingImage"
          media="(min-width: 1224px)"
          srcSet={`/img/partners/${imagePartialPath}.png`}
        />
        <img
          className="OnboardingImage"
          src={`/img/partners/${imagePartialPath}_mobile.png`}
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
