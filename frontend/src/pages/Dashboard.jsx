import React, { useEffect, useState } from 'react'

import { IoSparkles } from 'react-icons/io5'
import { FaGem } from 'react-icons/fa6'
import ItemCreation from '../components/ItemCreation'
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/react'

const Dashboard = () => {

  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)

  const { getToken } = useAuth();
  const { user } = useUser();
  const isPremium = user && user.publicMetadata?.free_usage === undefined;

  const getDashboardData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if(data.success) {
        setCreations(data.creations);
      }
      else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className="flex justify-start gap-4 flex-wrap">
        {/* Total Creations Card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <IoSparkles className='w-5 text-white' />
          </div>
        </div>

        {/* Active Plan  */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              {isPremium ? 'Premium' : 'Free'}
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
            <FaGem className='w-5 text-white' />
          </div>
        </div>
      </div>

      {
        loading ? (
          <div className="flex justify-center items-center h-3/4">
            <div className="animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="mt-6 mb-4">Recent Creations</p>
            {
              creations.map((item) => <ItemCreation key={item.id} item={item} />)
            }
          </div>
        )
      }
    </div>
  )
}

export default Dashboard
