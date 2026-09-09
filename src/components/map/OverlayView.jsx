import React from 'react';
import ReactDOM from 'react-dom';
import { OverlayView } from 'react-google-maps';
import { OVERLAY_VIEW } from 'react-google-maps/lib/constants';

export default class CustomOverlayView extends OverlayView {
  // Override draw function to catch errors with map panes being undefined to prevent console errors
  // See: https://github.com/tomchentw/react-google-maps/issues/482
  //
  // Google Maps calls draw() on every frame while the map is being panned or zoomed. The base
  // implementation re-renders the React subtree and re-appends the container on every one of those
  // calls, which makes dragging the map crawl once there are more than a handful of markers. Only
  // the pixel position actually changes per frame, so re-render the subtree only when the children
  // change and just reposition the container otherwise.
  onAdd() {
    super.onAdd();
    this.renderedChildren = null;
  }

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

  onRemove() {
    this.renderedChildren = null;
    super.onRemove();
  }
}
