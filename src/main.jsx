import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './store';

function renderMoodleReactApp(props) {
  const rootElement = document.getElementById(props.rootId);
  if(rootElement){
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <div className="configuratore-block">
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>
        </div>
      </React.StrictMode>
    )
  } else {
    console.error(`Elemento radice React con ID '${props.rootId}' non trovato nel DOM.`);
  }
}

export { renderMoodleReactApp };