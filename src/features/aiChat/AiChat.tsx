import { useState, useRef, useEffect } from "react"
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded"
import SendRoundedIcon from "@mui/icons-material/SendRounded"
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import GlassCard from "../../components/ui/GlassCard"
import { sendChatMessageApi, getChatHistoryApi } from "../../services/cahtbot/chatApi"

type Role = "user" | "assistant"

interface Message {
    id: number
    role: Role
    content: string
    images?: string[]
}

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <AutoAwesomeRoundedIcon sx={{ fontSize: 12 }} className="text-primary" />
            </div>
            <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl rounded-bl-sm"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    )
}

function MessageImages({ images }: { images: string[] }) {
    const [lightbox, setLightbox] = useState<string | null>(null)

    const grid =
        images.length === 1 ? "grid-cols-1" :
        images.length === 2 ? "grid-cols-2" :
        "grid-cols-2"

    return (
        <>
            <div className={`grid ${grid} gap-1.5`}>
                {images.map((src, i) => (
                    <div
                        key={i}
                        onClick={() => setLightbox(src)}
                        className={`overflow-hidden cursor-zoom-in ${images.length === 3 && i === 2 ? "col-span-2" : ""}`}
                        style={{ borderRadius: 10 }}
                    >
                        <img
                            src={src}
                            alt=""
                            className="w-full object-cover"
                            style={{ maxHeight: images.length === 1 ? 260 : 160 }}
                        />
                    </div>
                ))}
            </div>

            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        onClick={() => setLightbox(null)}
                    >
                        <CloseRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                    <img
                        src={lightbox}
                        alt=""
                        className="max-w-full max-h-full rounded-2xl object-contain"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    )
}

