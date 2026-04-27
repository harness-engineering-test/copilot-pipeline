import { useState } from 'react'

interface CounterProps {
  initialCount?: number
  label?: string
}

export function Counter({ initialCount = 0, label = 'Count' }: CounterProps) {
  const [count, setCount] = useState(initialCount)

  return (
    <button
      type="button"
      className="counter"
      onClick={() => setCount((prev) => prev + 1)}
    >
      {label} is {count}
    </button>
  )
}
