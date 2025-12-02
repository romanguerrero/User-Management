import { memo } from "react";

type CellValue = string | number | boolean | Date | null | undefined;

interface GenericCellProps {
  value?: CellValue;
}

export const GenericCell = memo(({ value }: GenericCellProps) => {
  if (value == null) {
    return <>-</>; 
  }

  switch (typeof value) {
    case "string":
      return <>{value}</>;

    case "number":
      return <>{value.toString()}</>;

    case "boolean":
        return <>{value ? "True" : "False"}</>;

    case "object":
      if (value instanceof Date) {
        return <>{value.toDateString()}</>;
      }
      return <>{JSON.stringify(value)}</>;

    default:
      return <>{String(value)}</>;
  }
});