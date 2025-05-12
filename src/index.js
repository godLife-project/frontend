import React from 'react';
import ReactDOM from 'react-dom';  // 수정: react-dom/client -> react-dom
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  //<React.StrictMode>
    <App />
  //</React.StrictMode>
  ,
  document.getElementById('root')  // 수정: createRoot 대신 render 사용
);

// 성능 측정을 위한 코드
reportWebVitals();
