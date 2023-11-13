import React, { useState } from 'react';
import LandingPage from './LandingPage';
import YoutubeSection from './YoutubeSection'; 
import SubscribeSection from './SubscribeSection';
import PaintApp from './flowchart/PaintApp';

function App() {
    const [view, setView] = useState('home');

    if (view === 'paintApp') {
        return <PaintApp setView={setView} />;
    }

    return (
        <div className="app">
            <LandingPage setView={setView} />
            <YoutubeSection /> 
            <SubscribeSection />
        </div>
    );
}

export default App;
