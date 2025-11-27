/** @format */

import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import React from "react";
import AddToWishlistButton from "./AddToWishlistButton";
import { Title } from "./ui/text";
import { StarIcon } from "lucide-react";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="text-sm border-darkBlue/20 border-[1px] rounded-md bg-white group ">
      <div className="relative group overflow-hidden bg-shop_light_bg">
        {product?.images && (
          <Link href={`/product/${product?.slug?.current}`}>
          <img
            src={urlFor(product?.images[0]).url()}
            alt="ProductImage"
            loading="lazy"
            width={700}
            height={100}
            className={`w-full h-64 object-contain overflow-hidden transition-transform bg-shop_light_bg hoverEffect
            ${product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"}`}
          />
          </Link>
        )}
        {product?.status === "sale" && (
          <p className="absolute top-2 left-2 z-10 text-xs border border-darkColor/50 px-2 rounded-full group-hover:border-shop_light_green group-hover:text-shop_light_green hoverEffect">
            Sale!
          </p>
        )}
        <AddToWishlistButton product={product} />
        {product?.status === "new" && (
          <p className="absolute top-2 left-2 z-10 text-xs border border-darkColor/50 px-2 rounded-full group-hover:border-shop_light_green group-hover:text-shop_light_green hoverEffect">
            New!
          </p>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 ">
        {product?.categories && (
          <p className="uppercase line-clamp-1 text-xs text-shop_light_text">
            {product?.categories?.map((cat) => cat).join(", ")}
          </p>
        )}
        <Link href={`/product/${product?.slug?.current}`}>
        <Title className="text-sm line-clamp-1">{product?.name}</Title>
        </Link>
       
        <div className="flex items-center gap-2.5 whitespace-nowrap ">
            <p className="font-medium">{product?.stock === 0 ? "Out of Stock" : "In Stock"}</p>
            <p className={` ${product?.stock === 0 ?"text-red-600" : "text-shop_light_green/80 font-semibold"}`}>
            {product?.stock === 0 ? "Unavailable" : product?.stock}</p>
        </div>
        <PriceView 
        price={product?.price}
        discount={product?.discount}
        className="text-sm"
        />
        <AddToCartButton product={product} className="w-36 rounded-full "/>
      </div>
    </div>
  );
};

export default ProductCard;
