import { Button } from "@/components/ui/button";

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

      <Button type="button" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}