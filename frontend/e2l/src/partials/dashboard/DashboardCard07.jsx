import React, { useState, useEffect } from 'react';



function DashboardCard07() {
const [userData, setUserdata]= useState([]);
const [userData2, setUserdata2]= useState([]);
const [filterdata, setFilterdata]= useState([]);
const [query, setQuery]= useState('');

const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    fetch("https://e2l-hackathon.onrender.com"+ "/reports", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserdata(data.data.reports);
        setFilterData(data.data.reports);
        console.log(userData);
      })
      .catch((error) => console.log(error));
  }, [token]);

  return (
    <div className="col-span-full max-height-20 lg:col-span-12 md:col-span-12 sm:col-span-12 bg-white shadow-lg rounded-sm border border-slate-200" style={{maxHeight: '450px', overflow: 'auto'}}>
      <header className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Reports And Analysis</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="">
          <table className="table-auto w-full" >
            {/* Table header */}
            <thead className="text-xs uppercase text-slate-400 bg-slate-50 rounded-sm">
              <tr>
                <th className="p-2">
                  <div className="font-semibold text-left">Username</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Time</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Type</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Severity</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Location</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm font-medium divide-y divide-slate-100">
              {/* Row */}
              {
                userData.map((getUser, index)=>(


              <tr key={index}>
                <td className="p-2">
                  <div className="flex items-center">
                    <svg className="shrink-0 mr-2 sm:mr-3" width="36" height="36" viewBox="0 0 36 36">
                      <circle fill="#24292E" cx="18" cy="18" r="18" />
                      <path d="M18 10.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V24c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z" fill="#FFF" />
                    </svg>
                    <div className="text-slate-800">{getUser.username}</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">{getUser.time}</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">{getUser.type}</div>
                </td>
                <td className="p-2">
                  <div className="text-center">{getUser.severity}</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">{getUser.location}</div>
                </td>
              </tr>

                ))
              }
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default DashboardCard07;
