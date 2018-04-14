import React from "react";

function NavBar({ title }) {
  return (
    <div style={{ backgroundColor: "#333333" }} className="text-white">
      <div className="container">
        <div className="row d-flex justify-content-between align-items-center p-2">
          <a style={{ fontSize: "14px" }} className="font-weight-light">
            Back
          </a>
          <span style={{ fontSize: "18px" }} className="font-weight-bold m-0">
            {title}
          </span>
          <a style={{ fontSize: "14px" }} className="font-weight-light">
            Close
          </a>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
