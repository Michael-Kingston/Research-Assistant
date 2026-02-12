import { useLocation, Link } from "react-router-dom"
import { LayoutDashboard, BarChart3, Upload, FileText, ChevronRight, Settings, LogOut, Search, Loader2, Clock, Plus } from "lucide-react"
import { cn } from "../lib/utils"
import { useDocuments } from "../contexts/DocumentContext"
import { useSettings } from "../contexts/SettingsContext"
import SettingsModal from "./SettingsModal"

interface SidebarItemProps {
    icon: React.ElementType
    label: string
    href: string
    active?: boolean
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => (
    <Link
        to={href}
        className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
            active
                ? "bg-secondary text-primary ring-1 ring-border"
                : "text-muted-foreground hover:bg-secondary hover:text-primary"
        )}
    >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
    </Link>
)

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation()
    const { documents, toggleDocumentActive, isLoading } = useDocuments()
    const { complexity, isSettingsOpen, setIsSettingsOpen, setComplexity } = useSettings()

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card flex flex-col shrink-0">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
                        <Search className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold tracking-tight text-lg">Researcher.ai</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
                        <span>Navigation</span>
                    </div>
                    <Link
                        to="/"
                        className="flex items-center gap-2 w-full px-3 py-2 mb-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        New Research Chat
                    </Link>
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Chat Dashboard"
                        href="/"
                        active={location.pathname === "/"}
                    />
                    <SidebarItem
                        icon={Upload}
                        label="Upload Knowledge"
                        href="/upload"
                        active={location.pathname === "/upload"}
                    />
                    <SidebarItem
                        icon={BarChart3}
                        label="Statistics"
                        href="/statistics"
                        active={location.pathname === "/statistics"}
                    />
                    <SidebarItem
                        icon={Clock}
                        label="Chat History"
                        href="/history"
                        active={location.pathname === "/history"}
                    />

                    <div className="pt-8 mb-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
                            <span>RAG Context</span>
                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border">
                                {documents.filter(d => d.active).length} Active
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {isLoading && documents.length === 0 ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        ) : documents.map(doc => (
                            <button
                                key={doc.name}
                                onClick={() => toggleDocumentActive(doc.name)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors text-left",
                                    doc.active
                                        ? "text-primary bg-secondary/50 font-medium"
                                        : "text-muted-foreground hover:bg-secondary/30"
                                )}
                            >
                                <FileText className={cn("h-3.5 w-3.5 shrink-0", doc.active ? "text-primary" : "text-muted-foreground/50")} />
                                <span className="truncate">{doc.name}</span>
                                <div className={cn(
                                    "ml-auto h-1.5 w-1.5 rounded-full shrink-0",
                                    doc.active ? "bg-primary" : "bg-transparent"
                                )} />
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t bg-secondary/30">
                    <div
                        onClick={() => alert("User: Professional Researcher\nPlan: Enterprise Access\nStatus: Active (Professional)")}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-secondary rounded-md transition-colors"
                    >
                        <div className="h-8 w-8 rounded-full bg-slate-200 border border-border flex items-center justify-center text-xs font-medium">
                            JS
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-medium truncate">Professional Plan</p>
                            <p className="text-[10px] text-muted-foreground truncate">$10/month subscription</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background">
                {/* Header */}
                <header className="h-16 border-b flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-semibold text-muted-foreground">
                            {location.pathname === "/" ? "Dashboard" : location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.slice(2)}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Settings className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    {children}
                </div>

                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    complexity={complexity}
                    setComplexity={setComplexity}
                />
            </main>
        </div>
    )
}
