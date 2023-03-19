import React, { useState } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import WelcomeBanner from '../partials/dashboard/WelcomeBanner';
import DashboardAvatars from '../partials/dashboard/DashboardAvatars';
import DashboardCard01 from '../partials/dashboard/DashboardCard01';
import DashboardCard02 from '../partials/dashboard/DashboardCard02';
import DashboardCard03 from '../partials/dashboard/DashboardCard03';
import DashboardCard04 from '../partials/dashboard/DashboardCard04';
import DashboardCard05 from '../partials/dashboard/DashboardCard05';
import DashboardCard06 from '../partials/dashboard/DashboardCard06';
import DashboardCard07 from '../partials/dashboard/DashboardCard07';
import DashboardCard08 from '../partials/dashboard/DashboardCard08';
import DashboardCard09 from '../partials/dashboard/DashboardCard09';

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">


      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Welcome banner */}
            <WelcomeBanner />

            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              {/* Left: Avatars */}
              <DashboardAvatars />

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
   
              </div>

            </div>

            {/* Cards */}
            <hr /><br />
            <div style={{ fontWeight: 'bold', fontSize: '30px', textAlign: 'center' }}>Real Time</div>
            <hr /><br />
            <div className="grid grid-cols-12 gap-6 h-100">
              <DashboardCard01/>
              <DashboardCard02/>
              <DashboardCard03/>
            </div>
            <hr /><br />
            <div style={{ fontWeight: 'bold', fontSize: '30px', textAlign: 'center' }}>Reports</div>
            <hr /><br />
            <div className="grid grid-cols-12 gap-6 h-100">
              <DashboardCard04/>
              <div className='col-span-6'>
              <DashboardCard05/>
              <DashboardCard06/>
              </div>
              <DashboardCard07/>
            </div>
            <hr /><br />
            <div style={{ fontWeight: 'bold', fontSize: '30px', textAlign: 'center' }}>Threats</div>
            <hr /><br />
            <div className="grid grid-cols-12 gap-6 h-100">
              <DashboardCard08/>
            </div>
            <hr /><br />
            <div style={{ fontWeight: 'bold', fontSize: '30px', textAlign: 'center' }}>Users</div>
            <hr /><br />
            <div className="grid grid-cols-12 gap-6 h-100">
              <DashboardCard09/>
            </div>
              
            
          </div>
        </main>


      </div>
    </div>
  );
}

export default Dashboard;