import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '@game-app';
import {PlayerProvider} from './player';
import './style.css';
import './neon-lab.css';
import './community.css';
createRoot(document.getElementById('root')!).render(<PlayerProvider><App/></PlayerProvider>);
