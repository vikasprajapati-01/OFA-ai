import React, { useState } from 'react'

import { Outlet, useNavigate } from 'react-router-dom'
import { FiX } from "react-icons/fi";
import { AiOutlineMenu } from "react-icons/ai";

import Sidebar from '../components/Sidebar';

import Logo from '../assets/Unomate.png'
import { useUser, SignIn } from '@clerk/react';

const Layout = () => {

  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser();

  return user ? (
    <div className='flex flex-col items-start justify-start h-screen'>

      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
        <img src={Logo} alt="Unomate" onClick={() => navigate('/')} className='h-12 cursor-pointer' />
        {
          sidebar ? <FiX className='w-6 h-6 text-gray-600 sm:hidden cursor-pointer' onClick={() => setSidebar(false)} /> : <AiOutlineMenu className='w-6 h-6 text-gray-600 sm:hidden cursor-pointer' onClick={() => setSidebar(true)} />
        }
      </nav>

      <div className="flex-1 w-full flex h-[calc(100vh-64px)]">
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

        <div className="flex-1 bg-[#F4F7FB]">
          <Outlet />
        </div>
      </div>

    </div>
  ) :
  (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}

export default Layout
