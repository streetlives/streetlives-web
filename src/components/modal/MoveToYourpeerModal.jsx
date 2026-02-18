import React, { useState } from "react";

/* ---------- Styles ---------- */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "30px 24px",
  borderRadius: '8px',
  position: "relative",
  width: "450px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  maxWidth: "90%",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
};

const headerStyle = {
  borderBottom: "1px solid #eee",
  paddingBottom: "12px",
  position: "relative",
  width: "100%",
  textAlign: "center",
};

const buttonContainerStyle = {
  marginTop: "24px",
  display: "flex",
  justifyContent: "flex-end",
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: '4px',
  border: "none",
  backgroundColor: "#ffd54f",
  color: "#000",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};

function MoveToYourPeerModal({ isOpen = true }) {
  const [open, setOpen] = useState(isOpen);

  const onClose = () => {
    setOpen(false);
  };

  if (!open) return null;

  const handleRedirect = () => {
    window.location.href = "https://yourpeer.nyc"; // change to your actual URL
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "20px",
            cursor: "pointer",
            position: "absolute",
            top: "0",
            right: "0",
            color: "#999",
            padding: 10,
            paddingRight: 20
          }}
        >
          &times;
        </button>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontWeight: 'bold', marginTop: 20 }}>Gogetta Moved to YourPeer</h3>
        </div>

        <div style={{ marginTop: "16px" }}>
          <p style={{fontSize: '16px', color: '#606060'}}>
            See the latest service information on YourPeer, New York City's
            peer-powered resource tool
          </p>
        </div>

        <div style={buttonContainerStyle}>
          <button style={buttonStyle} onClick={handleRedirect}>
            Go to YourPeer
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoveToYourPeerModal;
