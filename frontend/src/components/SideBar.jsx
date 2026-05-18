import React from 'react'
import '../assets/styles/sideBar.css'
import chat from '../assets/icons/chart.svg'
import device from '../assets/icons/device.svg'
import historic from '../assets/icons/historic.svg'
import prompt from '../assets/icons/prompt.svg'
import alerts from '../assets/icons/alerts.svg'
import { NavLink } from 'react-router-dom';
import logo from '../assets/img/logo.svg'
import help from '../assets/icons/help.svg'
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';



const SideBar = () => {
const startHelpTour = () => {
  const driverObj = driver({
    showProgress: true,
    stagePadding: 4,
    steps: [
      {
        element: '#nav-dashboard',
        popover: {
          title: 'Dashboard',
          description: 'Return to the main dashboard overview.',
          side: 'right',
          align: 'start'
        },
        padding: 1,
      },
      {
        element: '#nav-devices',
        popover: {
          title: 'Live Data',
          description: 'View real-time sensor readings from the field.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#nav-alerts',
        popover: {
          title: 'Alerts',
          description: 'See all triggered alerts based on thresholds.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#nav-prompts',
        popover: {
          title: 'AI Prompts',
          description: 'Review AI analysis requests sent to the models.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#nav-history',
        popover: {
          title: 'Temperature History',
          description: 'Browse and filter historical temperature logs.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  });

  driverObj.drive();
};
  return (
    <div className='background sideBarContainer'>
      <div className='logoContainer'>
        <img src={logo} alt="" />
      </div>
      <ul>
        
        <li><NavLink id="nav-devices" to="/devices" activeClassName="active"><img src={chat} alt="Devices" /></NavLink></li>
        <li><NavLink id="nav-alerts" to="/alerts" activeClassName="active"><img src={alerts} alt="Alerts" /></NavLink></li>
        <li><NavLink id="nav-history" to="/history" activeClassName="active"><img src={historic} alt="History" /></NavLink></li>
        <li><NavLink id="nav-dashboard" to="/" activeClassName="active"><img src={device} alt="Dashboard" /></NavLink></li>
        <li><NavLink id="nav-prompts" to="/prompts" activeClassName="active"><img src={prompt} alt="Prompts" /></NavLink></li>
        <li onClick={startHelpTour} style={{ cursor: 'pointer' }}>
          <img src={help} alt="Help" />
        </li>
      </ul>
      <ul className='bottom'>
        {/*<li><NavLink to="/devices" activeClassName="active"><img src={device} alt="Devices" /></NavLink></li>*/}
      </ul>
    </div>
  );
}

export default SideBar;


