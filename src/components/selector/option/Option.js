import React, { Component } from "react";
import cx from "classnames";
import "./Option.css";

class Option extends Component {
  render() {
    const { active, align, children } = this.props;
    const classNames = cx("Option", {
      "Option-active": active,
      "text-center": align === "center",
    });

    return <div className={classNames}>{children}</div>;
  }
}

export default Option;
