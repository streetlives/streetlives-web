import React from "react";

function Badge({ children }) {
  return <small className="p-1 bg-dark text-light rounded text-left">{children}</small>;
}

export default Badge;
