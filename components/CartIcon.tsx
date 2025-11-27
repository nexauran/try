"use client"
import useStore from '@/store';
import { ShoppingBagIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const CartIcon = () => {
  const {items} = useStore();
  return (
    <Link href={"/cart"} className='group relative'
    >
        <ShoppingBagIcon className="w-5 h-5 
        hover:text-shop_light_green hoverEffect" />
        <span className="absolute -top-1 -right-1 bg-shop_btn_dark_green text-white h-4 w-4 rounded-full text-xs
        font-semibold flex items-center justify-center ">
            {items?.length ? items.length : 0}
            </span>
    </Link>
  )
}

export default CartIcon