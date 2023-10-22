import React from 'react';
import './SubscribeSection.css';
import substackIcon from './assets/substackIcon.svg';

function SubscribeSection() {
    return (
        <div className="subscribe-bg">
            <h1>Building Iteratively, With Users In Mind</h1>
            <h3>We are consistently making it better, asking users what they want.</h3>
            <h3>Updates will be shared constantly on our substack, subscribe below and follow the journey.</h3>
            <button className="subscribe-btn" onClick={() => window.location.href='https://thetokenist.substack.com/?utm_source=substack&utm_medium=web&utm_campaign=substack_profile'}>
                <img src={substackIcon} alt="Substack Icon" className="substack-icon" /> 
                Subscribe → 
            </button>
        </div>
    );
}

export default SubscribeSection;
