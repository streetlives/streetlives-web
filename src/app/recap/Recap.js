import React from "react";
import Button from "../../components/button";

function Recap() {
  return (
    <div className="d-flex flex-column">
      <div style={{ backgroundColor: "#333333" }} className="text-white">
        <div className="container">
          <div className="row d-flex justify-content-between align-items-center p-2">
            <a style={{ fontSize: "14px" }} className="font-weight-light">
              Back
            </a>
            <span style={{ fontSize: "18px" }} className="font-weight-bold m-0">
              Recap
            </span>
            <a style={{ fontSize: "14px" }} className="font-weight-light">
              Close
            </a>
          </div>
        </div>
      </div>
      <div
        style={{ backgroundColor: "#525252", flexGrow: 1 }}
        className="text-white text-left font-weight-light"
      >
        <div className="container">
          <div className="row p-4">
            <p>
              The <strong>Streetlives Street Team Tool (SSTT)</strong> is for gathering and
              validating vital information, that people can trust, on programs and resources in NYC.
            </p>
            <p className="mt-2">
              At this time we will mainly be collecting details on places that help the community
              with food and/or shelter, including organization names, contact info, operation hours
              and eligibility.
            </p>
            <p className="mt-2">
              Visiting places in person and carefully checking everything step by step, means we can
              be sure information is good and up to date.
            </p>
          </div>
        </div>
      </div>
      <Button fluid primary>
        Let's Get Started
      </Button>
    </div>
  );
}

export default Recap;
