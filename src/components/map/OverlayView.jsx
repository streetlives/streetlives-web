import React from 'react';
import ReactDOM from 'react-dom';
import { OverlayView } from 'react-google-maps';
import { OVERLAY_VIEW } from 'react-google-maps/lib/constants';

export default class CustomOverlayView extends OverlayView {
  // Override draw function to catch errors with map panes being undefined to prevent console errors
  // See: https://github.com/tomchentw/react-google-maps/issues/482#issuecomment-348026200
  draw() {
    const { mapPaneName } = this.props;
    const mapPanes = this.state[OVERLAY_VIEW].getPanes();

    // Ensure panes and container exist before drawing
    if (!mapPanes || !this.containerElement) return;

    mapPanes[mapPaneName].appendChild(this.containerElement);

    ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      React.Children.only(this.props.children),
      this.containerElement,
      this.onPositionElement,
    );
  }
}
