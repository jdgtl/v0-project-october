export function ProjectOctoberLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Geometric "10" mark - October is the 10th month */}
      <g>
        {/* "1" - Vertical bar with subtle angle */}
        <path d="M12 8L14 6L16 8V32L14 34L12 32V8Z" fill="currentColor" className="text-primary" />

        {/* "0" - Geometric octagon (8 sides, October reference) */}
        <path
          d="M24 10L28 12L30 16L30 24L28 28L24 30L20 28L18 24L18 16L20 12L24 10Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />

        {/* Inner accent - subtle depth */}
        <circle cx="24" cy="20" r="4" fill="currentColor" className="text-accent opacity-60" />
      </g>
    </svg>
  )
}

export function ProjectOctoberWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ProjectOctoberLogo size={32} />
      <div className="flex flex-col leading-none">
        <span className="text-lg font-semibold tracking-tight">PROJECT</span>
        <span className="text-lg font-light tracking-wider">OCTOBER</span>
      </div>
    </div>
  )
}

export function ProjectOctoberLogoFull({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Icon */}
      <g>
        <path d="M12 8L14 6L16 8V32L14 34L12 32V8Z" fill="currentColor" />
        <path
          d="M24 10L28 12L30 16L30 24L28 28L24 30L20 28L18 24L18 16L20 12L24 10Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="24" cy="20" r="4" fill="currentColor" opacity="0.6" />
      </g>

      {/* Text */}
      <text
        x="45"
        y="22"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="600"
        letterSpacing="0.5"
        fill="currentColor"
      >
        PROJECT
      </text>
      <text
        x="45"
        y="34"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="300"
        letterSpacing="1"
        fill="currentColor"
      >
        OCTOBER
      </text>
    </svg>
  )
}
