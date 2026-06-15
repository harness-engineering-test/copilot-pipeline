interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      style={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
      }}
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #991b1b',
            backgroundColor: 'transparent',
            color: '#991b1b',
            cursor: 'pointer',
          }}
        >
          再試行
        </button>
      )}
    </div>
  )
}
