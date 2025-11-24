import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'; // Assuming Home.js is in the same directory or adjust path
import Architecture from './Architecture'; // Assuming architecture.js is in the same directory or adjust path

function AppRoutes() {
    return (
        // <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/architecture" element={<Architecture />} />
        </Routes>
        // </Router>

    );
}

export default AppRoutes;
