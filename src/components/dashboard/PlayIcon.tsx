
import React from 'react';

export default function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="10" fill="#21A9E1" fillOpacity="0.18"/>
      <path d="M8.5 7.5V12.5L13 10L8.5 7.5Z" fill="#21A9E1"/>
    </svg>
  );
}
