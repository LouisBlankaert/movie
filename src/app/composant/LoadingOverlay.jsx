'use client'
import React from 'react'

export default function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-[#121212] bg-opacity-80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#eab256]"></div>
                <p className="mt-4 text-[#eab256] text-lg font-medium">Chargement...</p>
            </div>
        </div>
    )
}
