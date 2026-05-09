interface GaugeProps {
  value: number
  color?: string
  showLabels?: boolean
  min?: string
  max?: string
}

export function Gauge({ value, color = '#ef4d23', showLabels = false, min, max }: GaugeProps) {
  const totalTicks = 40
  const activeCount = Math.round((value / 100) * totalTicks)
  const r = 80
  const innerR = r - 10
  const cx = 100
  const cy = 100

  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    const angle = Math.PI + (i * Math.PI) / (totalTicks - 1)
    const x1 = cx + innerR * Math.cos(angle)
    const y1 = cy + innerR * Math.sin(angle)
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const isActive = i < activeCount

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? color : '#d4d4d8'}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    )
  })

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
        {ticks}
        <text
          x={100}
          y={105}
          textAnchor="middle"
          fontSize={22}
          fontWeight={600}
          fill="currentColor"
        >
          {value}%
        </text>
      </svg>
      {showLabels && min && max && (
        <div className="flex justify-between w-full max-w-[260px] text-[11px] text-neutral-500 -mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}
