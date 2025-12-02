import {
  createColumnHelper,
  type CellContext,
} from "@tanstack/react-table";
import type { GetUsersQuery, User } from "../../__generated__/graphql";
import { GenericCell } from "./cells/GenericCell";
import { PostCell } from "./cells/PostCell";

const columnHelper = createColumnHelper<GetUsersQuery["users"][0]>();

export const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info: CellContext<User, number>) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info: CellContext<User, string>) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("age", {
    header: "Age",
    cell: (info: CellContext<User, number>) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info: CellContext<User, string>) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: (info: CellContext<User, string>) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("posts", {
    header: "Post Count",
    cell: (info: any) => <PostCell posts={info.getValue()} />,
  }),
];
