import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './store';
import { HashRouter } from 'react-router-dom'

function renderMoodleReactApp(props) {
  const rootElement = document.getElementById(props.rootId);
  if(rootElement){
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <div className="configuratore-block">
          <Provider store={store}>
            <HashRouter>
              {/* Passa sesskey e wwwroot anche ad App se ti servono */}
              <App sesskey={props.sesskey} wwwroot={props.wwwroot} />
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

// --- MODIFICA QUI: leggi parametri dalla querystring ---
if (document.getElementById('root')) {
  const urlParams = new URLSearchParams(window.location.search);
  const sesskey = urlParams.get('sesskey');
  const wwwroot = urlParams.get('wwwroot');
  renderMoodleReactApp({ rootId: 'root', sesskey, wwwroot });
}