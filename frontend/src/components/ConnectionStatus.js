import React from "react";

function ConnectionStatus({ isConnected }) {
  return (
    <div style={{
      marginTop: 16,
      color: isConnected ? "green" : "red",
      fontWeight: "bold"
    }}>
      {isConnected ? "Connected to server" : "Disconnected from server"}
    </div>
  );
}

export default ConnectionStatus;
