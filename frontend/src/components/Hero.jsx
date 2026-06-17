import React from 'react'

import { useNavigate } from 'react-router-dom'

import User from '../assets/Unomate.png'

const Hero = () => {

  const navigate = useNavigate()

  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url("/hero.jpg")] bg-cover bg-no-repeat min-h-screen'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2]'>Let <span className='text-primary'>AI</span> <br /> create for you</h1>
        <p className='mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto max-sm:text-xs text-gray-600' >Transform your creation with our premium AI tools. Generate images, enhance workflow, and write articles</p>
      </div>

      <div className='flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs' >
        <button onClick={() => navigate('/ai')} className='bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer' >Try now</button>
        <button className='bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer' >Watch Demo</button>
      </div>

      <div className='flex items-center gap-4 mt-8 mx-auto text-gray-600'>
        <img src={User} alt="" className='h-8' /> Trusted by many users
      </div>
    </div>
  )
}

export default Hero
