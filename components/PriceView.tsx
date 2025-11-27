/** @format */

import React from "react";
import PriceFormater from "./PriceFormater";
interface Props {
  price: number | undefined;
  discount: number | undefined;
  className?: string;
}

const PriceView = ({ price, discount, className }: Props) => {
  return (
    <div className="flex items-center gap-2">
      <PriceFormater amount={price} className="text-shop_dark_green" />

      {price && discount && (
        <PriceFormater
          amount={price + (discount * price) / 100}
          className="line-through  font-normal text-shop_light_text "
        />
      )}
    </div>
  );
};

export default PriceView;
