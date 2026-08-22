interface FormErrorProps {
  message: string | null
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null
  return (
    <p role="alert" className="mb-4 text-sm text-destructive">
      {message}
    </p>
  )
}