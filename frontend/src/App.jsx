import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import GenerateArticle from './pages/GenerateArticle'
import BlogTitle from './pages/BlogTitle'
import GenerateImages from './pages/GenerateImages'
import RemoveBG from './pages/RemoveBG'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'

import { useAuth } from '@clerk/react'

const App = () => {

  const {getToken} = useAuth()
  useEffect(() => {
    getToken().then((token) => console.log(token));
  }, []);

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/ai' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='generate-article' element={<GenerateArticle />} />
          <Route path='blog-title' element={<BlogTitle />} />
          <Route path='generate-image' element={<GenerateImages />} />
          <Route path='remove-bg' element={<RemoveBG />} />
          <Route path='remove-object' element={<RemoveObject />} />
          <Route path='review-resume' element={<ReviewResume />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
