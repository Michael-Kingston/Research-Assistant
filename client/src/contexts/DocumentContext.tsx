import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import axios from "axios"

const API_BASE = "http://localhost:8001"

export interface Document {
    name: string
    size: string
    status: string
    date: string
    active?: boolean // Local UI state for context toggle
}

interface DocumentContextType {
    documents: Document[]
    isLoading: boolean
    fetchDocuments: () => Promise<void>
    toggleDocumentActive: (name: string) => void
    deleteDocument: (name: string) => Promise<void>
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(`${API_BASE}/documents`)
            setDocuments(prev => {
                // Preserve "active" state from previous documents if they exist
                const updatedDocs = response.data.map((newDoc: any) => {
                    const existing = prev.find(p => p.name === newDoc.name)
                    return { ...newDoc, active: existing ? existing.active : true }
                })
                return updatedDocs
            })
        } catch (err) {
            console.error("Failed to fetch documents:", err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const toggleDocumentActive = (name: string) => {
        setDocuments(prev => prev.map(doc =>
            doc.name === name ? { ...doc, active: !doc.active } : doc
        ))
    }

    const deleteDocument = async (name: string) => {
        try {
            await axios.delete(`${API_BASE}/documents/${name}`)
            setDocuments(prev => prev.filter(doc => doc.name !== name))
        } catch (err) {
            console.error("Failed to delete document:", err)
            throw err
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    return (
        <DocumentContext.Provider value={{
            documents,
            isLoading,
            fetchDocuments,
            toggleDocumentActive,
            deleteDocument
        }}>
            {children}
        </DocumentContext.Provider>
    )
}

export const useDocuments = () => {
    const context = useContext(DocumentContext)
    if (context === undefined) {
        throw new Error("useDocuments must be used within a DocumentProvider")
    }
    return context
}
