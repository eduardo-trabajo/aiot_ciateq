import React from 'react';
import SideBar from './SideBar';
import '../assets/styles/layout.css';

const Layout = ({ children }) => {
  return (
    <>
      <div className='layoutContainer'>
        <SideBar />
        <div className="contentContainer">
          {children} 
        </div>
      </div>
    </>
  );
};

export default Layout;