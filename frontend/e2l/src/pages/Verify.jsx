import React, { useState } from "react";
import { UserContext } from "../utils/Context";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import jwtDecode from "jwt-decode";
import { baseURL } from "../api";

function Verify() {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [error, setError] = useState(""); 
    const [, setIsLoading] = useState(false);

    const { setLoginData } = useContext(UserContext);

    const onVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(baseURL + "/verify", {
                method: 'POST',
                body: JSON.stringify({
                    code: code
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
        
            if (!response.ok) {
                console.log("NOT OK");
                setError("Something went wrong!");
                return;
            }
  
            const result = await response.json();

            if (result.error == true) {
                setError("Wrong verification code!");
                return;
            }

            var token = result.data.token;
            localStorage.setItem('token', JSON.stringify(token));

            var decodedToken = jwtDecode(token);
            setLoginData(decodedToken);
            localStorage.setItem('username', JSON.stringify(decodedToken.username));
            localStorage.setItem('role', JSON.stringify(decodedToken.role));
        
            setIsLoading(false); 
        } catch (error) {
            console.log(error);
            setError(error.message);
        } finally {
            navigate("/");
        }
    }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={onVerify}>
        <div>
          <label htmlFor="code">Verification code:</label>
          <input
            type="code"
            id="code"
            value={code}
          />
        </div>
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}

export default Verify;
