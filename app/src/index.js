import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';

import 'antd/dist/antd.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-virtualized/styles.css';
import 'react-infinite-calendar/styles.css';
import 'rodal/lib/rodal.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { initializeFirebase , askForPermissioToReceiveNotifications } from './push-notification';

render(
    <App />,
    document.getElementById('root')
);

initializeFirebase();
askForPermissioToReceiveNotifications();
