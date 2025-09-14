import chickenPartyLogo from '../assets/chicken-party-logo.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12', 
  lg: 'h-16 w-16',
  xl: 'h-24 w-24'
};

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src={chickenPartyLogo} 
        alt="Chikin Rater - Chicken Party Logo"
        className={`${sizeClasses[size]} rounded-lg object-cover shadow-md`}
      />
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-amber-800">Chikin Rater</h1>
        <p className="text-sm text-orange-600">Party & Rate!</p>
      </div>
    </div>
  );
}

export function LogoIcon({ size = 'md', className = '' }: LogoProps) {
  return (
    <img 
      src={chickenPartyLogo} 
      alt="Chikin Rater Logo"
      className={`${sizeClasses[size]} rounded-lg object-cover shadow-md ${className}`}
    />
  );
}
