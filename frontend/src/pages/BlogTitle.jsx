import React, {useState} from 'react'

import { TbSparkles } from "react-icons/tb";
import { FaHashtag } from "react-icons/fa";

const BlogTitle = () => {

  const blogCategories = [ 'General', 'Technology', 'Health', 'Travel', 'Finance', 'Education', 'Food', 'Lifestyle', 'Entertainment', 'Sports' ]
  
    const [selectedCategory, setSelectedCategory] = useState(blogCategories[0])
    const [input, setInput] = useState('')
  
    const onSubmitHandler = async (e) => {
      e.preventDefault();
    }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
          {/* Left */}
          <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
              <div className='flex items-center gap-3'>
                <TbSparkles className='w-6 text-[#8E37EB]' />
                <h1 className='text-xl font-semibold'>Blog Title Generator</h1>
              </div>
              <p className="mt-6 text-sm font-medium">Keyword</p>
    
              <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='The world is..' required />
    
              <p className="mt-4 text-sm font-medium">Blog Category</p>
    
              <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
                {
                  blogCategories.map((category, index) => (
                    <span onClick={() => setSelectedCategory(category)} className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedCategory === category ? 'bg-purple-50 text-purple-700' : 'text-gray-500 border-gray-300'}`} key={index}>{category}</span>
                  ))
                }
              </div>
    
              <br />
              <button type='submit' className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 rounded-lg text-sm cursor-pointer'>
                <FaHashtag className='w-5'/>
                Generate Title
              </button>
          </form>
    
          {/* Right */}
          <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
            <div className="flex items-center gap-3">
              <FaHashtag className='w-5 h-5 text-[#8E37EB]' />
              <h1 className='text-xl font-semibold'>Generated Title</h1>
            </div>
    
            <div className="flex-1 flex justify-center items-center">
              <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                <FaHashtag className='w-9 h-9' />
                <p>Enter a topic and click "Generate Blog Title" to create your content.</p>
              </div>
            </div>
          </div>
        </div>
  )
}

export default BlogTitle
