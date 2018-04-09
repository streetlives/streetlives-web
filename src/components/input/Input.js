import React, { Component } from "react";
import cx from "classnames";
import "./Input.css";

class Input extends Component {
  render() {
    const { type = "text", fluid, placeholder } = this.props;
    const classNames = cx("Input", {
      "Input-fluid": fluid,
    });

    return <input className={classNames} type={type} placeholder={placeholder} />;
  }
}

export default Input;