function ChatMessage({ message }: { message: Message }) {
    const isUser = message.role === "user"

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[72%] flex flex-col gap-1.5">
                    {message.images && message.images.length > 0 && (
                        <MessageImages images={message.images} />
                    )}
                    {message.content && (
                        <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-primary text-black/85
                            text-sm font-medium leading-relaxed shadow-[0_0_12px_rgba(127,250,136,0.25)]">
                            {message.content}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <AutoAwesomeRoundedIcon sx={{ fontSize: 12 }} className="text-primary" />
            </div>
            <div className="max-w-[72%] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-text leading-relaxed"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                {message.content}
            </div>
        </div>
    )
}

export default function AiChat() {
    const [messages, setMessages]           = useState<Message[]>([])
    const [input, setInput]                 = useState("")
    const [attachedImages, setAttachedImages] = useState<{ file: File; url: string }[]>([])
    const [loading, setLoading]             = useState(false)
    const [historyLoading, setHistoryLoading] = useState(true)
    const [cursor, setCursor]               = useState<string | null>(null)
    const [hasMore, setHasMore]             = useState(false)

    const messagesRef  = useRef<HTMLDivElement>(null)
    const inputRef     = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load history on mount — newest-first from API, so reverse for display
    useEffect(() => {
        getChatHistoryApi()
            .then(res => {
                const sorted = [...res.data].reverse()
                setMessages(sorted.map(m => ({ id: m.id, role: m.role, content: m.content })))
                setCursor(res.meta.next_cursor)
                setHasMore(res.meta.has_more)
            })
            .catch(() => {
                setMessages([{
                    id: 0,
                    role: "assistant",
                    content: "Hi! I'm your NutriSphere AI. Ask me anything about nutrition, meal planning, or your health goals.",
                }])
            })
            .finally(() => setHistoryLoading(false))
    }, [])

    // Scroll to bottom after history loads or new message
    useEffect(() => {
        if (historyLoading) return
        const el = messagesRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [messages, loading, historyLoading])

    // Revoke object URLs on unmount
    useEffect(() => {
        return () => attachedImages.forEach(img => URL.revokeObjectURL(img.url))
    }, [])

    async function loadOlderMessages() {
        if (!cursor || !hasMore) return
        const el = messagesRef.current
        const prevScrollHeight = el?.scrollHeight ?? 0

        try {
            const res = await getChatHistoryApi(cursor)
            const older = [...res.data].reverse()
            setMessages(prev => [
                ...older.map(m => ({ id: m.id, role: m.role, content: m.content })),
                ...prev,
            ])
            setCursor(res.meta.next_cursor)
            setHasMore(res.meta.has_more)

            // Keep scroll position stable after prepending
            requestAnimationFrame(() => {
                if (!el) return
                el.scrollTop = el.scrollHeight - prevScrollHeight
            })
        } catch {
            // silently ignore
        }
    }

    function handleScroll() {
        const el = messagesRef.current
        if (!el || el.scrollTop > 60) return
        loadOlderMessages()
    }

    function autoResize() {
        const el = inputRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${Math.min(el.scrollHeight, 112)}px`
    }

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setInput(e.target.value)
        autoResize()
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? [])
        const images = files
            .filter(f => f.type.startsWith("image/"))
            .slice(0, 4 - attachedImages.length)
            .map(file => ({ file, url: URL.createObjectURL(file) }))
        setAttachedImages(prev => [...prev, ...images].slice(0, 4))
        e.target.value = ""
    }

    function removeImage(index: number) {
        setAttachedImages(prev => {
            URL.revokeObjectURL(prev[index].url)
            return prev.filter((_, i) => i !== index)
        })
    }

    async function handleSend() {
        const text = input.trim()
        if ((!text && attachedImages.length === 0) || loading) return

        const imageUrls = attachedImages.map(img => img.url)
        const userMsg: Message = {
            id: Date.now(),
            role: "user",
            content: text,
            images: imageUrls.length > 0 ? imageUrls : undefined,
        }

        setMessages(prev => [...prev, userMsg])
        setInput("")
        setAttachedImages([])
        if (inputRef.current) inputRef.current.style.height = "auto"

        setLoading(true)
        try {
            const reply = await sendChatMessageApi(text)
            setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: reply }])
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: "assistant",
                content: "Something went wrong. Please try again.",
            }])
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }

    const canSend = (input.trim().length > 0 || attachedImages.length > 0) && !loading

    return (
        <div className="h-full flex flex-col">

            {/* Header */}
            <div className="flex items-center gap-3 flex-shrink-0 mb-4">
                <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} className="text-primary" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background shadow-[0_0_6px_rgba(127,250,136,0.8)]" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-text">NutriSphere AI</p>
                    <p className="text-xs text-text-muted">Nutrition & health assistant</p>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-3xl shadow-xl"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
            >
                {historyLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <>
                        {hasMore && (
                            <button
                                onClick={loadOlderMessages}
                                className="self-center text-xs text-text-muted hover:text-primary transition-colors py-1"
                            >
                                Load older messages
                            </button>
                        )}
                        {messages.map(msg => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
                        {loading && <TypingIndicator />}
                    </>
                )}
            </div>

            {/* Input */}
            <GlassCard className="flex flex-col rounded-2xl px-4 pt-3 pb-3 flex-shrink-0 mt-3 gap-2">

                {/* Image previews */}
                {attachedImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {attachedImages.map((img, i) => (
                            <div key={i} className="relative group">
                                <img
                                    src={img.url}
                                    alt=""
                                    className="w-16 h-16 rounded-xl object-cover"
                                    style={{ border: "1px solid var(--glass-border)" }}
                                />
                                <button
                                    onClick={() => removeImage(i)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white
                                        flex items-center justify-center opacity-0 group-hover:opacity-100
                                        transition-opacity duration-150"
                                >
                                    <CloseRoundedIcon sx={{ fontSize: 12 }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Textarea row */}
                <div className="flex items-end gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={attachedImages.length >= 4}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                            text-text-muted hover:text-primary hover:bg-primary/10
                            disabled:opacity-30 disabled:cursor-not-allowed
                            transition-all duration-200"
                    >
                        <AddPhotoAlternateRoundedIcon sx={{ fontSize: 18 }} />
                    </button>

                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about nutrition, meals, goals…"
                        className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted/40
                            outline-none resize-none leading-relaxed py-0.5 overflow-y-auto"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!canSend}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                            bg-primary text-black/80
                            hover:opacity-90 active:scale-95
                            disabled:opacity-25 disabled:cursor-not-allowed
                            transition-all duration-200"
                        style={{ boxShadow: canSend ? "0 0 14px rgba(127,250,136,0.45)" : "none" }}
                    >
                        <SendRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                </div>
            </GlassCard>

        </div>
    )
}
