import  Container  from './Container'
import React from 'react'
import FooterTop from './FooterTop'
import Logo from './Logo'
import { SubText, SubTitle } from './ui/text'
import { categoriesData, quickLinksData } from '@/constants/data'
import Link from 'next/link'
import { Input } from './ui/input'
import { Button } from './ui/button'

const Footer = () => {
  return (
    <div>
        <footer className='bg-white border-t'>
            <Container>
                <FooterTop />
               <div className='py-12 grid grid-col-1 md:grid-col-2 lg:grid-cols-4 gap-8'>
                  <div className='space-y-4'>
                    <Logo />
                    <SubText>Enhance your future with us.A space where you can buy and gift your dear ones</SubText>
                  </div>
                  <div>
                    <SubTitle>Quick Links</SubTitle>
                    <ul className='space-y-3 mt-4'>
                      {quickLinksData?.map((item)=>(
                        <li  key={item?.title}>
                          <Link href={item?.href} className='hover:text-shop_light_green hoverEffect font-medium'>
                          {item?.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div>
                    <SubTitle>Categories</SubTitle>
                    <ul className='space-y-3 mt-4'>
                      {categoriesData?.map((item)=>(
                        <li  key={item?.title}>
                          <Link 
                          href={`/category/${item?.href}`} className='hover:text-shop_light_green hoverEffect font-medium'>
                          {item?.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  </div>
                  <div className='space-y-4'>
                    <SubTitle>Newsletter</SubTitle>
                    <SubText>Subscribe to our newsletter to recive updates and excluse offers</SubText>
                    <form className='space-y-3'>
                      <Input placeholder='Enter your email' type='email' required/>
                      <Button className='w-full'>Subscribe</Button>
                    </form>
                  </div>
               </div>
               <div className="py-6 border-t text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()}{' '}
            <span className="text-darkColor font-black tracking-wider uppercase hover:text-shop_dark_green hoverEffect group font-sans">
              Nexaura.
              <span className="text-shop_dark_green group-hover:text-darkColor hoverEffect">
                in
              </span>
            </span>
            . All rights reserved.
          </p>
        </div>
            </Container>
        </footer>
    </div>
  )
}

export default Footer