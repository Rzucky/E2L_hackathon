import React, { useState } from "react";
import { UserContext } from "./Context";
import { useContext } from "react";
import jwtDecode from "jwt-decode";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); 
    const [, setIsLoading] = useState(false);

    const { setLoginData } = useContext(UserContext);

    const onLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    }

    try {
        const response = await fetch(baseURL + "/api/auth/login", {
          method: 'POST',
          body: JSON.stringify({
            email: email, 
            password: password,
          }),
          headers: {
            'Content-Type':  'application/json'
          },
        });
        
        if (!response.ok) {
          console.log("NOT OK");
          setError("Something went wrong!");
          return;
        }
  
        const result = await response.json();
        setLoginData(result);
        localStorage.setItem('loginData', JSON.stringify(result));
  
        //dobivanje rolea preko dekodiranja
        var role = jwtDecode(result.idToken);
        localStorage.setItem('role', JSON.stringify(role.role));
        
        setIsLoading(false); 
    } catch (error) {
        console.log(error);
        setError(error.message);
    } finally {
        navigate("/");
    }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
