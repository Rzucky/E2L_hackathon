import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import './css/style.css';
import './charts/ChartjsConfig';

// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Verify from './pages/Verify';
import AuthenticatedPage from './pages/AuthenticatedPage';
import VerificationPage from './pages/VerificationPage';

function App() {
  const currentRole = JSON.parse(localStorage.getItem('role'));
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Routes>
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/" element={<AuthenticatedPage>
            {
              (currentRole === "admin" || currentRole === "base") &&
              <Dashboard/>
            }
        </AuthenticatedPage>} />
        <Route exact path="/verify" element={<VerificationPage>
            {
              <Verify/>
            }
        </VerificationPage>} />
      </Routes>
    </>
  );
}

export default App;
