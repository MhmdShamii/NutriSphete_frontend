import { useState, useRef, useEffect } from "react"
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded"
import SendRoundedIcon from "@mui/icons-material/SendRounded"
import GlassCard from "../../components/ui/GlassCard"

type Role = "user" | "assistant"

interface Message {
    id: number
    role: Role
    content: string
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

function ChatMessage({ message }: { message: Message }) {
    const isUser = message.role === "user"

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[72%] px-4 py-2.5 rounded-2xl rounded-br-sm
                    bg-primary text-black/85 text-sm font-medium leading-relaxed shadow-[0_0_12px_rgba(127,250,136,0.25)]">
                    {message.content}
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
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            role: "assistant",
            content: "Hi! I'm your NutriSphere AI. Ask me anything about nutrition, meal planning, or your health goals.",
        },
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const messagesRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const el = messagesRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [messages, loading])

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

    async function handleSend() {
        const text = input.trim()
        if (!text || loading) return

        const userMsg: Message = { id: Date.now(), role: "user", content: text }
        setMessages(prev => [...prev, userMsg])
        setInput("")

        // reset textarea height
        if (inputRef.current) {
            inputRef.current.style.height = "auto"
        }

        setLoading(true)
        try {
            // TODO: replace with real API call
            await new Promise(res => setTimeout(res, 1200))
            const reply: Message = {
                id: Date.now() + 1,
                role: "assistant",
                content: "This is a placeholder response. Connect the AI backend to enable real replies.",
            }
            setMessages(prev => [...prev, reply])
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }

    return (
        <div className="h-full flex flex-col">

            {/* Header */}
            <div className="flex items-center gap-3 flex-shrink-0 mb-4">
                <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20
                        flex items-center justify-center">
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} className="text-primary" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full
                        ring-2 ring-background shadow-[0_0_6px_rgba(127,250,136,0.8)]" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-text">NutriSphere AI</p>
                    <p className="text-xs text-text-muted">Nutrition & health assistant</p>
                </div>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-3xl shadow-xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {loading && <TypingIndicator />}
            </div>

            {/* Input */}
            <GlassCard className="flex items-end gap-3 rounded-2xl px-4 py-3 flex-shrink-0 mt-3">
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
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                        bg-primary text-black/80
                        hover:opacity-90 active:scale-95
                        disabled:opacity-25 disabled:cursor-not-allowed
                        transition-all duration-200"
                    style={{ boxShadow: input.trim() ? "0 0 14px rgba(127,250,136,0.45)" : "none" }}
                >
                    <SendRoundedIcon sx={{ fontSize: 16 }} />
                </button>
            </GlassCard>

        </div>
    )
}
