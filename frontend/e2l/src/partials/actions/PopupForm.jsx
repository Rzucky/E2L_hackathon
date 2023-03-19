import React, {useState} from 'react';
import { Outlet, Link, useNavigate } from "react-router-dom";


function PopupForm() {


  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState(""); 

  const onCreate = async (e) => {
      e.preventDefault();

      try {
          const response = await fetch("https://e2l-hackathon.onrender.com" + "/createProfile", {
              method: 'POST',
              body: JSON.stringify({
                  username: username, 
                  password: password,
                  role: role,
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
              setError("Error creating a user");
              return;
          } else {
              console.log("OK");
              localStorage.setItem('username', JSON.stringify(username));
              navigate("/");
          }
      } catch (error) {
          console.log(error);
          setError(error.message);
      }
  }





  return (
    <div>
      <div>
      <form onSubmit={onCreate}>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" name="username" />

        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" />

        <label htmlFor="role">Role:</label>
        <select id="role" name="role">
          <option value="admin">Admin</option>
          <option value="base">Base</option>
        </select>
      </form>
      <button>Submit</button>
      </div>
    </div>
  );
}

export default PopupForm;