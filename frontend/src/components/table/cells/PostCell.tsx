import { HoverCard } from "../../hovercard/HoverCard";

interface Post {
  title?: string | null;
  content?: string | null;
}

interface PostsCellProps {
  posts: Post[];
}

export function PostCell({ posts }: PostsCellProps) {
  const postArray = Array.isArray(posts) ? posts : [];
  const count = postArray.length;

  const truncate = (text: string, maxLength = 100) =>
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  const content = (
    <div className="space-y-2">
      {postArray.length > 0 ? (
        postArray.slice(0, 3).map((p, i) => (
          <div key={i}>
            <div className="font-semibold">{p.title ?? "Untitled"}</div>
            <div className="text-xs text-gray-300">
              {truncate(p.content ?? "No content")}
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-300">No posts</div>
      )}
    </div>
  );

  return (
    <HoverCard title={`${count} post${count === 1 ? "" : "s"}`} content={content}>
      <span className="text-indigo-300">{count}</span>
    </HoverCard>
  );
}
