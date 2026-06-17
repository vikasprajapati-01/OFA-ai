import React from 'react'

import { useClerk, useUser } from '@clerk/react'
// import { Protect } from '@clerk/react'
import { NavLink } from 'react-router-dom';

import { MdHome } from "react-icons/md";
import { LuNotebookPen } from "react-icons/lu";
import { MdTitle } from "react-icons/md";
import { RiImage2Line } from "react-icons/ri";
import { FaEraser } from "react-icons/fa6";
import { CiSquareRemove } from "react-icons/ci";
import { VscPreview } from "react-icons/vsc";
import { IoLogOutOutline } from "react-icons/io5";

const navItems = [
  {to: '/ai', label: 'Dashboard', Icon: MdHome},
  {to: '/ai/generate-image', label: 'Generate Image', Icon: RiImage2Line},
  {to: '/ai/generate-article', label: 'Generate Article', Icon: LuNotebookPen},
  {to: '/ai/blog-title', label: 'Blog Title', Icon: MdTitle},
  {to: '/ai/remove-bg', label: 'Remove Background', Icon: FaEraser},
  {to: '/ai/review-resume', label: 'Review Resume', Icon: VscPreview},
  {to: '/ai/remove-object', label: 'Remove Object', Icon: CiSquareRemove},
]

const Sidebar = ({ sidebar, setSidebar }) => {

    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();

  return (
    <div className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${sidebar ? 'translated-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
      <div className="my-7 w-full">
        <img src={user.imageUrl} alt="" className='w-13 rounded-full mx-auto' />

        <h1 className='mt-1 text-center'>{user.fullName}</h1>
        <div className='px-6 mt-5 text-sm text-gray-600 font-medium' >
          {navItems.map(({to, label, Icon}) => (
            <NavLink key={to} to={to} end={to === '/ai'} onClick={() => setSidebar(false)} className={({isActive}) => `px-3.5 py-2.5 flex items-center gap-3 rounded ${isActive ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white' : ''}` } >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''} `} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer" onClick={openUserProfile}>
          <img src={user.imageUrl} alt="" className='w-8 rounded-full' />
          <div>
            <h1 className='text-sm font-medium'>{user.fullName}</h1>
            {/* <p className='text-xs text-gray-500'>
              <Protect plan="Premium" fallback="Free">Premium</Protect>
              Plan
            </p> */}
          </div>
        </div>
        <IoLogOutOutline onClick={signOut} className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer' />
      </div>

    </div>
  )
}

export default Sidebar
