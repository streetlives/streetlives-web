import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  /* eslint-disable class-methods-use-this, no-console */
  componentDidCatch(error, errorInfo) {
    console.log('Error rendering components:', error, errorInfo);
    this.setState({ hasError: true });
  }
  /* eslint-enable class-methods-use-this, no-console */

  render() {
    if (this.state.hasError) {
      return <h4 className="d-flex align-items-center h-100">Sorry, something went wrong.</h4>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
