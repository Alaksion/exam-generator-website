import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

interface NumberInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: number
  onValueChange: (value: number) => void
}

export function NumberInput({
  value,
  onValueChange,
  ...props
}: NumberInputProps) {
  const [display, setDisplay] = useState(() => String(value))
  const prevValueRef = useRef<number>(value)

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setDisplay(String(value))
      prevValueRef.current = value
    }
  }, [value])

  return (
    <Input
      type="number"
      value={display}
      onChange={(e) => {
        const raw = e.target.value
        if (raw === '') {
          setDisplay('')
          prevValueRef.current = value
          return
        }
        const next = Number(raw)
        setDisplay(raw)
        onValueChange(next)
        prevValueRef.current = next
      }}
      {...props}
    />
  )
}
