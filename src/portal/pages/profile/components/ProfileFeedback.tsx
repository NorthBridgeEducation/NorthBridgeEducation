export function ProfileLoading() {
  return <p role="status">Loading your profile…</p>;
}

type ProfileErrorProps = {
  message: string;
  onRetry: () => void;
};

export function ProfileError({ message, onRetry }: ProfileErrorProps) {
  return (
    <div className="space-y-3">
      <p role="alert" className="text-sm text-destructive">
        {message}
      </p>

      <button
        type="button"
        className="rounded-md border px-4 py-2 text-sm font-medium"
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}