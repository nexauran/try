import { cn } from "@/lib/utils";
import { twMerge } from "tailwind-merge";

interface  Props {
    amount: number| undefined;
    
    className?:string;
}

const PriceFormater = ({amount,className}:Props ) => {
    const formattedPrice = new Number(amount).toLocaleString("en-US",{
        currency:"INR",
        style:"currency",
        minimumFractionDigits:2,
});
  return (

    <span className={cn("text-sm font-semibold text-darkColor", className)}>

        {formattedPrice}
    </span>
  );
};

  

export default PriceFormater