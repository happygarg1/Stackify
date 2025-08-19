import ChatView from '@/components/custom/ChatView'
import CodeView from '@/components/custom/CodeView'
import React from 'react'

const Workspace = () => {
  return (
    <div className='p-10'>
      {/* Use grid-cols-10 for a total of 10 columns */}
      <div className='grid grid-cols-1 md:grid-cols-10 gap-7'>
        {/* ChatView takes 3 out of 10 columns (30%) */}
        <div className='md:col-span-3'>
          <ChatView />
        </div>
        
        {/* CodeView takes 7 out of 10 columns (70%) */}
        <div className='md:col-span-7'>
          <CodeView />
        </div>
      </div>
    </div>
  )
}

export default Workspace