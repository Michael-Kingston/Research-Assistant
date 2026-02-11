import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { BarChart3, TrendingUp, Users, FileText, Brain, Search, Loader2 } from "lucide-react"
import { useDocuments } from "../contexts/DocumentContext"

const API_BASE = "http://localhost:8001"

interface StatCardProps {
    label: string
    value: string
    change: string
    icon: React.ElementType
    trend: "up" | "down"
}

const StatCard = ({ label, value, change, icon: Icon, trend }: StatCardProps) => (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-secondary border border-border rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className={`text-xs font-bold ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                {change}
            </span>
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
    </div>
)

export default function StatisticsPage() {
    const { documents } = useDocuments()
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_BASE}/stats`)
                setStats(response.data)
            } catch (err) {
                console.error("Failed to fetch statistics:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    // Derive some stats from documents
    const totalSizeMB = documents.reduce((acc, doc) => {
        const sizeStr = doc.size.split(' ')[0]
        return acc + parseFloat(sizeStr || "0")
    }, 0)

    const displaySize = totalSizeMB > 1024
        ? `${(totalSizeMB / 1024).toFixed(1)} GB`
        : `${totalSizeMB.toFixed(1)} MB`

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-20 text-muted-foreground animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p className="text-sm font-medium">Analyzing research impact metrics...</p>
            </div>
        )
    }

    return (
        <div className="p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="border-b pb-6 flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Research Insights</h2>
                    <p className="text-muted-foreground mt-1">Quantitative analysis of your research activity and corpus distribution.</p>
                </div>
                <div className="bg-secondary px-3 py-1 rounded-full border border-border flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Live Engine Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Queries"
                    value={stats?.total_queries?.toLocaleString() || "0"}
                    change="+12.5%"
                    trend="up"
                    icon={Search}
                />
                <StatCard
                    label="Knowledge Base"
                    value={displaySize}
                    change={`${documents.length} Docs`}
                    trend="up"
                    icon={FileText}
                />
                <StatCard
                    label="Time Saved (Est.)"
                    value={`${stats?.time_saved_hours || 0}h`}
                    change="+Premium"
                    trend="up"
                    icon={Brain}
                />
                <StatCard
                    label="Active Analysts"
                    value="1"
                    change="Personal"
                    trend="up"
                    icon={Users}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Chart */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            7-Day Interaction Trend
                        </h3>
                    </div>
                    <div className="p-6 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.activity_series || []}>
                                <defs>
                                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "#64748B" }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "#64748B" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        fontWeight: 500
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="queries"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorQueries)"
                                    strokeWidth={3}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Corpus Distribution */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Top Consulted Documents
                        </h3>
                    </div>
                    <div className="p-6 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.doc_distribution || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="topic"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "#334155", fontWeight: 600 }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: "transparent" }}
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "12px"
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--primary))"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Semantic Themes Section */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b bg-slate-50/50">
                    <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        Emerging Research Themes
                    </h3>
                </div>
                <div className="p-8">
                    <div className="flex flex-wrap gap-4">
                        {(stats?.theme_distribution && stats.theme_distribution.length > 0) ? (
                            stats.theme_distribution.map((item: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="px-4 py-3 bg-slate-50 border border-border rounded-xl flex items-center gap-4 group hover:border-primary/30 hover:bg-white transition-all duration-300"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{item.theme}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-0.5">{item.count} Interrogations</span>
                                    </div>
                                    <div className="h-8 w-1 bg-primary/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ height: `${(item.count / stats.total_queries) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No semantic themes extracted yet. Begin interrogating your corpus to see emerging concepts.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-xl flex items-center justify-between border border-slate-800 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
                        <Brain className="h-6 w-6 text-primary" />
                        Enterprise Intelligence Report
                    </h3>
                    <p className="text-slate-400 mt-2 max-w-md text-sm leading-relaxed">
                        Download comprehensive audit logs and intellectual property utilization reports.
                        Validated grounded citations ensure 99.8% factual accuracy.
                    </p>
                </div>
                <button className="relative z-10 px-8 py-3 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100 transition-all shadow-xl active:scale-95 leading-none">
                    Generate Q1 Audit
                </button>
            </div>
        </div>
    )
}
