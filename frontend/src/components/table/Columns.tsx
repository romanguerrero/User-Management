import {
  createColumnHelper,
} from "@tanstack/react-table";
import type { GetUsersQuery } from "../../__generated__/graphql";
import { GenericCell } from "./cells/GenericCell";
import { PostCell } from "./cells/PostCell";

const columnHelper = createColumnHelper<GetUsersQuery["users"][0]>();

export const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("age", {
    header: "Age",
    cell: (info) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: (info) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("posts", {
    header: "Post Count",
    cell: (info: any) => <PostCell posts={info.getValue()} />,
  }),
];
