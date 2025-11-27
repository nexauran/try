import Shop from '@/components/Shop';
import { getCategories } from '@/sanity/queries';
import React from 'react'

const Shoppage = async() => {
  const categories =await getCategories();

  return (
    <div className='bg-shop_light_bg'>
      <Shop  categories ={categories}/>
    </div>
  )
}

export default Shoppage