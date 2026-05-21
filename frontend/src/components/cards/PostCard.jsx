export function PostCard({ post }) {
  return (
    <div className="post-card" data-testid="post-card">
      <div className="post-author">{post.author_name}</div>
      <div className="post-content">{post.content}</div>
      <div className="post-time">{new Date(post.created_at).toLocaleDateString()}</div>
    </div>
  );
}
