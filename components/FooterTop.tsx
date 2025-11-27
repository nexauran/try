

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import React from "react";

interface ContactItemData{
    title:string;
    subtitle:string;
    icon:React.ReactNode;
}

const data: ContactItemData[] = [
  {
    title: "Visit Us",
    subtitle: "Iritty,Kannur",
    icon: (
      <MapPin className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
    ),
  },

  {
    title: "Call Us",
    subtitle: "+91 7306328115",
    icon: (
      <Phone className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
    ),
  },

  {
    title: "Working Hours",
    subtitle: "Mon-Sun: 9:00AM - 9:00PM ",
    icon: (
      <Clock className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
    ),
  },
  {
    title: "Email Us",
    subtitle: "nexaura.in@gmail.com",
    icon: (
      <Mail className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
    ),
  },

  
];

const FooterTop = () => {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 border-b">
    {data?.map((item,index)=>(
        <div key={index} className="flex items-center gap-3 group hover:bg-gray-50 p-4 transitions-colors
        ">
            {item?.icon}
        <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-primary">{item?.title}</h3>
            <p>{item?.subtitle}</p>
        </div>
        </div>
    ))}
  </div>;



};



export default FooterTop;
