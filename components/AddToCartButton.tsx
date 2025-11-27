/** @format */

"use client";
import { Product } from "@/sanity.types";
import { ShoppingBagIcon } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import useStore from "@/store";
import toast from "react-hot-toast";
import PriceFormater from "./PriceFormater";
import QuantityButtons from "./QuantityButton";
interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addItem, getItemCount } = useStore();
  const itemCount = getItemCount(product?._id);

  const isOutOfStock = product?.stock === 0;
  const handleAddToCart = () => {
    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success(
        `Added ${product?.name?.substring(0, 12)}..... added sucessfully`
      );
    } else {
      toast.error("Cannot add more items, stock limit reached");
    }
  };
  return (
    <div className="w-full">
      {itemCount ?
        <div className="text-sm w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-darkColor/60 ">Quantity</span>
            <QuantityButtons product={product}/>
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormater
              amount={product?.price ? product?.price * itemCount : 0}
            />
          </div>
        </div>
      : <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "w-full text-shop_light_bg  bg-shop_dark_green/80 shadow-none border border-shop_dark_green/80 font-semibold tracking-wide hover:text-white hover:bg-shop_dark_green hover:border-shop_dark_green  hoverEffect",
            className
          )}
        >
          <ShoppingBagIcon /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      }
    </div>
  );
};

export default AddToCartButton;
