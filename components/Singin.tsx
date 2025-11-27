import { SignInButton } from '@clerk/nextjs'
import React from 'react'

const Singin = () => {
  return (
    <SignInButton  mode="modal">
      <button className='text-sm font-semibold hover:text-shop_dark_green text-lightColor hover:cursor-pointer hoverEffect'>Login</button>
    </SignInButton>
  )
}

export default Singin