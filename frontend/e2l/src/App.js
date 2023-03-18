import Login from "./Login";
import Register from "./Register";
import AuthenticatedPage from "./AuthenticatedPage";
import HomeUser from "./HomeUser";
import HomeAdmin from "./HomeAdmin";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  const currentRole = JSON.parse(localStorage.getItem('role'));
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<AuthenticatedPage>
            {
              currentRole === "ADMIN" ?
              <HomeAdmin/>
              : currentRole === "USER" &&
              <HomeUser/>
            }
        </AuthenticatedPage>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;


