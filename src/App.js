import React from 'react';
import './App.css';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className="App">
      <div className="container-fluid">
        <Home />
      </div>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light">

      </ToastContainer>
    </div>
  );
}

export default App;
