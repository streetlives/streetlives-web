import React, { Component } from "react";
import cx from "classnames";
import "./Button.css";

class Button extends Component {
  render() {
    const { onClick, children, primary, secondary, fluid } = this.props;
    const classNames = cx("Button", {
      "Button-primary": primary,
      "Button-secondary": secondary,
      "Button-fluid": fluid,
    });

    return (
      <button onClick={onClick} className={classNames}>
        {children}
      </button>
    );
  }
}

export default Button;
