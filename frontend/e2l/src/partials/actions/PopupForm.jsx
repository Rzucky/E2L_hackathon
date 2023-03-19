import React, {useState} from 'react';
import { Outlet, Link, useNavigate } from "react-router-dom";
import { baseURL } from "../../api";
import { IoClose } from "react-icons/io5";


function PopupForm({closePopup}) {


  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState(""); 
  const token = JSON.parse(localStorage.getItem("token"));

  const onCreate = async (e) => {
    e.preventDefault();
    console.log("create");
      try {
          const response = await fetch(baseURL + "/createProfile", {
              method: 'POST',
              body: JSON.stringify({
                  username: username, 
                  password: password,
                  role: role,
              }),
              headers: {
                  'Content-Type': 'application/json',
                  authorization: `${token}`,
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
              closePopup(false);
              navigate("/");
              window.location.reload();
          }
      } catch (error) {
          console.log(error);
          setError(error.message);
      }
  }


  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white p-8 max-w-lg mt-10 absolute rounded-lg border-3 border-grey">
      <div className='float-right mb-15'>
          <IoClose className='icons text-right' onClick={() => closePopup(false)}/>
      </div>
      <form onSubmit={onCreate}>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2" htmlFor="username">
          Username
        </label>
        <input
          className="shadow border-black border appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          type="username"
          placeholder="Username"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          placeholder="Password"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2" htmlFor="role">
          Role
        </label>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="role"
        >
          <option>User</option>
          <option>Admin</option>
          </select>
        </div>
      <div className="flex items-center justify-center mt-6">
        <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
          Submit
        </button>
      </div>
      </form>
      </div>
    </div>
  );
}

export default PopupForm;