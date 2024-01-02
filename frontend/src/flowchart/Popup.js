import React from 'react';

const Popup = ({ onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#043873', // Change the background color to the desired blue
        color: '#fff', // Change the text color to white
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
      }}
    >
      <h2>Thank you for trying out the Tokenist!</h2>
      <p>We want to remind you that this is the first iteration of the platform, and it will get better.</p>

      <h3>How it works:</h3>
      <ul>
        <li>Assume different players in the market as circles and nodes.</li>
        <li>When you click on them, you can give them a balance.</li>
        <li>If you click and drag between two circles, you can add an edge. This gives a probability of two nodes "transacting" with each other.</li>
        <li>Run the simulation once you've created your micro-market!</li>
        <li>KEY INFO: To add an edge between two nodes, HOLD shift, highlight two circles and an "add edge" button may appear</li>
      </ul>

      <h3>The output:</h3>
      <p>What you will get is a simulation of your market playing out 500 times. If two players transact, Player A will give 10% of his balance to Player B.</p>

      <p>P.S. Highlighting circles and edges are a bit buggy right now, so apologies if you have to tap several times.</p>

      <button
        onClick={onClose}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#4F9CF9',
          color: '#fff',
          borderRadius: '5px',
          fontFamily: 'Inter',
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    </div>
  );
};

export default Popup;
