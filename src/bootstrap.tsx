import {SharedResultEntry} from './SharedResult';
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '@game-app';
import {PlayerProvider} from './player';
import './style.css';
import './neon-lab.css';
import './community.css';
import './playful-lab.css';
import './mobile.css';
createRoot(document.getElementById('root')!).render(<PlayerProvider><SharedResultEntry><App/></SharedResultEntry></PlayerProvider>);

import './investigation-desk.css';

import './case-closed.css';

import './game-lobby.css';

import './friends.css';


import './casefile.css';


import './themes.css';
