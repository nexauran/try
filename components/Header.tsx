
import React, { use } from 'react';
import Container from './Container';
import Logo from './Logo';
import Options from './Options';
import SearchBar from './SearchBar';
import CartIcon from './CartIcon';
import FavouriteButton from './FavouriteButton';
import Singin from './Singin';
import MobileMenu from './MobileMenu';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ClerkLoaded, SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Logs } from 'lucide-react';
import { getMyOrders } from '@/sanity/queries';









const Header = async () => {
  const user =await currentUser();
  const  {userId} = await auth();
  let orders =null;
  if(userId){
    orders = await getMyOrders(userId);
  }

 
  
  return (
    <header className='bg-white/70 py-5  sticky top-0 z-50 backdrop-blur-md' >
        <Container className='flex items-center justify-between text-lightColor '>
            <div className="w-auto md:w-1/3 flex items-center gap-2.5 justify-start md:gap-0">
              <MobileMenu />
              <Logo />
            </div>
            <Options />
            <div className='w-auto md:1/3 flex items-center justify-end gap-5 '>
              <SearchBar />
              <CartIcon />
              <FavouriteButton />
              <ClerkLoaded>
                <SignedIn>
                  <Link href={"/orders"} className='group relative hover:text-shop_light_green hoverEffect'>
                  <Logs />
                  <span className='absolute -top-1 -right-1 bg-shop_btn_dark_green text-white  h-4.5 w-4.5 rounded-full text-xs font-semibold flex items-center justify-center' >
                    {orders?.length ? orders?.length:0} 
                    </span>
                  </Link>
                  <UserButton/>
                </SignedIn>

               {!user && <Singin />}
              </ClerkLoaded>
            </div>
        </Container>
    </header>
  );
};

export default Header;