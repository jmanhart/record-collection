interface HamburgerIconProps {
  width?: string;
  height?: string;
  color?: string;
}

export const HamburgerIcon = ({ 
  width = "24", 
  height = "24", 
  color = "currentColor" 
}: HamburgerIconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={width} 
      height={height} 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
};

