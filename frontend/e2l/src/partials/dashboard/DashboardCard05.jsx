import React from 'react';
import { useState, useEffect } from 'react';
import Image01 from '../../images/user-36-05.jpg';
import Image02 from '../../images/user-36-06.jpg';
import Image03 from '../../images/user-36-07.jpg';
import Image04 from '../../images/user-36-08.jpg';
import Image05 from '../../images/user-36-09.jpg';

function DashboardCard5() {

  const [users, setUsers]= useState([]);
  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    fetch("https://e2l-hackathon.onrender.com" + "/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setUsers(data.data.users));
  }, [token]);

  return (
    <div className="max-height-20 col-span-full lg:col-span-6 md:col-span-6 sm:col-span-12 bg-white shadow-lg rounded-sm border border-slate-200"  style={{maxHeight: '200px', overflow: 'auto'}}>
      <header className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">User Risk Level</h2>
      </header>
      <div className="p-3">

        {/* Table */}
        <div className="">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-slate-400 bg-slate-50">
              <tr>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Person</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">#</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-slate-100">
              {
                users.map(user => {
                  return (
                    <tr key={user.username}>
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="font-medium text-slate-800">{user.username}</div>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-left">{user.riskFactor}</div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>

        </div>

      </div>
    </div>
  );
}

export default DashboardCard5;
