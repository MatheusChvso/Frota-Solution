// frontend/src/App.jsx

import React from 'react';
import ListaVeiculos from './components/ListaVeiculos';
import './App.css'; // Um pouco de estilo não faz mal

function App() {
  return (
    <div className="App">
      <ListaVeiculos />
    </div>
  );
}

export default App;