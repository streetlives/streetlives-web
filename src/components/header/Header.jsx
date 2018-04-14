import React from "react";
import cx from "classnames";
import "./Header.css";

function Header({ children, size, className}) {
  const classNames = cx("Header", className, {
    "Header-large": size === "large",
    "Header-medium": size === "medium",
    "Header-small": size === "small",
  });

  return <h1 className={classNames}>{children}</h1>;
}

export default Header;
