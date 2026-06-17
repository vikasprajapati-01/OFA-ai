import React, {useState} from 'react'

import { TbSparkles } from "react-icons/tb";
import { FaImage } from "react-icons/fa";

const GenerateImages = () => {

  const imageStyle = [ 'Realistic', 'Cartoon', 'Ghibli', 'Anime', 'Fantasy', '3D', 'Portrait' ]
  
    const [selectedStyle, setSelectedStyle] = useState(imageStyle[0])
    const [input, setInput] = useState('')

  
    const onSubmitHandler = async (e) => {
      e.preventDefault();
    }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
          {/* Left */}
          <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
              <div className='flex items-center gap-3'>
                <TbSparkles className='w-6 text-[#00AD25]' />
                <h1 className='text-xl font-semibold'>Image Generator</h1>
              </div>
              <p className="mt-6 text-sm font-medium">Describe your Image</p>
    
              <textarea onChange={(e) => setInput(e.target.value)} value={input} rows="4" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='Describe about the image you want to be generated...' required />
    
              <p className="mt-4 text-sm font-medium">Image Style</p>
    
              <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
                {
                  imageStyle.map((style, index) => (
                    <span onClick={() => setSelectedStyle(style)} className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedStyle === style ? 'bg-green-50 text-green-700' : 'text-gray-500 border-gray-300'}`} key={index}>{style}</span>
                  ))
                }
              </div>
    
              <br />
              <button type='submit' className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-6 rounded-lg text-sm cursor-pointer'>
                <FaImage className='w-5'/>
                Generate Image
              </button>
          </form>
    
          {/* Right */}
          <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
            <div className="flex items-center gap-3">
              <FaImage className='w-5 h-5 text-[#00AD25]' />
              <h1 className='text-xl font-semibold'>Generated Image</h1>
            </div>
    
            <div className="flex-1 flex justify-center items-center">
              <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                <FaImage className='w-9 h-9' />
                <p>Enter a topic and click "Generate Image" to create your content.</p>
              </div>
            </div>
          </div>
        </div>
  )
}

export default GenerateImages
