interface FormStatusMessagesProps {
  error: string | null
  success: boolean
}

export function FormStatusMessages({ error, success }: FormStatusMessagesProps) {
  return (
    <>
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-accent/10 border border-accent/20 p-4 text-accent text-sm font-medium">
          ✓ Expense tracked successfully!
        </div>
      )}
    </>
  )
}
