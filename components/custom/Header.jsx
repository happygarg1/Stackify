import Image from 'next/image'
import React, { useContext } from 'react'
import { Button } from '../ui/button'
import Colors from '@/app/data/Colors'
import { UserDetailContext } from '@/app/context/UserDetailContext'
import { useSidebar } from '../ui/sidebar'
import { usePathname } from 'next/navigation'
import { ActionContext } from '@/app/context/ActionContext'
import Link from 'next/link'
import { LucideDownload, Rocket } from 'lucide-react'

const Header = () => {
  const {userDetail,setUserDetail}=useContext(UserDetailContext);
  const {toggleSidebar}=useSidebar();
  const path=usePathname();
  const {action,setAction}=useContext(ActionContext);

  const onActionBtn=(action)=>{
    setAction({
      actionType:action,
      timeStamp:Date.now()
    })
  }
  return (
    <div className='p-4 flex justify-between items-center'>
      <Link href={'/'}>
        <Image src={'/globe.svg'} alt='Logo' width={40} height={40}/>
      </Link>
        {!userDetail?.name ? <div className='flex gap-5'>
            <Button variant="ghost">Sign In</Button>
            <Button className="text-white" style={{
                backgroundColor:Colors.BLUE
            }} >Get Started</Button>
        </div>:
        path?.includes('workspace') && <div className='flex gap-2 items-center'>
          <Button variant='ghost' onClick={()=>onActionBtn('export')}><LucideDownload/> Export</Button>
          <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={()=>onActionBtn('deploy')}><Rocket/> Deploy</Button>
          {userDetail&& <Image src={userDetail?.picture} alt='user' width={30} height={30} className='rounded-full w-[30px]' onClick={toggleSidebar}/>}
        </div>
        }
    </div>
  )
}

export default Header