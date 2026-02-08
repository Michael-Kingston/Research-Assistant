import { useState } from "react"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Trash2, Database, Search } from "lucide-react"
import axios from "axios"
import { cn } from "../lib/utils"
import { useDocuments } from "../contexts/DocumentContext"

const API_BASE = "http://localhost:8000"

export default function UploadPage() {
    const { documents, fetchDocuments, deleteDocument, isLoading: isFetching } = useDocuments()
    const [isUploading, setIsUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            await axios.post(`${API_BASE}/upload`, formData)
            await fetchDocuments() // Refresh global state
        } catch (err) {
            console.error(err)
            alert("Failed to upload research document.")
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from the research corpus?`)) return
        try {
            await deleteDocument(name)
        } catch (err) {
            alert("Failed to delete document.")
        }
    }

    return (
        <div className="p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex items-end justify-between border-b pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Knowledge Ingestion</h2>
                    <p className="text-muted-foreground mt-1">Populate your research corpus with authoritative PDF documents.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vector Store</p>
                        <p className="text-sm font-medium flex items-center gap-1.5 justify-end mt-0.5">
                            <Database className="h-3.5 w-3.5 text-primary" />
                            Standard-Index-01
                        </p>
                    </div>
                    <div className="w-px h-10 bg-border"></div>
                    <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                        <p className="text-sm font-medium text-emerald-600 mt-0.5 flex items-center gap-1.5 justify-end">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Synchronized
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-6">
                    <label className={cn(
                        "group relative flex flex-col items-center justify-center h-64 w-full border-2 border-dashed rounded-xl transition-all cursor-pointer bg-card hover:border-primary hover:bg-slate-50/50",
                        isUploading ? "pointer-events-none opacity-50" : "border-border"
                    )}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploading ? (
                                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                            ) : (
                                <div className="p-4 bg-secondary border border-border rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                            )}
                            <p className="mb-2 text-sm font-semibold">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">Authoritative PDF Research (MAX. 50MB)</p>
                        </div>
                        <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={isUploading} />
                    </label>

                    <div className="bg-secondary/30 border border-border rounded-lg p-5 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            Ingestion Guidelines
                        </h3>
                        <ul className="text-xs space-y-3 text-muted-foreground leading-relaxed">
                            <li className="flex gap-2">
                                <span className="font-bold text-primary">•</span>
                                Ensure text is machine-readable (OCR-capable).
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-primary">•</span>
                                Scientific journals and whitepapers preferred.
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-primary">•</span>
                                Encrypted or password-protected files will be rejected.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-tight">Active Corpus ({documents.length} Documents)</h3>
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-muted-foreground uppercase bg-slate-50/30 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Document Name</th>
                                        <th className="px-6 py-3 font-semibold text-center">Size</th>
                                        <th className="px-6 py-3 font-semibold text-center">Date Added</th>
                                        <th className="px-6 py-3 font-semibold text-center">Status</th>
                                        <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y border-b">
                                    {isFetching && documents.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                                                <p className="text-xs text-muted-foreground">Synchronizing knowledge base...</p>
                                            </td>
                                        </tr>
                                    ) : documents.map((doc) => (
                                        <tr key={doc.name} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <span className="font-medium truncate max-w-[200px]">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-muted-foreground">{doc.size}</td>
                                            <td className="px-6 py-4 text-center text-muted-foreground font-mono text-[10px]">{doc.date}</td>
                                            <td className="px-6 py-4 text-center text-xs">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full font-medium border",
                                                    doc.status === "Processing"
                                                        ? "bg-blue-100 text-blue-700 border-blue-200 animate-pulse"
                                                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                )}>
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(doc.name)}
                                                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {documents.length === 0 && !isFetching && (
                            <div className="py-20 text-center text-muted-foreground italic text-sm">
                                No documents in the current corpus.
                            </div>
                        )}
                        <div className="px-6 py-3 bg-slate-50/30 text-[10px] font-medium text-muted-foreground flex justify-between uppercase tracking-wider">
                            <span>Current Capacity: 15%</span>
                            <span className="text-primary">Upgrade Storage Plan</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
