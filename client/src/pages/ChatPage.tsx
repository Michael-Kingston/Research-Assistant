import { useState, useRef, useEffect } from "react"
import { FileText, Loader2, User, Search, CornerDownLeft, X, ExternalLink, BookOpen, ChevronDown } from "lucide-react"
import axios from "axios"
import { useSearchParams } from "react-router-dom"
import { cn } from "../lib/utils"
import { useDocuments } from "../contexts/DocumentContext"
import { useSettings } from "../contexts/SettingsContext"

interface Source {
    source: string
    content: string
    page?: number
}

interface Message {
    role: "user" | "assistant"
    content: string
    sources?: Source[]
}

const API_BASE = "http://localhost:8001"

export default function ChatPage() {
    const { documents } = useDocuments()
    const { complexity, setComplexity } = useSettings()
    const [searchParams] = useSearchParams()

    const activeDocsCount = documents.filter(d => d.active).length
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isQuerying, setIsQuerying] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [selectedSource, setSelectedSource] = useState<Source | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Load session if provided in URL
    useEffect(() => {
        const sid = searchParams.get("session")
        if (sid) {
            setSessionId(sid)
            fetchSession(sid)
        }
    }, [searchParams])

    const fetchSession = async (id: string) => {
        try {
            const response = await axios.get(`${API_BASE}/history`)
            const sessions = response.data
            const session = sessions.find((s: any) => s.id === id)
            if (session) {
                setMessages(session.messages.map((m: any) => ({
                    role: m.role,
                    content: m.content
                })))
            }
        } catch (err) {
            console.error("Failed to fetch session details:", err)
        }
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isQuerying])

    const handleQuery = async () => {
        if (!input.trim() || isQuerying) return

        const userMessage: Message = { role: "user", content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsQuerying(true)

        try {
            const activeNames = documents.filter(d => d.active).map(d => d.name)
            const response = await axios.post(`${API_BASE}/query`, {
                question: userMessage.content,
                active_names: activeNames,
                complexity: complexity,
                session_id: sessionId
            })

            if (response.data.session_id && !sessionId) {
                setSessionId(response.data.session_id)
            }

            const assistantMessage: Message = {
                role: "assistant",
                content: response.data.answer,
                sources: response.data.sources
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (err) {
            console.error(err)
            setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to process research query. Please check server status." }])
        } finally {
            setIsQuerying(false)
        }
    }

    return (
        <div className="flex h-full bg-slate-50/50 overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-8"
                >
                    {messages.length === 0 && (
                        <div className="max-w-2xl mx-auto mt-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Search className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">Academic Assistant</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Analyze your research corpus using RAG. Ask questions about methodology, results, or citations.
                            </p>

                            <div className="grid grid-cols-2 gap-3 mt-10 max-w-md mx-auto">
                                {["Summarize key findings", "Analyze methodology", "Extract statistics", "Cross-reference results"].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="px-4 py-2 text-xs font-medium border border-border bg-card rounded hover:bg-secondary transition-colors text-left truncate"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex gap-4 max-w-4xl mx-auto animate-in fade-in duration-300",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === "assistant" && (
                                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center shrink-0 border border-border">
                                    <Search className="h-4 w-4 text-primary-foreground" />
                                </div>
                            )}

                            <div className={cn(
                                "space-y-4 px-5 py-4 rounded-lg border shadow-sm max-w-[85%]",
                                msg.role === "user"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-foreground border-border"
                            )}>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.content}
                                </div>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="pt-4 mt-4 border-t border-border/50">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-3 text-left">
                                            References & Sources
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {msg.sources.map((s, si) => (
                                                <button
                                                    key={si}
                                                    onClick={() => setSelectedSource(s)}
                                                    className={cn(
                                                        "bg-secondary/50 border border-border/50 rounded p-2 flex items-center gap-2 group transition-all hover:bg-secondary hover:border-primary/30 text-left",
                                                        selectedSource?.content === s.content && "border-primary bg-secondary ring-1 ring-primary/20"
                                                    )}
                                                >
                                                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-medium truncate leading-tight uppercase tracking-tight">{s.source}</p>
                                                        <p className="text-[10px] text-muted-foreground">Page {s.page || 'N/A'}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {msg.role === "user" && (
                                <div className="h-8 w-8 rounded bg-slate-200 flex items-center justify-center shrink-0 border border-border">
                                    <User className="h-4 w-4 text-slate-600" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isQuerying && (
                        <div className="flex gap-4 max-w-4xl mx-auto items-start">
                            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center shrink-0 border border-border">
                                <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                            </div>
                            <div className="h-10 w-24 bg-card border border-border rounded-lg flex items-center justify-center shadow-sm">
                                <span className="flex space-x-1">
                                    <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                    <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                    <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t bg-card">
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <textarea
                                    rows={1}
                                    placeholder="Interrogate data context..."
                                    className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-all shadow-inner text-sm"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleQuery()
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleQuery}
                                    disabled={isQuerying || !input.trim()}
                                    className="absolute right-2 top-2 h-8 w-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    {isQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
                                </button>
                            </div>

                            <div className="relative group shrink-0">
                                <select
                                    value={complexity}
                                    onChange={(e) => setComplexity(e.target.value)}
                                    className="appearance-none bg-secondary/50 border border-border rounded-lg px-4 py-3 pr-10 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all hover:bg-secondary"
                                >
                                    {["Middle School", "High-School", "Undergraduate", "Post Graduate", "Researcher"].map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex justify-between px-1">
                            <p className="text-[10px] text-muted-foreground">
                                <kbd className="px-1 py-0.5 rounded border border-border bg-secondary">Enter</kbd> to send • <kbd className="px-1 py-0.5 rounded border border-border bg-secondary">Shift+Enter</kbd> for newline
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                    Context: <span className="text-primary font-medium">{activeDocsCount} {activeDocsCount === 1 ? 'Document' : 'Documents'}</span>
                                </span>
                                <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                <span className="flex items-center gap-1">
                                    Complexity: <span className="text-primary font-medium">{complexity}</span>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Source Inspector Sidebar */}
            {selectedSource && (
                <div className="w-80 border-l bg-card flex flex-col animate-in slide-in-from-right-full duration-300 shadow-2xl z-10">
                    <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Source Inspector
                        </h3>
                        <button
                            onClick={() => setSelectedSource(null)}
                            className="p-1 hover:bg-secondary rounded-md"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold truncate leading-tight">{selectedSource.source}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-tighter">Page {selectedSource.page || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50/50 border border-border rounded-lg relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
                                <p className="text-xs leading-relaxed text-slate-700 font-serif italic">
                                    "{selectedSource.content}"
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t space-y-4">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</h5>
                            <div className="grid grid-cols-1 gap-2">
                                <button className="flex items-center justify-between w-full px-3 py-2 text-xs border border-border rounded hover:bg-secondary transition-colors font-medium">
                                    View Original PDF
                                    <ExternalLink className="h-3 w-3" />
                                </button>
                                <button className="flex items-center justify-between w-full px-3 py-2 text-xs border border-border rounded hover:bg-secondary transition-colors font-medium">
                                    Copy Snippet
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-slate-50/50">
                        <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
                            Grounded research citations ensure scientific integrity. Always verify snippets with the original document.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
