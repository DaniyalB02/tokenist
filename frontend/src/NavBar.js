import React from 'react';
import logo from './assets/logo.png';
import './NavBar.css';

function NavBar({ setView }) {
    return (
      <div className="navbar">
        <img src={logo} alt='The Tokenist Logo' className="navbar-logo" />
        
        <div className="button-container">
            <button className="subscribe-btn navbar-subscribe-btn" onClick={() => window.location.href='https://thetokenist.substack.com/?utm_source=substack&utm_medium=web&utm_campaign=substack_profile'}>
                Subscribe → 
            </button>

            <button className="try-free-btn" onClick={() => setView('paintApp')}>Try Tokenist Free →</button>
        </div>
      </div>
    );
}



export default NavBar;
