import React from "react";

function Badge({ children }) {
  return <small className="bg-dark text-light rounded text-left font-weight-light p-1">{children}</small>;
}

export default Badge;
