import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import SendRoundedIcon from "@mui/icons-material/SendRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded"
import type { RootState } from "../../app/store"
import {
    getComments, getReplies, postComment, postReply, deleteComment,
    type Comment,
} from "../../services/comments/commentsApi"
import AvatarUI from "../../components/ui/Avatar"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60)    return `${diff}s`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
}

const Avatar = AvatarUI

// ─── Types ────────────────────────────────────────────────────────────────────

type ReplyState = {
    expanded: boolean
    replies: Comment[] | null   // null = not yet fetched from API
    nextCursor: string | null
    loading: boolean
    count: number
}

type PendingDelete =
    | { type: "comment"; commentId: number }
    | { type: "reply"; commentId: number; replyId: number }

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({
    isReply,
    onConfirm,
    onCancel,
}: {
    isReply: boolean
    onConfirm: () => void
    onCancel: () => void
}) {
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center px-6"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={onCancel}
        >
            <div
                className="w-full max-w-[300px] flex flex-col rounded-2xl overflow-hidden"
                style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    backdropFilter: "blur(28px)",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Icon + text */}
                <div className="flex flex-col items-center gap-3 px-6 pt-6 pb-5">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 22 }} style={{ color: "#ef4444" }} />
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <span className="text-sm font-bold text-text">
                            Delete {isReply ? "reply" : "comment"}?
                        </span>
                        <span className="text-xs text-text-muted leading-relaxed">
                            {isReply
                                ? "This reply will be permanently removed."
                                : "This comment and all its replies will be permanently removed."}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex" style={{ borderTop: "1px solid var(--glass-border)" }}>
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3.5 text-sm font-medium text-text-muted hover:text-text hover:bg-white/5 transition-colors"
                        style={{ borderRight: "1px solid var(--glass-border)" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3.5 text-sm font-semibold transition-colors hover:bg-red-500/10"
                        style={{ color: "#ef4444" }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── CommentItem ─────────────────────────────────────────────────────────────

function CommentItem({
    comment,
    replyState,
    currentUserId,
    onRequestDelete,
    onRequestDeleteReply,
    onReply,
    onExpandReplies,
    onLoadMoreReplies,
    onProfileClick,
}: {
    comment: Comment
    replyState: ReplyState
    currentUserId: number | null
    onRequestDelete: (commentId: number) => void
    onRequestDeleteReply: (commentId: number, replyId: number) => void
    onReply: (commentId: number, authorName: string) => void
    onExpandReplies: (commentId: number) => void
    onLoadMoreReplies: (commentId: number) => void
    onProfileClick: (userId: number) => void
}) {
    const authorName = `${comment.author.first_name} ${comment.author.last_name}`
    const displayedReplies = replyState.replies !== null ? replyState.replies : (comment.reply_preview ?? [])

    return (
        <div className="flex flex-col gap-2">
            {/* Comment row */}
            <div className="flex gap-3">
                <Avatar src={comment.author.avatar} name={authorName} size={34} onClick={() => onProfileClick(comment.author.id)} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 break-words">
                            <span
                                onClick={() => onProfileClick(comment.author.id)}
                                className="text-xs font-semibold text-text hover:text-primary transition-colors cursor-pointer"
                            >{authorName} </span>
                            <span className="text-xs text-text-muted leading-relaxed">{comment.body}</span>
                        </div>
                        {currentUserId === comment.author.id && (
                            <button
                                onClick={() => onRequestDelete(comment.id)}
                                className="flex-shrink-0 p-1 text-text-muted/40 hover:text-red-400 transition-colors"
                            >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-text-muted/50">{timeAgo(comment.created_at)}</span>
                        <button
                            onClick={() => onReply(comment.id, authorName)}
                            className="text-[10px] font-semibold text-text-muted/60 hover:text-text-muted transition-colors"
                        >
                            Reply
                        </button>
                    </div>
                </div>
            </div>

            {/* Replies section */}
            {replyState.count > 0 && (
                <div className="ml-[46px] flex flex-col gap-3">
                    <button
                        onClick={() => onExpandReplies(comment.id)}
                        className="flex items-center gap-1.5 group"
                    >
                        <div className="h-px w-5 bg-text-muted/20" />
                        <span className="text-[10px] font-semibold text-text-muted/50 group-hover:text-text-muted transition-colors">
                            {replyState.expanded
                                ? "Hide replies"
                                : `View all ${replyState.count} ${replyState.count === 1 ? "reply" : "replies"}`}
                        </span>
                    </button>

                    {replyState.expanded && (
                        <>
                            {displayedReplies.map(reply => {
                                const replyName = `${reply.author.first_name} ${reply.author.last_name}`
                                return (
                                    <div key={reply.id} className="flex gap-3">
                                        <Avatar src={reply.author.avatar} name={replyName} size={28} onClick={() => onProfileClick(reply.author.id)} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <span
                                                        onClick={() => onProfileClick(reply.author.id)}
                                                        className="text-xs font-semibold text-text hover:text-primary transition-colors cursor-pointer"
                                                    >{replyName} </span>
                                                    <span className="text-xs text-text-muted leading-relaxed">{reply.body}</span>
                                                </div>
                                                {/* Delete only available on fully loaded replies (not preview) */}
                                                {currentUserId === reply.author.id && replyState.replies !== null && (
                                                    <button
                                                        onClick={() => onRequestDeleteReply(comment.id, reply.id)}
                                                        className="flex-shrink-0 p-1 text-text-muted/40 hover:text-red-400 transition-colors"
                                                    >
                                                        <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-text-muted/50 mt-1 block">
                                                {timeAgo(reply.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}

                            {replyState.loading && (
                                <div className="flex justify-center py-1">
                                    <span className="inline-block w-3.5 h-3.5 border border-primary/30 border-t-primary rounded-full animate-spin" />
                                </div>
                            )}

                            {replyState.nextCursor && !replyState.loading && (
                                <button
                                    onClick={() => onLoadMoreReplies(comment.id)}
                                    className="text-[10px] font-semibold text-text-muted/50 hover:text-text-muted transition-colors"
                                >
                                    Load more replies
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── CommentsSheet ────────────────────────────────────────────────────────────

export default function CommentsSheet({
    mealId,
    mealName,
    onClose,
    onCountChange,
}: {
    mealId: number
    mealName: string
    onClose: () => void
    onCountChange: (delta: number) => void
}) {
    const navigate        = useNavigate()
    const currentUserId   = useSelector((s: RootState) => s.auth.user?.id ?? null)
    const currentAvatar   = useSelector((s: RootState) => s.auth.user?.image.avatar)
    const currentUserName = useSelector((s: RootState) => {
        const u = s.auth.user
        return u ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "You" : "You"
    })

    const [comments,       setComments]       = useState<Comment[]>([])
    const [nextCursor,     setNextCursor]      = useState<string | null>(null)
    const [loading,        setLoading]         = useState(true)
    const [loadingMore,    setLoadingMore]     = useState(false)
    const [replyStates,    setReplyStates]     = useState<Record<number, ReplyState>>({})
    const [replyingTo,     setReplyingTo]      = useState<{ id: number; name: string } | null>(null)
    const [inputText,      setInputText]       = useState("")
    const [submitting,     setSubmitting]      = useState(false)
    const [pendingDelete,  setPendingDelete]   = useState<PendingDelete | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Load initial comments
    useEffect(() => {
        setLoading(true)
        getComments(mealId)
            .then(res => {
                setComments(res.data)
                setNextCursor(res.next_cursor)
                setReplyStates(
                    Object.fromEntries(
                        res.data.map(c => [
                            c.id,
                            { expanded: false, replies: null, nextCursor: null, loading: false, count: c.replies_count ?? 0 },
                        ])
                    )
                )
            })
            .finally(() => setLoading(false))
    }, [mealId])

    // Focus input when reply target is set
    useEffect(() => {
        if (replyingTo) inputRef.current?.focus()
    }, [replyingTo])

    // Escape closes sheet (but not if confirm dialog is open)
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                if (pendingDelete) setPendingDelete(null)
                else onClose()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose, pendingDelete])

    async function loadMore() {
        if (!nextCursor || loadingMore) return
        setLoadingMore(true)
        try {
            const res = await getComments(mealId, nextCursor)
            setComments(prev => [...prev, ...res.data])
            setNextCursor(res.next_cursor)
            setReplyStates(prev => {
                const next = { ...prev }
                for (const c of res.data) {
                    next[c.id] = { expanded: false, replies: null, nextCursor: null, loading: false, count: c.replies_count ?? 0 }
                }
                return next
            })
        } finally {
            setLoadingMore(false)
        }
    }

    async function expandReplies(commentId: number) {
        const state = replyStates[commentId]
        if (!state) return

        if (state.expanded) {
            setReplyStates(prev => ({ ...prev, [commentId]: { ...prev[commentId], expanded: false } }))
            return
        }

        setReplyStates(prev => ({ ...prev, [commentId]: { ...prev[commentId], expanded: true, loading: true } }))
        try {
            const res = await getReplies(mealId, commentId)
            setReplyStates(prev => ({
                ...prev,
                [commentId]: { ...prev[commentId], replies: res.data, nextCursor: res.next_cursor, loading: false },
            }))
        } catch {
            setReplyStates(prev => ({ ...prev, [commentId]: { ...prev[commentId], loading: false } }))
        }
    }

    async function loadMoreReplies(commentId: number) {
        const state = replyStates[commentId]
        if (!state?.nextCursor || state.loading) return
        setReplyStates(prev => ({ ...prev, [commentId]: { ...prev[commentId], loading: true } }))
        try {
            const res = await getReplies(mealId, commentId, state.nextCursor)
            setReplyStates(prev => ({
                ...prev,
                [commentId]: {
                    ...prev[commentId],
                    replies: [...(prev[commentId].replies ?? []), ...res.data],
                    nextCursor: res.next_cursor,
                    loading: false,
                },
            }))
        } catch {
            setReplyStates(prev => ({ ...prev, [commentId]: { ...prev[commentId], loading: false } }))
        }
    }

    async function handleDeleteComment(commentId: number) {
        setComments(prev => prev.filter(c => c.id !== commentId))
        onCountChange(-1)
        try {
            await deleteComment(mealId, commentId)
        } catch {
            onCountChange(1)
            getComments(mealId).then(res => {
                setComments(res.data)
                setNextCursor(res.next_cursor)
            })
        }
    }

    async function handleDeleteReply(commentId: number, replyId: number) {
        setReplyStates(prev => ({
            ...prev,
            [commentId]: {
                ...prev[commentId],
                replies: prev[commentId]?.replies?.filter(r => r.id !== replyId) ?? null,
                count: Math.max(0, (prev[commentId]?.count ?? 0) - 1),
            },
        }))
        try {
            await deleteComment(mealId, replyId)
        } catch {
            getReplies(mealId, commentId).then(res => {
                setReplyStates(prev => ({
                    ...prev,
                    [commentId]: { ...prev[commentId], replies: res.data, nextCursor: res.next_cursor },
                }))
            })
        }
    }

    function confirmDelete() {
        if (!pendingDelete) return
        if (pendingDelete.type === "comment") {
            handleDeleteComment(pendingDelete.commentId)
        } else {
            handleDeleteReply(pendingDelete.commentId, pendingDelete.replyId)
        }
        setPendingDelete(null)
    }

    async function handleSubmit() {
        const text = inputText.trim()
        if (!text || submitting) return
        setSubmitting(true)
        try {
            if (replyingTo) {
                const commentId = replyingTo.id
                await postReply(mealId, commentId, text)
                const res = await getReplies(mealId, commentId)
                setReplyStates(prev => ({
                    ...prev,
                    [commentId]: {
                        ...prev[commentId],
                        expanded: true,
                        replies: res.data,
                        nextCursor: res.next_cursor,
                        loading: false,
                        count: (prev[commentId]?.count ?? 0) + 1,
                    },
                }))
                setReplyingTo(null)
            } else {
                const comment = await postComment(mealId, text)
                setComments(prev => [...prev, comment])
                setReplyStates(prev => ({
                    ...prev,
                    [comment.id]: { expanded: false, replies: null, nextCursor: null, loading: false, count: 0 },
                }))
                onCountChange(1)
            }
            setInputText("")
        } catch {
            // silent — user can retry
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            {pendingDelete && (
                <DeleteConfirmDialog
                    isReply={pendingDelete.type === "reply"}
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDelete(null)}
                />
            )}

            <div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
                onClick={onClose}
            >
                <div
                    className="w-full sm:max-w-lg flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
                    style={{
                        maxHeight: "88vh",
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        backdropFilter: "blur(28px)",
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                        style={{ borderBottom: "1px solid var(--glass-border)" }}
                    >
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-text">Comments</span>
                            <span className="text-[11px] text-text-muted truncate max-w-[220px]">{mealName}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text transition-colors hover:bg-white/5"
                        >
                            <CloseRoundedIcon sx={{ fontSize: 18 }} />
                        </button>
                    </div>

                    {/* Comments list */}
                    <div
                        className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <span className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10">
                                <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 28 }} className="text-text-muted/20" />
                                <span className="text-sm text-text-muted/40">No comments yet. Be the first!</span>
                            </div>
                        ) : (
                            <>
                                {comments.map(comment => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        replyState={replyStates[comment.id] ?? { expanded: false, replies: null, nextCursor: null, loading: false, count: 0 }}
                                        currentUserId={currentUserId}
                                        onRequestDelete={id => setPendingDelete({ type: "comment", commentId: id })}
                                        onRequestDeleteReply={(commentId, replyId) => setPendingDelete({ type: "reply", commentId, replyId })}
                                        onReply={(id, name) => setReplyingTo({ id, name })}
                                        onExpandReplies={expandReplies}
                                        onLoadMoreReplies={loadMoreReplies}
                                        onProfileClick={id => { navigate(`/profile/${id}`); onClose() }}
                                    />
                                ))}

                                {nextCursor && (
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="text-xs text-text-muted/50 hover:text-text-muted transition-colors text-center py-2 disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <span className="inline-block w-4 h-4 border border-primary/30 border-t-primary rounded-full animate-spin" />
                                        ) : (
                                            "Load more comments"
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Replying-to banner */}
                    {replyingTo && (
                        <div
                            className="flex items-center justify-between px-4 py-2 flex-shrink-0"
                            style={{ borderTop: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.03)" }}
                        >
                            <span className="text-[11px] text-text-muted">
                                Replying to{" "}
                                <span className="font-semibold text-text">{replyingTo.name}</span>
                            </span>
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="p-1 rounded-lg text-text-muted hover:text-text transition-colors"
                            >
                                <CloseRoundedIcon sx={{ fontSize: 14 }} />
                            </button>
                        </div>
                    )}

                    {/* Input bar */}
                    <div
                        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                        style={{ borderTop: replyingTo ? undefined : "1px solid var(--glass-border)" }}
                    >
                        <Avatar src={currentAvatar} name={currentUserName} size={32} />
                        <input
                            ref={inputRef}
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder={replyingTo ? `Reply to ${replyingTo.name}…` : "Add a comment…"}
                            maxLength={1000}
                            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted/40 outline-none"
                            onKeyDown={e => {
                                if (e.key === "Enter" && inputText.trim() && !submitting) handleSubmit()
                            }}
                        />
                        {inputText.trim() && (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-shrink-0 transition-all active:scale-90 disabled:opacity-50"
                                style={{ color: "var(--primary)" }}
                            >
                                {submitting ? (
                                    <span className="inline-block w-4 h-4 border border-primary/30 border-t-primary rounded-full animate-spin" />
                                ) : (
                                    <SendRoundedIcon sx={{ fontSize: 18 }} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
