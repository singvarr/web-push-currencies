import React from 'react';
import './App.css';
import { CurrencyTable } from "./Table/Table";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                Exchange rates
            </header>
            <CurrencyTable/>
        </div>
    );
}

export default App;
