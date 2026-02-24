"use client"

import { useState, useEffect } from "react"
import { X, ZoomIn } from "lucide-react"

interface ImageZoomProps {
  src: string
  alt: string
  className?: string
  objectCover?: boolean
  cropBorder?: boolean // New prop to crop edges
}

export function ImageZoom({ src, alt, className, objectCover = false, cropBorder = false }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden" // Prevent scrolling
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!src) return null

  return (
    <>
      <div 
        className={`relative cursor-pointer group overflow-hidden inline-block align-middle ${className}`} 
        onClick={() => setIsOpen(true)}
        title="انقر للتكبير"
      >
        <div className={`w-full h-full ${cropBorder ? 'scale-[1] origin-center' : ''}`}> {/* Wrapper for scaling/cropping */}
          <img 
            src={src} 
            alt={alt} 
            className={`w-full h-full ${objectCover ? 'object-cover' : 'object-contain'} transition-transform duration-300 group-hover:scale-105 block mx-auto`}
          />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
            aria-label="إغلاق"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className={`${cropBorder ? 'scale-[1.02] origin-center' : ''}`}>
               <img 
              src={src} 
              alt={alt} 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-sm shadow-2xl"
            />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
