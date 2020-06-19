import React from 'react';
import PropTypes from 'prop-types';
import { DESKTOP_BREAKPOINT } from '../../Constants';
import './PartnerPicture.css';

const PartnerPicture = ({ imagePartialPath, alt = '', link }) => (
  <div className="PartnerPicture">
    <a href={link}>
      <picture>
        <source
          media={`(min-width: ${DESKTOP_BREAKPOINT})`}
          srcSet={`/img/partners/${imagePartialPath}_desktop.webp`}
        />
        <source
          media={`(min-width: ${DESKTOP_BREAKPOINT})`}
          srcSet={`/img/partners/${imagePartialPath}_desktop.jpg`}
        />
        <source srcSet={`/img/partners/${imagePartialPath}_mobile.webp`} />
        <img
          className="OnboardingImage"
          src={`/img/partners/${imagePartialPath}_mobile.jpg`}
          alt={alt}
        />
      </picture>
    </a>
  </div>
);

PartnerPicture.propTypes = {
  imagePartialPath: PropTypes.string.isRequired,
  alt: PropTypes.string,
  link: PropTypes.string.isRequired,
};

export default PartnerPicture;
