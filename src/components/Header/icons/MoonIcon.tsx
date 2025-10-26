interface MoonIconProps {
  width?: string;
  height?: string;
  color?: string;
}

export const MoonIcon = ({ 
  width = "20", 
  height = "20", 
  color = "currentColor" 
}: MoonIconProps) => {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
};

