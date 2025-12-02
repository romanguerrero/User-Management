import { memo } from "react";

type CellValue = string | number | boolean | Date | null | undefined;

interface GenericCellProps {
  value?: CellValue;
}

export const GenericCell = memo(({ value }: GenericCellProps) => {
  if (value == null) {
    return <td>-</td>; 
  }

  switch (typeof value) {
    case "string":
      return <td>{value}</td>;

    case "number":
      return <td>{value.toString()}</td>;

    case "boolean":
        return <td>{value ? "True" : "False"}</td>;

    case "object":
      if (value instanceof Date) {
        return <td>{value.toDateString()}</td>;
      }
      return <td>{JSON.stringify(value)}</td>;

    default:
      return <td>{String(value)}</td>;
  }
});