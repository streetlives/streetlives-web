import React, { Component } from "react";
import cx from "classnames";
import "./Input.css";

class Input extends Component {
  render() {
    const { type = "text", fluid, placeholder, name, onChange } = this.props;
    const classNames = cx("Input", {
      "Input-fluid": fluid,
    });

    return <input
      className={classNames}
      type={type}
      placeholder={placeholder}
      name={name}
      onChange={onChange}
      />;
  }
}

export default Input;
