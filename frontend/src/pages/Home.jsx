import React from 'react'

import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AIComp from '../components/AIComp'
import Plans from '../components/Plans'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
      <Navbar />

      <Hero />

      <AIComp />

      <Plans />

      <Footer />
    </>
  )
}

export default Home
