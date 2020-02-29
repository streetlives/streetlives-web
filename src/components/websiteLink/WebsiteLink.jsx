import React from 'react';
import PropTypes from 'prop-types';

function WebsiteLink({ url, className }) {
  const linkUrl = url.includes('//') ? url : `http://${url}`;
  return (
    <a className={className} href={linkUrl} target="_blank" rel="noopener noreferrer">
      {url}
    </a>
  );
}

WebsiteLink.propTypes = {
  url: PropTypes.string.isRequired,
};

export default WebsiteLink;
