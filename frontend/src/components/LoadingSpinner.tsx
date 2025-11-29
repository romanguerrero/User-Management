import { RotatingLines } from "react-loader-spinner";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <RotatingLines width="96" />
    </div>
  );
}