import React from 'react';

// Avanza logo — geometric triangle with integrated upward arrow
// Conveys "advance / move forward" in a clean minimal mark
const LogoIcon = ({ className = "w-8 h-8", color = "#2F5E3F" }) => (
    <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Outer triangle (outline) */}
        <path
            d="M32 4L60 56H4L32 4Z"
            stroke={color}
            strokeWidth="5"
            strokeLinejoin="round"
            fill="none"
        />
        {/* Inner upward arrow */}
        <path
            d="M32 18L32 44M32 18L24 28M32 18L40 28"
            stroke={color}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default LogoIcon;
