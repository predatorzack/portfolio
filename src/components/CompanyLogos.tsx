// Company logo components for hero section
// Styled to match official branding

export const AlphadroidLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 30" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="22" fontFamily="Space Grotesk, sans-serif" fontSize="20" fontWeight="600" fill="currentColor">
      <tspan fill="#3DD9B3">α</tspan>droid
    </text>
  </svg>
);

export const ElectricPeLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 130 30" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Location pin icon */}
    <path d="M6 4C3.5 4 1.5 6 1.5 8.5C1.5 12 6 17 6 17C6 17 10.5 12 10.5 8.5C10.5 6 8.5 4 6 4ZM6 10.5C4.9 10.5 4 9.6 4 8.5C4 7.4 4.9 6.5 6 6.5C7.1 6.5 8 7.4 8 8.5C8 9.6 7.1 10.5 6 10.5Z" fill="#22C55E" transform="translate(0, 5)"/>
    <text x="14" y="21" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="600" fill="currentColor">
      Electric<tspan fill="#22C55E">Pe</tspan>
    </text>
  </svg>
);

export const DotPeLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 80 30" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="21" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="700" fill="currentColor">
      Dot<tspan fill="#6366F1">Pe</tspan>
    </text>
  </svg>
);

export const SpinnyLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 30" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* S icon circle */}
    <circle cx="10" cy="15" r="9" fill="#EC4899"/>
    <text x="6" y="20" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="700" fill="white">S</text>
    <text x="24" y="21" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="600" fill="currentColor">
      Spinny
    </text>
  </svg>
);
