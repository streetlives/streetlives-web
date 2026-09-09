import React from 'react';
import ReactDOM from 'react-dom';

jest.mock('react-google-maps', () => {
  // eslint-disable-next-line global-require
  const R = require('react');

  class OverlayView extends R.Component {
    constructor(props) {
      super(props);
      this.state = { OVERLAY_VIEW: props.overlayView };
      this.onPositionElement = jest.fn();
    }

    onAdd() {
      this.containerElement = global.document.createElement('div');
    }

    onRemove() {
      this.containerElement.parentNode.removeChild(this.containerElement);
      this.containerElement = null;
    }
  }

  return { OverlayView };
});

jest.mock('react-google-maps/lib/constants', () => ({ OVERLAY_VIEW: 'OVERLAY_VIEW' }));

// eslint-disable-next-line import/first
import CustomOverlayView from './OverlayView';

const makeOverlay = (children) => {
  const pane = document.createElement('div');
  const overlayView = { getPanes: () => ({ overlayMouseTarget: pane }) };
  const instance = new CustomOverlayView({
    overlayView,
    mapPaneName: 'overlayMouseTarget',
    children,
  });

  instance.onAdd();

  return { instance, pane };
};

beforeEach(() => {
  jest.spyOn(ReactDOM, 'unstable_renderSubtreeIntoContainer').mockImplementation(() => {});
});

afterEach(() => {
  ReactDOM.unstable_renderSubtreeIntoContainer.mockRestore();
});

it('renders the subtree into the container on the first draw', () => {
  const { instance, pane } = makeOverlay(<a href="/x">x</a>);

  instance.draw();

  expect(ReactDOM.unstable_renderSubtreeIntoContainer).toHaveBeenCalledTimes(1);
  expect(instance.containerElement.parentNode).toBe(pane);
});

it('only repositions on repeated draws with unchanged children', () => {
  const children = <a href="/x">x</a>;
  const { instance } = makeOverlay(children);

  instance.draw();
  instance.draw();
  instance.draw();

  expect(ReactDOM.unstable_renderSubtreeIntoContainer).toHaveBeenCalledTimes(1);
  expect(instance.onPositionElement).toHaveBeenCalledTimes(2);
});

it('re-renders the subtree when the children change', () => {
  const { instance } = makeOverlay(<a href="/x">x</a>);

  instance.draw();
  instance.props = { ...instance.props, children: <a href="/y">y</a> };
  instance.draw();

  expect(ReactDOM.unstable_renderSubtreeIntoContainer).toHaveBeenCalledTimes(2);
});

it('re-renders into a fresh container after being removed and re-added', () => {
  const children = <a href="/x">x</a>;
  const { instance } = makeOverlay(children);

  instance.draw();
  instance.onRemove();
  instance.onAdd();
  instance.draw();

  expect(ReactDOM.unstable_renderSubtreeIntoContainer).toHaveBeenCalledTimes(2);
});

it('does nothing when the map panes are not ready yet', () => {
  const { instance } = makeOverlay(<a href="/x">x</a>);
  instance.state = { OVERLAY_VIEW: { getPanes: () => null } };

  expect(() => instance.draw()).not.toThrow();
  expect(ReactDOM.unstable_renderSubtreeIntoContainer).not.toHaveBeenCalled();
});
