// YoutubeSection.js

import React from 'react';
import './YoutubeSection.css';

function YoutubeSection() {
    return (
        <div className="youtube-section">
            <div className="youtube-content">
                <div className="youtube-text">
                    <h1>Model With Ease</h1>
                    <h3>Drag and Drop Nodes, Let The Tokenist Do The Rest</h3>
                    <button className="youtube-btn">Let's Go →</button>
                </div>
                <div className="youtube-video">
                    <iframe 
                        width="560" 
                        height="315" 
                        src="https://www.youtube.com/embed/vbQfv5YdDgo" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        </div>
    );
}

export default YoutubeSection;
