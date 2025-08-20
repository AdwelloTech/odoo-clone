'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CameraIcon, 
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
  maxSizeInMB?: number
  acceptedTypes?: string[]
  children?: React.ReactNode
  className?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onUpload,
  isUploading = false,
  maxSizeInMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  children,
  className
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Please upload a ${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} image`
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      return `File size must be less than ${maxSizeInMB}MB`
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    setError(null)
    
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setSelectedFile(file)
    onImageSelect(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setError(null)
      await onUpload(selectedFile)
      // Clear selection after successful upload
      setSelectedFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      setError(error.message || 'Failed to upload image')
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer',
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : selectedFile 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <AnimatePresence>
          {!selectedFile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <CloudArrowUpIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {dragActive ? 'Drop your image here' : 'Upload profile image'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Drag and drop or click to select
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    JPEG, PNG, WebP up to {maxSizeInMB}MB
                  </p>
                </div>
                {children}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              {/* Preview */}
              {preview && (
                <div className="mb-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                  />
                </div>
              )}
              
              {/* File info */}
              <div className="mb-4">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex justify-center space-x-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpload()
                  }}
                  disabled={isUploading}
                  size="sm"
                  variant="success"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearSelection()
                  }}
                  disabled={isUploading}
                  size="sm"
                  variant="outline"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
