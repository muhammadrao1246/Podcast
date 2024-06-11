import React from 'react'
import ReactDOM from 'react-dom/client'
import App from 'src/App.jsx'

import { BrowserRouter } from 'react-router-dom';
import { store } from 'src/services/store'
import { Provider } from 'react-redux'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
