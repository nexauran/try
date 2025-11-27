import { Facebook, Twitter, Youtube } from 'lucide-react'
import React from 'react'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  iconclassName?: string;
  tooltipclassName?: string;
}

const socialLinks = [
  {
    title: "Twitter",
    href: "https://www.twitter.com/",
    icon: <Twitter className="w-5 h-5" />,
  },
  {
    title: "Youtube",
    href: "https://www.youtube.com/",
    icon: <Youtube className="w-5 h-5" />,
  },
  {
    title: "Facebook",
    href: "https://www.facebook.com/",
    icon: <Facebook className="w-5 h-5" />,
  },
];

const Social = ({ className, iconclassName, tooltipclassName }: Props) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3.5", className)}>
        {socialLinks?.map((item) => (
          <Tooltip key={item?.title}>
            <TooltipTrigger>
              <Link href={item?.href} className={iconclassName}>
                {item?.icon}
              </Link>
            </TooltipTrigger>

            {/* Required for Tooltip to show */}
            <TooltipContent className={tooltipclassName}>
              {item?.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default Social;
