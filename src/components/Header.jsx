// Header.jsx
// This is a React component for the X1 EcoChain landing page header.
// Extracted from the current index.html for modularization and maintainability.

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export default function Header() {
    return (
        <header className="Header" role="banner">
            <a href="/" tabIndex={0} aria-label="Home">
                <img alt="Logo" loading="lazy" className="Logo" src="./assets/site-logo.svg" />
            </a>
            <nav className="MidHeader" aria-label="Main Navigation">
                <ul style={{ display: 'flex', alignItems: 'center', gap: '2vw', margin: 0, padding: 0, listStyle: 'none' }}>
                    <li className="HeaderLink"><a href="http://nodesale.x1ecochain.com/" target="_blank" rel="noopener noreferrer" className="HeaderATag">X1Node Sale</a></li>
                    <li className="HeaderLink"><a href="https://grant.x1ecochain.com/" target="_blank" rel="noopener noreferrer" className="HeaderATag">Grant Program $5M</a></li>
                    <li className="HeaderLink"><a href="https://ecosystem.x1ecochain.com/" target="_blank" rel="noopener noreferrer" className="HeaderATag">Ecosystem</a></li>
                    <li className="HeaderLink"><a href="https://maculatus-scan.x1eco.com/" target="_blank" rel="noopener noreferrer" className="HeaderATag">X1ECO Scan</a></li>
                    <li className="HeaderLink"><a href="https://dev.x1ecochain.com/" target="_blank" rel="noopener noreferrer" className="HeaderATag">Build</a></li>
                    <li className="HeaderLink"><a href="https://medium.com/@X1_EcoChain" target="_blank" rel="noopener noreferrer" className="HeaderATag">Blog</a></li>
                </ul>
            </nav>
            <div className="RightHeader">
                <ConnectButton />
            </div>
        </header>
    );
}
