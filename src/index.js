import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// public-index.html <div id="root"></div>을 가져와 
// React 앱을 렌더링할 수 있는 루트 공간 생성 (도화지)
const root = ReactDOM.createRoot(document.getElementById('root'));

// root를 화면에 렌더링
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);