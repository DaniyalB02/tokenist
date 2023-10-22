import React from 'react';
import mainImage from './assets/mainImage.png';
import NavBar from './NavBar';
import './LandingPage.css';

function LandingPage({ setView }) {
    return (
        <div className="landing-bg">
            <NavBar setView={setView} /> {/* Pass down the setView prop to NavBar */}
            <div className="landing-content">
                <div className="text-section">
                    <h1>Tokenomics,</h1>
                    <h1>Simplified and</h1>
                    <h1>Enhance</h1>
                    <h3>A Tool Focused on Simplifying Complex Tokenomics Modelling and Simulating</h3>
                    <button className="discover-more-btn" onClick={() => setView('paintApp')}>Discover More →</button>
                </div>
                <div className="main-image">
                    <img src={mainImage} alt="Diagram depicting tokenomics" />
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
