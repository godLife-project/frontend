
import './App.css';

import React, { useEffect, useState } from 'react';
import axiosInstance from './api/axiosInstance';

const App = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axiosInstance.get('/hello')
        .then(response => setMessage(response.data))
        .catch(error => console.error('Error:', error));
  }, []);

  return <div>{message}</div>;
};

export default App;
