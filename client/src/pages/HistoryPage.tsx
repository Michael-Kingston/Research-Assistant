import { useState, useEffect } from "react"
import { MessageSquare, Clock, Trash2, ChevronRight, Loader2, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

interface ChatMessage {
    role: string
    content: string
    timestamp?: string
}

interface ChatSession {
    id: string
    title: string
    messages: ChatMessage[]
    date: string
}

export default function HistoryPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await fetch("http://localhost:8001/history")
            const data = await response.json()
            setSessions(data)
        } catch (error) {
            console.error("Failed to fetch history:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const deleteSession = async (id: string) => {
        try {
            await fetch(`http://localhost:8001/history/${id}`, { method: "DELETE" })
            setSessions(sessions.filter(s => s.id !== id))
        } catch (error) {
            console.error("Failed to delete session:", error)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Chat History</h1>
                    <p className="text-muted-foreground italic">Review and revisit your previous research conversations.</p>
                </div>
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                    <p className="text-sm text-muted-foreground">Loading your history...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="bg-card border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">No history found</h3>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            Your research conversations will appear here once you start chatting with the assistant.
                        </p>
                    </div>
                    <Link to="/" className="mt-2 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                        <ArrowLeft className="h-4 w-4" />
                        Start your first chat
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="bg-card border rounded-xl overflow-hidden hover:ring-1 hover:ring-primary/20 transition-all group"
                        >
                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-medium truncate pr-4">{session.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {session.date}
                                            </span>
                                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                            <span>{session.messages.length} messages</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => deleteSession(session.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <Link
                                        to={`/?session=${session.id}`}
                                        className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
