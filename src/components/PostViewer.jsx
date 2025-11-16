import React from 'react'
import Comments from './Comments'
import Avatar from './Avatar'
import Poll from './Poll'

export default function PostViewer({ post, onClose }) {
  if (!post) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Avatar src={post.author?.avatar_url} alt={post.author?.username} size={56} />
            <div>
              <div className="font-bold">{post.author?.username}</div>
              <div className="text-xs text-[rgb(var(--muted))]">{post.created_at ? new Date(post.created_at).toLocaleString() : ''}</div>
            </div>
            <div className="ml-auto">
              <button onClick={onClose} className="text-sm text-gray-500">Cerrar</button>
            </div>
          </div>

          <div className="mt-4 text-base leading-7">
            {post.content}
          </div>

          {post.image_url && (
            <div className="mt-4">
              <img src={post.image_url} alt="media" className="w-full rounded" />
            </div>
          )}

          {post.poll_id && <Poll pollId={post.poll_id} />}

          <div className="mt-4">
            <Comments postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
