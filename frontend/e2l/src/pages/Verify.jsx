import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { baseURL } from "../api";

function Verify() {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [error, setError] = useState(""); 
    const [, setIsLoading] = useState(false);
    const username = JSON.parse(localStorage.getItem("username"));

    const onVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(baseURL + "/verify", {
                method: 'POST',
                body: JSON.stringify({
                    username: username,
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
                console.log("NOT OK");
                setError("Wrong verification code!");
                return;
            }
            var token = result.token;
            localStorage.setItem('token', JSON.stringify(token));

            var decodedToken = jwtDecode(token);
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
      <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
          <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
              <h1 className="text-3xl font-semibold text-center text-purple-700 underline">
                Verification
              </h1>
              <form className="mt-6"  onSubmit={onVerify}>
                  <div className="mb-2">
                      <label
                          htmlFor="code"
                          className="block text-sm font-semibold text-gray-800"
                      >
                          Verification code:
                      </label>
                      <input
                          type="code"
                          name="code"
                          id="code"
                          value={code}
                          onChange={(event) => setCode(event.target.value)}
                          className="input-field block w-full px-4 py-2 mt-2 text-purple-700 bg-white border border-black rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                      />
                  </div>
                  
                  {
                    error && (
                      <div className="center-align">
                        <span className="text-red-700">Wrong verification code!</span>
                      </div>
                    )  
                  }
                  <div className="mt-6">
                      <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
                          Verify
                      </button>
                  </div>
              </form>
          </div>
      </div>
  );
}

export default Verify;
