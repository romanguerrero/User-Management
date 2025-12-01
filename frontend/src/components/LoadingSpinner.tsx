import { RotatingLines } from "react-loader-spinner";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
      <RotatingLines width="96" />
      </div>
    </div>
  );
}