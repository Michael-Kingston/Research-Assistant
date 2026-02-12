import { createContext, useContext, useState, type ReactNode } from "react"

interface SettingsContextType {
    complexity: string
    setComplexity: (val: string) => void
    isSettingsOpen: boolean
    setIsSettingsOpen: (val: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [complexity, setComplexity] = useState("Undergraduate")
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    return (
        <SettingsContext.Provider value={{ complexity, setComplexity, isSettingsOpen, setIsSettingsOpen }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider")
    }
    return context
}
