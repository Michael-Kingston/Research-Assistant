import { X, Check } from "lucide-react"
import { cn } from "../lib/utils"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    complexity: string
    setComplexity: (val: string) => void
}

const levels = ["Middle School", "High-School", "Undergraduate", "Post Graduate", "Researcher"]

export default function SettingsModal({ isOpen, onClose, complexity, setComplexity }: SettingsModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-xl border shadow-2xl overflow-hidden aspect-video flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-lg text-primary">Settings</h2>
                    <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-auto">
                    <section className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Default Complexity Level
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {levels.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setComplexity(level)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                                        complexity === level
                                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                                            : "hover:bg-secondary/50 border-border text-muted-foreground"
                                    )}
                                >
                                    <span className="text-sm font-medium">{level}</span>
                                    {complexity === level && <Check className="h-4 w-4" />}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This level will be used by default for all new research queries.
                        </p>
                    </section>
                </div>

                <div className="p-4 bg-secondary/30 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
