import React, { useState } from "react";
import { baseURL } from "../api";
import { Outlet, Link, useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); 
    const [, setIsLoading] = useState(false);

    const onLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(baseURL + "/login", {
                method: 'POST',
                body: JSON.stringify({
                    username: username, 
                    password: password,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': "*" 
                },
            });
        
            if (!response.ok) {
                console.log("NOT OK");
                setError("Something went wrong!");
                return;
            }
  
            const result = await response.json();
            if (result.error == true) {
                setError("Wrong email or password!");
                return;
            } else {
                navigate("/verify");
            }
        
            setIsLoading(false); 
        } catch (error) {
            console.log(error);
            setError(error.message);
        }
    }

    return (
      <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
          <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
              <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
                Login
              </h1>
              <form className="mt-6"  onSubmit={onLogin}>
                  <div className="mb-2">
                      <label
                          htmlFor="username"
                          className="block text-sm font-semibold text-gray-800"
                      >
                          E-mail:
                      </label>
                      <input
                          type="username"
                          name="username"
                          id="username"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          className="input-field block w-full px-4 py-2 mt-2 text-purple-700 bg-white border border-black rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                      />
                  </div>
                  <div className="mb-2">
                      <label
                          htmlFor="password"
                          className="block text-sm font-semibold text-gray-800"
                      >
                          Password:
                      </label>
                      <input
                          type="password"
                          name="password"
                          id="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="input-field outline-black block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                      />
                  </div>
                  {
                    error && (
                      <div className="center-align">
                        <span className="text-red-700">Wrong E-mail or password!</span>
                      </div>
                    )  
                  }
                  <div className="mt-6">
                      <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
                          Login
                      </button>
                  </div>
              </form>
          </div>
      </div>
  );
}

export default Login;
