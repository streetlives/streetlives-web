import React from 'react';
import ReactDOM from 'react-dom';
import { OverlayView } from 'react-google-maps';
import { OVERLAY_VIEW } from 'react-google-maps/lib/constants';

export default class CustomOverlayView extends OverlayView {
  // onAdd owns the container element, so it also owns the record of what has been rendered into
  // it - Google calls onAdd again with a fresh container if the overlay is re-added to the map.
  onAdd() {
    super.onAdd();
    this.renderedChildren = null;
  }

  // Overridden for two reasons.
  //
  // Firstly to catch errors with map panes being undefined and prevent console errors.
  // See: https://github.com/tomchentw/react-google-maps/issues/482
  //
  // Secondly for performance. Google Maps calls draw() on every frame while the map is being
  // panned or zoomed, and the base implementation re-renders the whole React subtree and re-appends
  // the container (a DOM move that forces layout) on every one of those calls. With a marker per
  // location that makes dragging the map crawl. Only the pixel position actually changes between
  // frames, so render the subtree just when the children change and reposition otherwise.
  draw() {
    const { mapPaneName } = this.props;
    const mapPanes = this.state[OVERLAY_VIEW].getPanes();

    // Ensure panes and container exist before drawing
    if (!mapPanes || !this.containerElement) return;

    const pane = mapPanes[mapPaneName];
    if (!pane) return;

    if (this.containerElement.parentNode !== pane) {
      pane.appendChild(this.containerElement);
    }

    const children = React.Children.only(this.props.children);
    if (children === this.renderedChildren) {
      this.onPositionElement();
      return;
    }

    this.renderedChildren = children;
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      children,
      this.containerElement,
      this.onPositionElement,
    );
  }
}
