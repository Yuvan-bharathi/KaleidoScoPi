/**
 * CommentSection Component
 * Unified comment system with nested replies and likes
 * Instagram-inspired UX with children-friendly styling
 */
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Heart, MessageSquare, MoreVertical, Trash2, Edit2, Send } from 'lucide-react';
import { useFirebaseComments, ContentType, Comment } from '@/hooks/useFirebaseComments';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface CommentSectionProps {
  contentType: ContentType;
  contentId: string;
  className?: string;
}

/**
 * Individual comment component with nested reply support
 */
const CommentItem = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  currentUserId,
}: {
  comment: Comment;
  onReply: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
  currentUserId: string | undefined;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);

  const handleSaveEdit = () => {
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const isOwner = currentUserId === comment.user_id;

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 bg-primary/20">
          <AvatarFallback className="bg-primary/20 text-primary text-sm">
            {comment.user_id.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 rounded-2xl px-4 py-2">
                <p className="text-sm text-foreground break-words">{comment.content}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
                
                <button
                  onClick={() => onLike(comment.id)}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Heart
                    className={`h-3 w-3 ${comment.isLiked ? 'fill-primary text-primary' : ''}`}
                  />
                  {comment.likes_count > 0 && (
                    <span className="font-medium">{comment.likes_count}</span>
                  )}
                </button>

                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Reply
                  {comment.replies_count > 0 && (
                    <span className="font-medium">({comment.replies_count})</span>
                  )}
                </button>

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hover:text-primary transition-colors">
                        <MoreVertical className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
              {showReplies ? (
                <>
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onLike={onLike}
                      currentUserId={currentUserId}
                    />
                  ))}
                  <button
                    onClick={() => setShowReplies(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hide replies
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowReplies(true)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Main CommentSection Component
 */
export const CommentSection = ({ contentType, contentId, className = '' }: CommentSectionProps) => {
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const {
    comments,
    loading,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
  } = useFirebaseComments(contentType, contentId);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    await createComment(newComment);
    setNewComment('');
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    await createComment(replyContent, parentId);
    setReplyContent('');
    setReplyingTo(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* New Comment Input */}
      {user ? (
        <Card className="p-4 bg-card/50">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 bg-primary/20">
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {user.displayName?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'AN'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {newComment.length}/1000
                </span>
                <Button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center bg-muted/30">
          <p className="text-muted-foreground mb-4">Sign in to join the conversation</p>
          <Button onClick={() => navigate('/auth')} variant="outline">
            Sign In
          </Button>
        </Card>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={(commentId) => setReplyingTo(commentId)}
                onEdit={updateComment}
                onDelete={deleteComment}
                onLike={toggleLike}
                currentUserId={user?.uid}
              />

              {/* Reply Input */}
              {replyingTo === comment.id && user && (
                <div className="mt-3 ml-11 flex gap-3">
                  <Avatar className="h-6 w-6 bg-primary/20">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {user.displayName?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'AN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[60px] text-sm"
                      maxLength={500}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handlePostReply(comment.id)}>
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
