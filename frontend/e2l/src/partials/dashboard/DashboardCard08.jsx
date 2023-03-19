import React, { useState, useEffect } from 'react';



function DashboardCard08() {
const [threats, setThreats]= useState([]);
const [filterdata, setFilterdata]= useState([]);
const [query, setQuery]= useState('');
const token = JSON.parse(localStorage.getItem("token"));

useEffect(() => {
    fetch("https://e2l-hackathon.onrender.com" + "/threats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setThreats(data.data.threats));
  }, [token]);


  return (
    <div className="col-span-full max-height-20 lg:col-span-12 md:col-span-12 sm:col-span-12 bg-white shadow-lg rounded-sm border border-slate-200" style={{maxHeight: '300px', overflow: 'auto'}}>
      <header className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Top threats</h2>
      </header>
      <div className="p-3">

        {/* Table */}
        <div className="">
          <table className="table-auto w-full" >
            {/* Table header */}
            <thead className="text-xs uppercase text-slate-400 bg-slate-50 rounded-sm">
              <tr>
                <th className="p-2">
                  <div className="font-semibold text-left">Type</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Occurrence</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Severity</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm font-medium divide-y divide-slate-100">
              {/* Row */}
              {
                threats.map((threat )=>(


              <tr>
                <td className="p-2">
                  <div>{threat.type}</div>
                </td>
                <td className="p-2">
                  <div className="text-center">{threat.occurrence}</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-red-500">{threat.severity}</div>
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


export default DashboardCard08;
