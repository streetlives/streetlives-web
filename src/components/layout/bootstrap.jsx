import React from "react";

export const Grid = (props) => (
  <div className="container-fluid">
    {props.children}
  </div>
)

export const Row = (props) => (
  <div className="row">
    {props.children}
  </div>
)

export const Col = (props) => (
  <div className={`col-sm-12 col-md-8 offset-md-2 ${props.customClasses ? props.customClasses : ''}`}>
    {props.children}
  </div>
)
