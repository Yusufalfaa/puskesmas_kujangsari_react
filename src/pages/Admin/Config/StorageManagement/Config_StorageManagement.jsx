"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import "./StorageManagement.css"
import { Button } from "react-bootstrap"
import { Edit, Trash2, FolderOpen, ArrowLeft, EyeIcon } from "lucide-react"

const StorageManagement = () => {
  const [buckets, setBuckets] = useState([])
  const [calculatingStorage, setCalculatingStorage] = useState(false)
  const [refreshingStorage, setRefreshingStorage] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newBucketName, setNewBucketName] = useState("")
  const [showAddBucketModal, setShowAddBucketModal] = useState(false)

  // States untuk bucket content management
  const [expandedBucket, setExpandedBucket] = useState("")
  const [bucketContents, setBucketContents] = useState({})
  const [showUploadForm, setShowUploadForm] = useState({})
  const [uploadFileToBucket, setUploadFileToBucket] = useState(null)
  const [newFolderInBucket, setNewFolderInBucket] = useState("")
  const [showCreateFolderForm, setShowCreateFolderForm] = useState({})

  // State untuk navigasi folder
  const [currentFolderPath, setCurrentFolderPath] = useState({})

  // State untuk storage usage
  const [storageUsage, setStorageUsage] = useState({
    database: 0,
    storage: 0,
    maxDatabase: 500,
    maxStorage: 1024,
  })

  // Progress states
  const [uploadProgress, setUploadProgress] = useState({})
  const [createFolderProgress, setCreateFolderProgress] = useState({})
  const [deleteProgress, setDeleteProgress] = useState({})
  const [generalLoading, setGeneralLoading] = useState(false)
  const [uploadPercentage, setUploadPercentage] = useState({})
  const [operationStatus, setOperationStatus] = useState({})
  const [deleteBucketProgress, setDeleteBucketProgress] = useState({})

  // States untuk rename functionality
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameItem, setRenameItem] = useState(null)
  const [newItemName, setNewItemName] = useState("")
  const [renameProgress, setRenameProgress] = useState(false)

  // Enhanced move functionality states
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [moveProgress, setMoveProgress] = useState(false)

  // Move destination states
  const [selectedDestinationBucket, setSelectedDestinationBucket] = useState("")
  const [destinationFolderPath, setDestinationFolderPath] = useState("")
  const [destinationContents, setDestinationContents] = useState([])
  const [loadingDestination, setLoadingDestination] = useState(false)

  // Multi-select states
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItemsForMove, setSelectedItemsForMove] = useState(new Set())

  const handleCreateBucket = async () => {
    if (!newBucketName || !newBucketName.trim()) {
      setError("Nama bucket tidak boleh kosong")
      return
    }

    setGeneralLoading(true)
    try {
      const { error } = await supabase.storage.createBucket(newBucketName)
      if (error) throw error

      setSuccess("Bucket berhasil dibuat!")
      setNewBucketName("")
      setShowAddBucketModal(false)
      fetchBuckets()
    } catch (error) {
      console.error("Error creating bucket:", error)
      setError("Gagal membuat bucket: " + error.message)
    } finally {
      setGeneralLoading(false)
    }
  }

  useEffect(() => {
    fetchBuckets()
  }, [])

  const fetchBuckets = async () => {
    setGeneralLoading(true)
    try {
      const { data, error } = await supabase.storage.listBuckets()
      if (error) throw error
      setBuckets(data || [])

      if (data && data.length > 0) {
        await fetchStorageUsageOptimized(data, true)
      }
    } catch (error) {
      console.error("Error fetching buckets:", error)
      setError("Gagal mengambil data bucket")
    } finally {
      setGeneralLoading(false)
    }
  }

  const fetchDatabaseUsage = async () => {
    try {
      const { data: sizeData, error: sizeError } = await supabase.rpc("get_database_size")

      if (!sizeError && sizeData && sizeData.length > 0) {
        return Math.max(sizeData[0].total_size_mb || 1, 1)
      }

      const tables = [
        "users",
        "profiles",
        "posts",
        "comments",
        "files",
        "logs",
        "sessions",
        "notifications",
        "settings",
      ]

      let totalRows = 0
      let accessibleTables = 0

      for (const table of tables) {
        try {
          const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

          if (!error && count !== null) {
            totalRows += count
            accessibleTables++
          }
        } catch (err) {
          continue
        }
      }

      if (accessibleTables === 0) {
        return 2
      }

      const estimatedDbSize = Math.round((totalRows * 2048) / (1024 * 1024))
      return Math.max(estimatedDbSize, 1)
    } catch (error) {
      console.error("Error calculating database usage:", error)
      return 3
    }
  }

  const fetchStorageUsageOptimized = async (bucketsData = buckets, isInitialLoad = false) => {
    if (isInitialLoad) {
      setCalculatingStorage(true)
    } else {
      setRefreshingStorage(true)
    }

    try {
      let totalStorageSize = 0

      const dbUsage = await fetchDatabaseUsage()

      for (const bucket of bucketsData) {
        try {
          const bucketSize = await calculateBucketSizeOptimized(bucket.name)
          totalStorageSize += bucketSize
        } catch (err) {
          console.warn(`Error calculating size for bucket ${bucket.name}:`, err)
        }
      }
      setStorageUsage((prev) => ({
        ...prev,
        database: dbUsage,
        storage: Math.round(totalStorageSize / (1024 * 1024)),
      }))
    } catch (error) {
      console.error("Error fetching storage usage:", error)
      setError("Gagal menghitung penggunaan storage")
    } finally {
      if (isInitialLoad) {
        setCalculatingStorage(false)
      } else {
        setRefreshingStorage(false)
      }
    }
  }

  const calculateBucketSizeOptimized = async (bucketName, folderPath = "", depth = 0) => {
    if (depth > 10) {
      console.warn(`Max depth reached for ${bucketName}/${folderPath}`)
      return 0
    }

    try {
      const { data: files, error } = await supabase.storage.from(bucketName).list(folderPath, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      })

      if (error) {
        console.error(`Error listing files in ${bucketName}/${folderPath}:`, error)
        return 0
      }

      let totalSize = 0

      for (const file of files) {
        if (file.name === ".placeholder") continue

        const fullPath = folderPath ? `${folderPath}/${file.name}` : file.name
        const isFolder = !file.name.includes(".") || file.metadata?.mimetype === "application/x-directory"

        if (isFolder) {
          const folderSize = await calculateBucketSizeOptimized(bucketName, fullPath, depth + 1)
          totalSize += folderSize
        } else {
          if (file.metadata && file.metadata.size) {
            totalSize += file.metadata.size
          } else {
            const estimatedSize = estimateFileSize(file.name)
            totalSize += estimatedSize
          }
        }
      }

      return totalSize
    } catch (error) {
      console.error(`Error calculating size for ${bucketName}/${folderPath}:`, error)
      return 0
    }
  }

  const estimateFileSize = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    const sizeEstimates = {
      jpg: 2 * 1024 * 1024,
      jpeg: 2 * 1024 * 1024,
      png: 3 * 1024 * 1024,
      gif: 1 * 1024 * 1024,
      webp: 1.5 * 1024 * 1024,
      pdf: 5 * 1024 * 1024,
      doc: 1 * 1024 * 1024,
      docx: 1 * 1024 * 1024,
      xls: 2 * 1024 * 1024,
      xlsx: 2 * 1024 * 1024,
      mp4: 50 * 1024 * 1024,
      avi: 100 * 1024 * 1024,
      mov: 75 * 1024 * 1024,
      mp3: 5 * 1024 * 1024,
      wav: 10 * 1024 * 1024,
      default: 1 * 1024 * 1024,
    }

    return sizeEstimates[extension] || sizeEstimates["default"]
  }

  const clearBucketCache = (bucketName) => {
    setBucketContents((prev) => {
      const newContents = { ...prev }
      Object.keys(newContents).forEach((key) => {
        if (key.startsWith(bucketName)) {
          delete newContents[key]
        }
      })
      return newContents
    })
  }

  const fetchBucketContents = async (bucketName, folderPath = "", forceRefresh = false) => {
    const cacheKey = `${bucketName}/${folderPath}`

    if (!forceRefresh && bucketContents[cacheKey]) {
      return bucketContents[cacheKey]
    }

    try {
      const { data, error } = await supabase.storage.from(bucketName).list(folderPath, {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      })

      if (error) throw error

      const contents = data
        .map((item) => ({
          ...item,
          isFolder: !item.name.includes(".") && item.name !== ".placeholder",
          path: folderPath ? `${folderPath}/${item.name}` : item.name,
          fullPath: folderPath ? `${folderPath}/${item.name}` : item.name,
        }))
        .filter((item) => item.name !== ".placeholder")

      setBucketContents((prev) => ({
        ...prev,
        [cacheKey]: contents,
      }))

      return contents
    } catch (error) {
      console.error("Error fetching bucket contents:", error)
      setError("Gagal mengambil isi bucket")
      return []
    }
  }

  const toggleBucketExpansion = async (bucketName) => {
    if (expandedBucket === bucketName) {
      setExpandedBucket("")
      setCurrentFolderPath((prev) => ({ ...prev, [bucketName]: "" }))
    } else {
      setExpandedBucket(bucketName)
      setCurrentFolderPath((prev) => ({ ...prev, [bucketName]: "" }))
      await fetchBucketContents(bucketName, "")
    }
  }

  const navigateToFolder = async (bucketName, folderPath) => {
    setCurrentFolderPath((prev) => ({ ...prev, [bucketName]: folderPath }))
    await fetchBucketContents(bucketName, folderPath)
  }

  // New function to navigate back to parent folder
  const navigateBack = async (bucketName) => {
    const currentPath = currentFolderPath[bucketName] || ""
    if (!currentPath) return // Already at root

    const pathParts = currentPath.split("/")
    pathParts.pop() // Remove last folder
    const parentPath = pathParts.join("/")

    setCurrentFolderPath((prev) => ({ ...prev, [bucketName]: parentPath }))
    await fetchBucketContents(bucketName, parentPath)
  }

  const generateBreadcrumb = (bucketName) => {
    const currentPath = currentFolderPath[bucketName] || ""
    if (!currentPath) return [{ name: bucketName, path: "" }]

    const pathParts = currentPath.split("/")
    const breadcrumb = [{ name: bucketName, path: "" }]

    let accumulatedPath = ""
    pathParts.forEach((part) => {
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part
      breadcrumb.push({ name: part, path: accumulatedPath })
    })

    return breadcrumb
  }

  const validateImageFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    const maxSize = 10 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Hanya file gambar yang diizinkan (JPEG, PNG, GIF, WebP, SVG)")
    }

    if (file.size > maxSize) {
      throw new Error("Ukuran file maksimal 10MB")
    }

    return true
  }

  // Multi-select functionality
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedItemsForMove(new Set())
  }

  const toggleItemSelection = (bucketName, item) => {
    const itemKey = `${bucketName}:${item.fullPath}`
    const newSelection = new Set(selectedItemsForMove)

    if (newSelection.has(itemKey)) {
      newSelection.delete(itemKey)
    } else {
      newSelection.add(itemKey)
    }

    setSelectedItemsForMove(newSelection)
  }

  const isItemSelected = (bucketName, item) => {
    const itemKey = `${bucketName}:${item.fullPath}`
    return selectedItemsForMove.has(itemKey)
  }

  // Enhanced move functionality
  const startMove = (bucketName, item = null) => {
    if (item) {
      // Single item move
      setSelectedItems([
        {
          bucketName,
          item,
          currentPath: currentFolderPath[bucketName] || "",
        },
      ])
    } else {
      // Multi-select move
      const items = Array.from(selectedItemsForMove)
        .map((itemKey) => {
          const [bucket, fullPath] = itemKey.split(":")
          const currentPath = currentFolderPath[bucket] || ""
          const contents = bucketContents[`${bucket}/${currentPath}`] || []
          const item = contents.find((content) => content.fullPath === fullPath)

          return {
            bucketName: bucket,
            item,
            currentPath,
          }
        })
        .filter((item) => item.item) // Filter out any invalid items

      setSelectedItems(items)
    }

    setSelectedDestinationBucket("")
    setDestinationFolderPath("")
    setDestinationContents([])
    setShowMoveModal(true)
  }

  const handleDestinationBucketChange = async (bucketName) => {
    setSelectedDestinationBucket(bucketName)
    setDestinationFolderPath("")
    setLoadingDestination(true)

    try {
      const contents = await fetchDestinationContents(bucketName, "")
      setDestinationContents(contents)
    } catch (error) {
      console.error("Error loading destination contents:", error)
      setError("Gagal memuat isi bucket tujuan")
    } finally {
      setLoadingDestination(false)
    }
  }

  const fetchDestinationContents = async (bucketName, folderPath = "") => {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list(folderPath, {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      })

      if (error) throw error

      return data
        .map((item) => ({
          ...item,
          isFolder: !item.name.includes(".") && item.name !== ".placeholder",
          path: folderPath ? `${folderPath}/${item.name}` : item.name,
          fullPath: folderPath ? `${folderPath}/${item.name}` : item.name,
        }))
        .filter((item) => item.name !== ".placeholder" && item.isFolder) // Only show folders for navigation
    } catch (error) {
      console.error("Error fetching destination contents:", error)
      return []
    }
  }

  const navigateToDestinationFolder = async (folderPath) => {
    setDestinationFolderPath(folderPath)
    setLoadingDestination(true)

    try {
      const contents = await fetchDestinationContents(selectedDestinationBucket, folderPath)
      setDestinationContents(contents)
    } catch (error) {
      console.error("Error navigating to destination folder:", error)
      setError("Gagal navigasi ke folder tujuan")
    } finally {
      setLoadingDestination(false)
    }
  }

  const generateDestinationBreadcrumb = () => {
    if (!destinationFolderPath) return [{ name: selectedDestinationBucket, path: "" }]

    const pathParts = destinationFolderPath.split("/")
    const breadcrumb = [{ name: selectedDestinationBucket, path: "" }]

    let accumulatedPath = ""
    pathParts.forEach((part) => {
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part
      breadcrumb.push({ name: part, path: accumulatedPath })
    })

    return breadcrumb
  }

  const validateMoveOperation = () => {
    if (!selectedDestinationBucket) {
      throw new Error("Pilih bucket tujuan terlebih dahulu")
    }

    for (const moveItem of selectedItems) {
      // Check if moving to same location
      if (moveItem.bucketName === selectedDestinationBucket && moveItem.currentPath === destinationFolderPath) {
        throw new Error("Tidak bisa memindahkan ke lokasi yang sama")
      }

      // Check if moving folder into itself
      if (moveItem.item.isFolder && moveItem.bucketName === selectedDestinationBucket) {
        const sourcePath = moveItem.currentPath ? `${moveItem.currentPath}/${moveItem.item.name}` : moveItem.item.name

        if (destinationFolderPath.startsWith(sourcePath + "/") || destinationFolderPath === sourcePath) {
          throw new Error(`Tidak bisa memindahkan folder "${moveItem.item.name}" ke dalam dirinya sendiri`)
        }
      }
    }

    return true
  }

  const handleMoveItems = async () => {
    try {
      validateMoveOperation()

      setMoveProgress(true)
      setUploadPercentage({ move: 0 })
      setOperationStatus({ move: "Memulai proses pemindahan..." })

      const totalItems = selectedItems.length
      let processedItems = 0
      let successfulMoves = 0
      const failedMoves = []

      for (const moveItem of selectedItems) {
        const { bucketName, item } = moveItem
        const sourcePath = item.fullPath
        const destinationPath = destinationFolderPath ? `${destinationFolderPath}/${item.name}` : item.name

        setOperationStatus({ move: `Memproses ${item.name}... (${processedItems + 1}/${totalItems})` })

        try {
          if (item.isFolder) {
            const moveResult = await moveFolderRecursive(
              bucketName,
              sourcePath,
              selectedDestinationBucket,
              destinationPath,
            )
            if (moveResult.success) {
              successfulMoves++
            } else {
              failedMoves.push({ item: item.name, error: moveResult.error })
            }
          } else {
            const moveResult = await moveSingleFile(bucketName, sourcePath, selectedDestinationBucket, destinationPath)
            if (moveResult.success) {
              successfulMoves++
            } else {
              failedMoves.push({ item: item.name, error: moveResult.error })
            }
          }
        } catch (error) {
          console.error(`Error moving ${item.name}:`, error)
          failedMoves.push({ item: item.name, error: error.message })
        }

        processedItems++
        const progress = (processedItems / totalItems) * 90
        setUploadPercentage({ move: progress })
      }

      setUploadPercentage({ move: 100 })

      // Show appropriate message based on results
      if (successfulMoves === totalItems) {
        setOperationStatus({ move: "Pemindahan berhasil!" })
        setTimeout(() => {
          setSuccess(`${successfulMoves} item berhasil dipindahkan!`)
          setShowMoveModal(false)
          setSelectedItems([])
          setSelectedItemsForMove(new Set())
          setSelectionMode(false)
        }, 500)
      } else if (successfulMoves > 0) {
        setOperationStatus({ move: `${successfulMoves} item berhasil, ${failedMoves.length} gagal` })
        setTimeout(() => {
          setSuccess(`${successfulMoves} item berhasil dipindahkan`)
          setError(`${failedMoves.length} item gagal dipindahkan: ${failedMoves.map((f) => f.item).join(", ")}`)
          setShowMoveModal(false)
          setSelectedItems([])
          setSelectedItemsForMove(new Set())
          setSelectionMode(false)
        }, 500)
      } else {
        setOperationStatus({ move: "Pemindahan gagal!" })
        setTimeout(() => {
          setError(`Gagal memindahkan semua item: ${failedMoves.map((f) => `${f.item} (${f.error})`).join(", ")}`)
          setShowMoveModal(false)
        }, 500)
      }

      // Refresh affected buckets only if there were successful moves
      if (successfulMoves > 0) {
        for (const moveItem of selectedItems) {
          clearBucketCache(moveItem.bucketName)
          await fetchBucketContents(moveItem.bucketName, moveItem.currentPath, true)
        }

        if (selectedDestinationBucket && !selectedItems.some((item) => item.bucketName === selectedDestinationBucket)) {
          clearBucketCache(selectedDestinationBucket)
          await fetchBucketContents(selectedDestinationBucket, destinationFolderPath, true)
        }

        await fetchStorageUsageOptimized()
      }
    } catch (error) {
      console.error("Error moving items:", error)
      setError("Gagal memindahkan: " + error.message)
    } finally {
      setTimeout(() => {
        setMoveProgress(false)
        setUploadPercentage({})
        setOperationStatus({})
      }, 2000)
    }
  }

  // Enhanced move helper functions with better error handling
  const moveSingleFile = async (sourceBucket, sourcePath, destBucket, destPath) => {
    try {
      const { data: fileData, error: downloadError } = await supabase.storage.from(sourceBucket).download(sourcePath)
      if (downloadError) {
        console.error("Download error:", downloadError)
        return { success: false, error: downloadError.message }
      }

      if (!fileData) {
        return { success: false, error: "File data is empty" }
      }

      // Upload to destination
      const { error: uploadError } = await supabase.storage.from(destBucket).upload(destPath, fileData, {
        upsert: false, // Don't overwrite existing files
      })
      if (uploadError) {
        console.error("Upload error:", uploadError)
        return { success: false, error: uploadError.message }
      }

      // Verify upload was successful by checking if file exists
      const { data: verifyData, error: verifyError } = await supabase.storage
        .from(destBucket)
        .list(destPath.includes("/") ? destPath.substring(0, destPath.lastIndexOf("/")) : "", {
          search: destPath.includes("/") ? destPath.substring(destPath.lastIndexOf("/") + 1) : destPath,
        })

      if (verifyError || !verifyData || verifyData.length === 0) {
        console.error("Verification failed:", verifyError)
        return { success: false, error: "Upload verification failed" }
      }

      // Delete from source only after successful upload and verification
      const { error: deleteError } = await supabase.storage.from(sourceBucket).remove([sourcePath])
      if (deleteError) {
        console.error("Delete error:", deleteError)
        // File was uploaded but couldn't be deleted from source
        return { success: false, error: `File copied but couldn't delete from source: ${deleteError.message}` }
      }

      return { success: true }
    } catch (error) {
      console.error("Move single file error:", error)
      return { success: false, error: error.message }
    }
  }

  const moveFolderRecursive = async (sourceBucket, sourceFolderPath, destBucket, destFolderPath) => {
    try {
      // Get all files in the folder
      const allFiles = await getAllFilesInFolder(sourceBucket, sourceFolderPath)

      if (allFiles.length === 0) {
        // Create empty folder by uploading a placeholder
        const placeholderFile = new Blob([""], { type: "text/plain" })
        const { error: placeholderError } = await supabase.storage
          .from(destBucket)
          .upload(`${destFolderPath}/.placeholder`, placeholderFile)

        if (placeholderError) {
          console.error("Placeholder error:", placeholderError)
          return { success: false, error: placeholderError.message }
        }

        // Remove source folder (placeholder file)
        const { error: deleteError } = await supabase.storage
          .from(sourceBucket)
          .remove([`${sourceFolderPath}/.placeholder`])
        if (deleteError) {
          console.warn("Couldn't delete source placeholder:", deleteError)
        }

        return { success: true }
      }

      let successfulFiles = 0
      const failedFiles = []

      // Process each file
      for (const file of allFiles) {
        const relativePath = file.replace(sourceFolderPath + "/", "")
        const newFilePath = `${destFolderPath}/${relativePath}`

        try {
          const moveResult = await moveSingleFile(sourceBucket, file, destBucket, newFilePath)
          if (moveResult.success) {
            successfulFiles++
          } else {
            failedFiles.push({ file, error: moveResult.error })
          }
        } catch (error) {
          console.warn(`Error processing file ${file}:`, error)
          failedFiles.push({ file, error: error.message })
        }
      }

      if (successfulFiles === allFiles.length) {
        return { success: true }
      } else if (successfulFiles > 0) {
        return {
          success: false,
          error: `${successfulFiles}/${allFiles.length} files moved. Failed: ${failedFiles.map((f) => f.file).join(", ")}`,
        }
      } else {
        return {
          success: false,
          error: `No files moved. Errors: ${failedFiles.map((f) => f.error).join(", ")}`,
        }
      }
    } catch (error) {
      console.error("Move folder recursive error:", error)
      return { success: false, error: error.message }
    }
  }

  const getAllFilesInFolder = async (bucketName, folderPath, allFiles = []) => {
    try {
      const { data: files, error } = await supabase.storage.from(bucketName).list(folderPath, { limit: 1000 })

      if (error) {
        console.error(`Error listing files in ${bucketName}/${folderPath}:`, error)
        return allFiles
      }

      for (const file of files) {
        if (file.name === ".placeholder") continue

        const fullPath = `${folderPath}/${file.name}`
        const isFolder = !file.name.includes(".") || file.metadata?.mimetype === "application/x-directory"

        if (isFolder) {
          await getAllFilesInFolder(bucketName, fullPath, allFiles)
        } else {
          allFiles.push(fullPath)
        }
      }

      return allFiles
    } catch (error) {
      console.error(`Error getting files in ${folderPath}:`, error)
      return allFiles
    }
  }

  // Rename functionality (keeping existing implementation)
  const startRename = (bucketName, item) => {
    setRenameItem({
      bucketName,
      item,
      currentPath: currentFolderPath[bucketName] || "",
    })
    setNewItemName(item.name)
    setShowRenameModal(true)
  }

  const validateNewName = (newName, isFolder = false) => {
    if (!newName || !newName.trim()) {
      throw new Error("Nama tidak boleh kosong")
    }

    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(newName)) {
      throw new Error('Nama tidak boleh mengandung karakter: < > : " / \\ | ? *')
    }

    const reservedNames = [
      "CON",
      "PRN",
      "AUX",
      "NUL",
      "COM1",
      "COM2",
      "COM3",
      "COM4",
      "COM5",
      "COM6",
      "COM7",
      "COM8",
      "COM9",
      "LPT1",
      "LPT2",
      "LPT3",
      "LPT4",
      "LPT5",
      "LPT6",
      "LPT7",
      "LPT8",
      "LPT9",
    ]
    if (reservedNames.includes(newName.toUpperCase())) {
      throw new Error("Nama tersebut tidak diizinkan")
    }

    if (!isFolder && !newName.includes(".")) {
      throw new Error("File harus memiliki ekstensi")
    }

    return true
  }

  const handleRenameFile = async () => {
    if (!renameItem) return

    try {
      validateNewName(newItemName, renameItem.item.isFolder)

      if (newItemName === renameItem.item.name) {
        setError("Nama baru sama dengan nama lama")
        return
      }

      setRenameProgress(true)
      setUploadPercentage({ rename: 0 })
      setOperationStatus({ rename: "Memulai proses rename..." })

      const { bucketName, item, currentPath } = renameItem
      const oldPath = item.fullPath
      const newPath = currentPath ? `${currentPath}/${newItemName}` : newItemName

      if (item.isFolder) {
        await renameFolderRecursive(bucketName, oldPath, newPath)
      } else {
        await renameSingleFile(bucketName, oldPath, newPath)
      }

      setUploadPercentage({ rename: 100 })
      setOperationStatus({ rename: "Rename berhasil!" })

      setTimeout(() => {
        setSuccess(`${item.isFolder ? "Folder" : "File"} berhasil direname!`)
        setShowRenameModal(false)
        setRenameItem(null)
        setNewItemName("")
      }, 500)

      clearBucketCache(bucketName)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await fetchBucketContents(bucketName, currentPath, true)
    } catch (error) {
      console.error("Error renaming:", error)
      setError("Gagal rename: " + error.message)
    } finally {
      setTimeout(() => {
        setRenameProgress(false)
        setUploadPercentage({})
        setOperationStatus({})
      }, 2000)
    }
  }

  const renameSingleFile = async (bucketName, oldPath, newPath) => {
    setUploadPercentage({ rename: 20 })
    setOperationStatus({ rename: "Mengunduh file... 20%" })

    const { data: fileData, error: downloadError } = await supabase.storage.from(bucketName).download(oldPath)
    if (downloadError) throw downloadError

    setUploadPercentage({ rename: 50 })
    setOperationStatus({ rename: "Mengupload dengan nama baru... 50%" })

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(newPath, fileData)
    if (uploadError) throw uploadError

    setUploadPercentage({ rename: 80 })
    setOperationStatus({ rename: "Menghapus file lama... 80%" })

    const { error: deleteError } = await supabase.storage.from(bucketName).remove([oldPath])
    if (deleteError) throw deleteError
  }

  const renameFolderRecursive = async (bucketName, oldFolderPath, newFolderPath) => {
    setUploadPercentage({ rename: 10 })
    setOperationStatus({ rename: "Menganalisis isi folder... 10%" })

    const allFiles = await getAllFilesInFolder(bucketName, oldFolderPath)

    setUploadPercentage({ rename: 30 })
    setOperationStatus({ rename: `Memproses ${allFiles.length} file... 30%` })

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i]
      const relativePath = file.replace(oldFolderPath + "/", "")
      const newFilePath = `${newFolderPath}/${relativePath}`

      const { data: fileData, error: downloadError } = await supabase.storage.from(bucketName).download(file)

      if (downloadError) {
        console.warn(`Error downloading ${file}:`, downloadError)
        continue
      }

      const { error: uploadError } = await supabase.storage.from(bucketName).upload(newFilePath, fileData)

      if (uploadError) {
        console.warn(`Error uploading ${newFilePath}:`, uploadError)
        continue
      }

      const progress = 30 + ((i + 1) / allFiles.length) * 50
      setUploadPercentage({ rename: progress })
      setOperationStatus({ rename: `Memproses file ${i + 1}/${allFiles.length}... ${Math.round(progress)}%` })
    }

    setUploadPercentage({ rename: 90 })
    setOperationStatus({ rename: "Menghapus folder lama... 90%" })

    if (allFiles.length > 0) {
      const { error: deleteError } = await supabase.storage.from(bucketName).remove(allFiles)

      if (deleteError) {
        console.warn("Error deleting old files:", deleteError)
      }
    }
  }

  // Rest of the existing functions (upload, create folder, delete, etc.) remain the same
  const handleUploadToBucket = async (bucketName, folderPath = "") => {
    if (!uploadFileToBucket) {
      setError("Pilih file terlebih dahulu")
      return
    }

    try {
      validateImageFile(uploadFileToBucket)
    } catch (validationError) {
      setError(validationError.message)
      return
    }

    const progressKey = `${bucketName}/${folderPath}`
    setUploadProgress((prev) => ({ ...prev, [progressKey]: true }))
    setUploadPercentage((prev) => ({ ...prev, [progressKey]: 0 }))
    setOperationStatus((prev) => ({ ...prev, [progressKey]: "Memulai upload..." }))

    try {
      const fileExt = uploadFileToBucket.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName

      const progressInterval = setInterval(() => {
        setUploadPercentage((prev) => {
          const currentProgress = prev[progressKey] || 0
          if (currentProgress < 90) {
            const newProgress = currentProgress + Math.random() * 15
            setOperationStatus((prevStatus) => ({
              ...prevStatus,
              [progressKey]: `Uploading... ${Math.round(newProgress)}%`,
            }))
            return { ...prev, [progressKey]: Math.min(newProgress, 90) }
          }
          return prev
        })
      }, 200)

      const { error } = await supabase.storage.from(bucketName).upload(filePath, uploadFileToBucket)

      clearInterval(progressInterval)

      if (error) throw error

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 100 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Upload selesai!" }))

      setTimeout(() => {
        setSuccess("File berhasil diupload!")
        setUploadFileToBucket(null)
        setShowUploadForm((prev) => ({ ...prev, [`${bucketName}/${folderPath}`]: false }))
      }, 500)

      setBucketContents((prev) => {
        const newContents = { ...prev }
        Object.keys(newContents).forEach((key) => {
          if (key.startsWith(bucketName)) {
            delete newContents[key]
          }
        })
        return newContents
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const currentPath = currentFolderPath[bucketName] || ""
      await fetchBucketContents(bucketName, currentPath, true)
      await fetchStorageUsageOptimized()
    } catch (error) {
      console.error("Error uploading file:", error)
      setError("Gagal mengupload file: " + error.message)
    } finally {
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[progressKey]
          return newProgress
        })
        setUploadPercentage((prev) => {
          const newPercentage = { ...prev }
          delete newPercentage[progressKey]
          return newPercentage
        })
        setOperationStatus((prev) => {
          const newStatus = { ...prev }
          delete newStatus[progressKey]
          return newStatus
        })
      }, 2000)
    }
  }

  const handleCreateFolderInBucket = async (bucketName, parentFolder = "") => {
    const folderName = newFolderInBucket[`${bucketName}/${parentFolder}`]

    if (!folderName || !folderName.trim()) {
      setError("Nama folder tidak boleh kosong")
      return
    }

    const progressKey = `${bucketName}/${parentFolder}`
    setCreateFolderProgress((prev) => ({ ...prev, [progressKey]: true }))
    setUploadPercentage((prev) => ({ ...prev, [progressKey]: 0 }))
    setOperationStatus((prev) => ({ ...prev, [progressKey]: "Memulai pembuatan folder..." }))

    try {
      const placeholderFile = new Blob([""], { type: "text/plain" })
      const folderPath = parentFolder ? `${parentFolder}/${folderName}` : folderName

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 20 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Menyiapkan struktur folder... 20%" }))

      await new Promise((resolve) => setTimeout(resolve, 300))

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 50 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Membuat folder di storage... 50%" }))

      const { error } = await supabase.storage.from(bucketName).upload(`${folderPath}/.placeholder`, placeholderFile)
      if (error) throw error

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 80 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Menyelesaikan pembuatan... 80%" }))

      await new Promise((resolve) => setTimeout(resolve, 200))

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 100 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Folder berhasil dibuat! 100%" }))

      setTimeout(() => {
        setSuccess("Folder berhasil dibuat!")
        setNewFolderInBucket((prev) => ({ ...prev, [`${bucketName}/${parentFolder}`]: "" }))
        setShowCreateFolderForm((prev) => ({ ...prev, [`${bucketName}/${parentFolder}`]: false }))
      }, 500)

      setBucketContents((prev) => {
        const newContents = { ...prev }
        Object.keys(newContents).forEach((key) => {
          if (key.startsWith(bucketName)) {
            delete newContents[key]
          }
        })
        return newContents
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const currentPath = currentFolderPath[bucketName] || ""
      await fetchBucketContents(bucketName, currentPath, true)
    } catch (error) {
      console.error("Error creating folder:", error)
      setError("Gagal membuat folder: " + error.message)
    } finally {
      setTimeout(() => {
        setCreateFolderProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[progressKey]
          return newProgress
        })
        setUploadPercentage((prev) => {
          const newPercentage = { ...prev }
          delete newPercentage[progressKey]
          return newPercentage
        })
        setOperationStatus((prev) => {
          const newStatus = { ...prev }
          delete newStatus[progressKey]
          return newStatus
        })
      }, 2000)
    }
  }

  const handleDeleteFile = async (bucketName, filePath) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus file ini?")) return

    const progressKey = `${bucketName}/${filePath}`
    setDeleteProgress((prev) => ({ ...prev, [progressKey]: true }))
    setUploadPercentage((prev) => ({ ...prev, [progressKey]: 0 }))
    setOperationStatus((prev) => ({ ...prev, [progressKey]: "Memulai penghapusan..." }))

    try {
      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 25 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Memproses penghapusan... 25%" }))

      await new Promise((resolve) => setTimeout(resolve, 200))

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 60 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Menghapus dari storage... 60%" }))

      const { error } = await supabase.storage.from(bucketName).remove([filePath])
      if (error) throw error

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 90 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Membersihkan cache... 90%" }))

      await new Promise((resolve) => setTimeout(resolve, 200))

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 100 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "File berhasil dihapus! 100%" }))

      setTimeout(() => {
        setSuccess("File berhasil dihapus!")
      }, 500)

      setBucketContents((prev) => {
        const newContents = { ...prev }
        Object.keys(newContents).forEach((key) => {
          if (key.startsWith(bucketName)) {
            delete newContents[key]
          }
        })
        return newContents
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const currentPath = currentFolderPath[bucketName] || ""
      await fetchBucketContents(bucketName, currentPath, true)
      await fetchStorageUsageOptimized()
    } catch (error) {
      console.error("Error deleting file:", error)
      setError("Gagal menghapus file: " + error.message)
    } finally {
      setTimeout(() => {
        setDeleteProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[progressKey]
          return newProgress
        })
        setUploadPercentage((prev) => {
          const newPercentage = { ...prev }
          delete newPercentage[progressKey]
          return newPercentage
        })
        setOperationStatus((prev) => {
          const newStatus = { ...prev }
          delete newStatus[progressKey]
          return newStatus
        })
      }, 2000)
    }
  }

  const handleDeleteFolder = async (bucketName, folderPath) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus folder ini? Semua file di dalamnya akan terhapus.")) return

    const progressKey = `${bucketName}/${folderPath}`
    setDeleteProgress((prev) => ({ ...prev, [progressKey]: true }))
    setUploadPercentage((prev) => ({ ...prev, [progressKey]: 0 }))
    setOperationStatus((prev) => ({ ...prev, [progressKey]: "Memulai penghapusan folder..." }))

    try {
      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 20 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Menganalisis isi folder... 20%" }))

      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list(folderPath, { limit: 1000 })

      if (listError) throw listError

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 40 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: `Ditemukan ${files.length} file... 40%` }))

      await new Promise((resolve) => setTimeout(resolve, 300))

      const filePaths = files.map((file) => `${folderPath}/${file.name}`)

      if (filePaths.length > 0) {
        setUploadPercentage((prev) => ({ ...prev, [progressKey]: 70 }))
        setOperationStatus((prev) => ({ ...prev, [progressKey]: "Menghapus semua file... 70%" }))

        const { error: deleteError } = await supabase.storage.from(bucketName).remove(filePaths)
        if (deleteError) throw deleteError
      }

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 90 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Membersihkan struktur folder... 90%" }))

      await new Promise((resolve) => setTimeout(resolve, 200))

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 100 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Folder berhasil dihapus! 100%" }))

      setTimeout(() => {
        setSuccess("Folder berhasil dihapus!")
      }, 500)

      setBucketContents((prev) => {
        const newContents = { ...prev }
        Object.keys(newContents).forEach((key) => {
          if (key.startsWith(bucketName)) {
            delete newContents[key]
          }
        })
        return newContents
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      const currentPath = currentFolderPath[bucketName] || ""
      await fetchBucketContents(bucketName, currentPath, true)
      await fetchStorageUsageOptimized()
    } catch (error) {
      console.error("Error deleting folder:", error)
      setError("Gagal menghapus folder: " + error.message)
    } finally {
      setTimeout(() => {
        setDeleteProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[progressKey]
          return newProgress
        })
        setUploadPercentage((prev) => {
          const newPercentage = { ...prev }
          delete newPercentage[progressKey]
          return newPercentage
        })
        setOperationStatus((prev) => {
          const newStatus = { ...prev }
          delete newStatus[progressKey]
          return newStatus
        })
      }, 2000)
    }
  }

  const getFileUrl = (bucketName, filePath) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
    return data.publicUrl
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDeleteBucket = async (bucketName) => {
    if (
      !window.confirm(`Apakah Anda yakin ingin menghapus bucket "${bucketName}"? Semua file di dalamnya akan terhapus.`)
    )
      return

    const progressKey = bucketName
    setDeleteBucketProgress((prev) => ({ ...prev, [progressKey]: true }))
    setUploadPercentage((prev) => ({ ...prev, [progressKey]: 0 }))
    setOperationStatus((prev) => ({ ...prev, [progressKey]: "Memulai penghapusan bucket..." }))

    try {
      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 20 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Menganalisis isi bucket... 20%" }))

      await new Promise((resolve) => setTimeout(resolve, 300))

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 40 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Menghapus semua file dalam bucket... 40%" }))

      await new Promise((resolve) => setTimeout(resolve, 500))

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 70 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Menghapus struktur bucket... 70%" }))

      const { error } = await supabase.storage.deleteBucket(bucketName)
      if (error) throw error

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 90 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Membersihkan cache... 90%" }))

      await new Promise((resolve) => setTimeout(resolve, 200))

      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 100 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Bucket berhasil dihapus! 100%" }))

      setTimeout(() => {
        setSuccess("Bucket berhasil dihapus!")
      }, 500)

      fetchBuckets()

      if (expandedBucket === bucketName) {
        setExpandedBucket("")
      }

      setCurrentFolderPath((prev) => {
        const newPath = { ...prev }
        delete newPath[bucketName]
        return newPath
      })

      setBucketContents({})
    } catch (error) {
      console.error("Error deleting bucket:", error)
      setError("Gagal menghapus bucket: " + error.message)
    } finally {
      setTimeout(() => {
        setDeleteBucketProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[progressKey]
          return newProgress
        })
        setUploadPercentage((prev) => {
          const newPercentage = { ...prev }
          delete newPercentage[progressKey]
          return newPercentage
        })
        setOperationStatus((prev) => {
          const newStatus = { ...prev }
          delete newStatus[progressKey]
          return newStatus
        })
      }, 2000)
    }
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const renderStorageUsageChart = () => {
    const dbPercentage = (storageUsage.database / storageUsage.maxDatabase) * 100
    const storagePercentage = (storageUsage.storage / storageUsage.maxStorage) * 100

    return (
      <div className="storage-usage-section">
        <h3>Penggunaan Storage</h3>
        <div className="usage-charts">
          <div className="usage-chart">
            <div className="chart-header">
              <h4>Database</h4>
              <span className="usage-text">
                {storageUsage.database} MB / {storageUsage.maxDatabase} MB
              </span>
            </div>
            <div className="chart-container">
              <div className="chart-bar">
                <div className="chart-fill database-fill" style={{ width: `${Math.min(dbPercentage, 100)}%` }}></div>
              </div>
              <div className="chart-percentage">{dbPercentage.toFixed(1)}%</div>
            </div>
          </div>

          <div className="usage-chart">
            <div className="chart-header">
              <h4>Storage</h4>
              <span className="usage-text">
                {storageUsage.storage} MB / {storageUsage.maxStorage} MB
              </span>
            </div>
            <div className="chart-container">
              <div className="chart-bar">
                <div
                  className="chart-fill storage-fill"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                ></div>
              </div>
              <div className="chart-percentage">{storagePercentage.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            className="btn btn-primary"
            onClick={() => fetchStorageUsageOptimized(buckets, false)}
            disabled={calculatingStorage || refreshingStorage}
          >
            {calculatingStorage || refreshingStorage ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="spinner-small"></span>
                {calculatingStorage ? "Calculating..." : "Refreshing..."}
              </span>
            ) : (
              "Refresh"
            )}
          </button>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
            *Ukuran dihitung berdasarkan metadata dan estimasi
          </p>
        </div>
      </div>
    )
  }

  const renderBucketContents = (bucketName, folderPath = "") => {
    const currentPath = currentFolderPath[bucketName] || ""
    const contents = bucketContents[`${bucketName}/${currentPath}`] || []
    const contentKey = `${bucketName}/${currentPath}`
    const breadcrumb = generateBreadcrumb(bucketName)

    return (
      <div className="bucket-contents">
        <div className="breadcrumb-nav">
          {/* Back button area - always present */}
          <div className="back-button-area">
            <button
              className="back-button"
              onClick={() => navigateBack(bucketName)}
              disabled={!currentPath}
              title={currentPath ? "Kembali ke folder sebelumnya" : "Sudah di root folder"}
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
          </div>

          <div className="breadcrumb-path">
            {breadcrumb.map((crumb, index) => (
              <span key={index}>
                {index > 0 && " / "}
                <button
                  className="breadcrumb-link"
                  onClick={() => navigateToFolder(bucketName, crumb.path)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#007bff",
                    cursor: "pointer",
                    textDecoration: index === breadcrumb.length - 1 ? "none" : "underline",
                  }}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="bucket-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowUploadForm((prev) => ({ ...prev, [contentKey]: !prev[contentKey] }))}
          >
            {showUploadForm[contentKey] ? "Batal Upload" : "Upload File"}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowCreateFolderForm((prev) => ({ ...prev, [contentKey]: !prev[contentKey] }))}
          >
            {showCreateFolderForm[contentKey] ? "Batal Folder" : "Buat Folder"}
          </button>

          {/* Multi-select toggle button */}
          <button className={`btn btn-sm ${selectionMode ? "btn-warning" : "btn-info"}`} onClick={toggleSelectionMode}>
            {selectionMode ? "Batal Pilih" : "Pilih Multiple"}
          </button>

          {/* Move selected button */}
          {selectionMode && selectedItemsForMove.size > 0 && (
            <button className="btn btn-success btn-sm" onClick={() => startMove(bucketName)}>
              Pindah Terpilih ({selectedItemsForMove.size})
            </button>
          )}
        </div>

        {showUploadForm[contentKey] && (
          <div className="upload-form">
            <input
              type="file"
              onChange={(e) => setUploadFileToBucket(e.target.files[0])}
              accept="image/*"
              title="Hanya file gambar yang diizinkan"
              disabled={uploadProgress[contentKey]}
            />
            <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "4px" }}>
              Format yang didukung: JPEG, PNG, GIF, WebP, SVG (Maksimal 10MB)
            </small>

            {uploadProgress[contentKey] && (
              <div className="progress-container" style={{ margin: "10px 0" }}>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${uploadPercentage[contentKey] || 0}%`,
                      height: "20px",
                      backgroundColor: "#4CAF50",
                      borderRadius: "10px",
                      transition: "width 0.3s ease",
                    }}
                  ></div>
                </div>
                <div className="progress-text" style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>
                  {operationStatus[contentKey] || "Processing..."}
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleUploadToBucket(bucketName, currentPath)}
              disabled={!uploadFileToBucket || uploadProgress[contentKey]}
            >
              {uploadProgress[contentKey] ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}

        {showCreateFolderForm[contentKey] && (
          <div className="create-folder-form">
            <input
              type="text"
              placeholder="Nama folder baru"
              value={newFolderInBucket[contentKey] || ""}
              onChange={(e) => setNewFolderInBucket((prev) => ({ ...prev, [contentKey]: e.target.value }))}
              disabled={createFolderProgress[contentKey]}
            />

            {createFolderProgress[contentKey] && (
              <div className="progress-container" style={{ margin: "10px 0" }}>
                <div
                  className="progress-bar-container"
                  style={{
                    width: "100%",
                    height: "20px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: `${uploadPercentage[contentKey] || 0}%`,
                      height: "100%",
                      backgroundColor: "#2196F3",
                      borderRadius: "10px",
                      transition: "width 0.3s ease",
                    }}
                  ></div>
                </div>
                <div className="progress-text" style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>
                  {operationStatus[contentKey] || "Processing..."}
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleCreateFolderInBucket(bucketName, currentPath)}
              disabled={createFolderProgress[contentKey]}
            >
              {createFolderProgress[contentKey] ? "Creating..." : "Buat Folder"}
            </button>
          </div>
        )}

        <div className="contents-grid">
          {contents.map((item) => (
            <div
              key={item.name}
              className={`content-item ${selectionMode ? "selectable" : ""} ${isItemSelected(bucketName, item) ? "selected" : ""}`}
            >
              {selectionMode && (
                <div className="selection-checkbox">
                  <input
                    type="checkbox"
                    checked={isItemSelected(bucketName, item)}
                    onChange={() => toggleItemSelection(bucketName, item)}
                  />
                </div>
              )}

              <div className="content-info">
                <span
                  className="content-icon"
                  style={{ cursor: item.isFolder ? "pointer" : "default" }}
                  onClick={() => {
                    if (item.isFolder && !selectionMode) {
                      navigateToFolder(bucketName, item.fullPath)
                    }
                  }}
                >
                  {item.isFolder ? "📁" : "📄"}
                </span>
                <div className="content-details">
                  <div
                    className="content-name-size-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <p
                      className="content-name"
                      style={{ cursor: item.isFolder && !selectionMode ? "pointer" : "default", margin: 0 }}
                      onClick={() => {
                        if (item.isFolder && !selectionMode) {
                          navigateToFolder(bucketName, item.fullPath)
                        }
                      }}
                    >
                      {item.name}
                    </p>
                    {!item.isFolder && (
                      <span className="content-size" style={{ fontSize: "12px", color: "#888" }}>
                        {item.metadata?.size ? formatFileSize(item.metadata.size) : "Ukuran tidak diketahui"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!selectionMode && (
                <div className="content-actions">
                  {!item.isFolder && (
                    <a
                      href={getFileUrl(bucketName, item.fullPath)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline-dark" size="sm">
                                <EyeIcon size={16} />
                              </Button>
                    </a>
                  )}

                  <Button variant="outline-primary" size="sm" onClick={() => startRename(bucketName, item)} title={`Rename ${item.isFolder ? "folder" : "file"}`}>
                                                  <Edit size={16} />
                                                </Button>

                  <Button variant="outline-warning" size="sm"
                   onClick={() => startMove(bucketName, item)}
                   title={`Pindahkan ${item.isFolder ? "folder" : "file"}`}>
                  <FolderOpen size={16} />
                  </Button>

                  {item.isFolder ? (
                    <div>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteFolder(bucketName, item.fullPath)} disabled={deleteProgress[`${bucketName}/${item.fullPath}`]}>
                                                      <Trash2 size={16} />
                                                      {deleteProgress[`${bucketName}/${item.fullPath}`] ? "Deleting..." : ""}
                                                    </Button>
                      {deleteProgress[`${bucketName}/${item.fullPath}`] && (
                        <div className="progress-container" style={{ margin: "5px 0", width: "150px" }}>
                          <div
                            className="progress-bar-container"
                            style={{
                              width: "100%",
                              height: "8px",
                              backgroundColor: "#f0f0f0",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${uploadPercentage[`${bucketName}/${item.fullPath}`] || 0}%`,
                                height: "100%",
                                backgroundColor: "#f44336",
                                borderRadius: "4px",
                                transition: "width 0.3s ease",
                              }}
                            ></div>
                          </div>
                          <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                            {operationStatus[`${bucketName}/${item.fullPath}`] || "Deleting..."}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteFile(bucketName, item.fullPath)} disabled={deleteProgress[`${bucketName}/${item.fullPath}`]}>
                                                      <Trash2 size={16} />
                                                      {deleteProgress[`${bucketName}/${item.fullPath}`] ? "Deleting..." : ""}
                                                    </Button>
                      
                      {deleteProgress[`${bucketName}/${item.fullPath}`] && (
                        <div className="progress-container" style={{ margin: "5px 0", width: "150px" }}>
                          <div
                            className="progress-bar-container"
                            style={{
                              width: "100%",
                              height: "8px",
                              backgroundColor: "#f0f0f0",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${uploadPercentage[`${bucketName}/${item.fullPath}`] || 0}%`,
                                height: "100%",
                                backgroundColor: "#f44336",
                                borderRadius: "4px",
                                transition: "width 0.3s ease",
                              }}
                            ></div>
                          </div>
                          <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                            {operationStatus[`${bucketName}/${item.fullPath}`] || "Deleting..."}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bucket-management">
      {/* Header */}
      <div className="config-storage-header-new">
        <button className="btn-back" onClick={() => window.history.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Kembali
        </button>
        <h1>Manajemen Bucket & Storage</h1>
        <button className="btn btn-add-bucket" onClick={() => setShowAddBucketModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Tambah Bucket
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
          <button className="alert-close" onClick={clearMessages}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
          <button className="alert-close" onClick={clearMessages}>
            ×
          </button>
        </div>
      )}

      {/* Bucket Management */}
      <div className="management-section">
        <h2>Manajemen Bucket & Folder</h2>

        <div className="bucket-list">
          <h3>Daftar Bucket:</h3>
          {generalLoading ? (
            <div className="bucket-loading">
              <div className="spinner"></div>
              <p className="loading-text">Memuat Data...</p>
              <p className="loading-subtext">Mohon tunggu sebentar</p>
            </div>
          ) : (
            buckets.map((bucket) => (
              <div key={bucket.name} className="bucket-item-expanded">
                <div className="bucket-header">
                  <button className="bucket-toggle" onClick={() => toggleBucketExpansion(bucket.name)}>
                    <span className="bucket-name">
                      {expandedBucket === bucket.name ? "📂" : "📁"} {bucket.name}
                    </span>
                  </button>
                  <div>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteBucket(bucket.name)} disabled={deleteBucketProgress[bucket.name]}>
                                                    <Trash2 size={16} />
                                                    {deleteBucketProgress[bucket.name] ? "Deleting..." : "Hapus"}
                                                  </Button>
                    {deleteBucketProgress[bucket.name] && (
                      <div className="progress-container" style={{ margin: "5px 0", width: "200px" }}>
                        <div
                          className="progress-bar-container"
                          style={{
                            width: "100%",
                            height: "15px",
                            backgroundColor: "#f0f0f0",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            className="progress-bar"
                            style={{
                              width: `${uploadPercentage[bucket.name] || 0}%`,
                              height: "100%",
                              backgroundColor: "#ff5722",
                              borderRadius: "8px",
                              transition: "width 0.3s ease",
                            }}
                          ></div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#666", marginTop: "3px" }}>
                          {operationStatus[bucket.name] || "Deleting bucket..."}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {expandedBucket === bucket.name && (
                  <div className="bucket-content-expanded">{renderBucketContents(bucket.name)}</div>
                )}
              </div>
            ))
          )}
        </div>

        {renderStorageUsageChart()}
      </div>

      {/* Add Bucket Modal */}
      {showAddBucketModal && (
        <div className="modal-storageoverlay" onClick={() => setShowAddBucketModal(false)}>
          <div className="modal-storagecontent" onClick={(e) => e.stopPropagation()}>
            <div className="modal-storageheader">
              <h3>Tambah Bucket Baru</h3>
              <button className="modal-storageclose" onClick={() => setShowAddBucketModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-storagebody">
              <div className="form-group">
                <label>Nama Bucket:</label>
                <input
                  type="text"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  placeholder="Masukkan nama bucket"
                  onKeyPress={(e) => e.key === "Enter" && handleCreateBucket()}
                />
              </div>
            </div>
            <div className="modal-storagefooter">
              <button className="btn btn-secondary" onClick={() => setShowAddBucketModal(false)}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={handleCreateBucket} disabled={generalLoading}>
                {generalLoading ? "Membuat..." : "Buat Bucket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && renameItem && (
        <div className="modal-storageoverlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal-storagecontent" onClick={(e) => e.stopPropagation()}>
            <div className="modal-storageheader">
              <h3>Rename {renameItem.item.isFolder ? "Folder" : "File"}</h3>
              <button className="modal-storageclose" onClick={() => setShowRenameModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-storagebody">
              <div className="form-group">
                <label>Nama {renameItem.item.isFolder ? "Folder" : "File"} Baru:</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Masukkan nama ${renameItem.item.isFolder ? "folder" : "file"} baru`}
                  onKeyPress={(e) => e.key === "Enter" && handleRenameFile()}
                  disabled={renameProgress}
                />
                <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  Nama saat ini: {renameItem.item.name}
                </small>
              </div>

              {renameProgress && (
                <div className="progress-container" style={{ margin: "15px 0" }}>
                  <div
                    className="progress-bar-container"
                    style={{
                      width: "100%",
                      height: "20px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="progress-bar"
                      style={{
                        width: `${uploadPercentage.rename || 0}%`,
                        height: "100%",
                        backgroundColor: "#FF9800",
                        borderRadius: "10px",
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>
                  <div className="progress-text" style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>
                    {operationStatus.rename || "Processing rename..."}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-storagefooter">
              <button className="btn btn-secondary" onClick={() => setShowRenameModal(false)} disabled={renameProgress}>
                Batal
              </button>
              <button
                className="btn btn-warning"
                onClick={handleRenameFile}
                disabled={renameProgress || !newItemName.trim()}
              >
                {renameProgress ? "Renaming..." : "Rename"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Move Modal */}
      {showMoveModal && selectedItems.length > 0 && (
        <div className="modal-storageoverlay" onClick={() => setShowMoveModal(false)}>
          <div className="modal-storagecontent modal-move-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-storageheader">
              <h3>
                Pindahkan {selectedItems.length > 1 ? `${selectedItems.length} Item` : selectedItems[0].item.name}
              </h3>
              <button className="modal-storageclose" onClick={() => setShowMoveModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-storagebody">
              <div className="move-container">
                {/* Source Information */}
                <div className="move-source-section">
                  <h4>📤 Sumber:</h4>
                  <div className="source-items">
                    {selectedItems.map((moveItem, index) => (
                      <div key={index} className="source-item">
                        <span className="item-icon">{moveItem.item.isFolder ? "📁" : "📄"}</span>
                        <div className="item-details">
                          <p className="item-name">{moveItem.item.name}</p>
                          <p className="item-location">
                            {moveItem.bucketName}
                            {moveItem.currentPath && ` / ${moveItem.currentPath}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Destination Selection */}
                <div className="move-destination-section">
                  <h4>📥 Tujuan:</h4>

                  {/* Bucket Selection */}
                  <div className="destination-bucket-selection">
                    <label>Pilih Bucket Tujuan:</label>
                    <select
                      value={selectedDestinationBucket}
                      onChange={(e) => handleDestinationBucketChange(e.target.value)}
                      disabled={moveProgress}
                    >
                      <option value="">-- Pilih Bucket --</option>
                      {buckets.map((bucket) => (
                        <option key={bucket.name} value={bucket.name}>
                          📁 {bucket.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current Destination Path */}
                  {selectedDestinationBucket && (
                    <div className="destination-path">
                      <h5>Lokasi Tujuan Saat Ini:</h5>
                      <div className="destination-breadcrumb">
                        {generateDestinationBreadcrumb().map((crumb, index) => (
                          <span key={index}>
                            {index > 0 && " / "}
                            <button
                              className="breadcrumb-link"
                              onClick={() => navigateToDestinationFolder(crumb.path)}
                              disabled={moveProgress || loadingDestination}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#007bff",
                                cursor: "pointer",
                                textDecoration:
                                  index === generateDestinationBreadcrumb().length - 1 ? "none" : "underline",
                              }}
                            >
                              {crumb.name}
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Folder Navigation */}
                  {selectedDestinationBucket && (
                    <div className="destination-folders">
                      <h5>Folder yang Tersedia:</h5>
                      {loadingDestination ? (
                        <div className="loading-destination">
                          <span className="spinner-small"></span>
                          Memuat folder...
                        </div>
                      ) : (
                        <div className="folder-list">
                          {destinationContents.length === 0 ? (
                            <div className="no-folders">
                              <p>📂 Tidak ada folder di lokasi ini</p>
                              <small>File akan dipindahkan ke root folder</small>
                            </div>
                          ) : (
                            destinationContents.map((folder) => (
                              <div
                                key={folder.name}
                                className="folder-item"
                                onClick={() => navigateToDestinationFolder(folder.fullPath)}
                              >
                                <span className="folder-icon">📂</span>
                                <span className="folder-name">{folder.name}</span>
                                <span className="folder-arrow">→</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Move Progress */}
                {moveProgress && (
                  <div className="move-progress-section">
                    <div className="progress-container" style={{ margin: "20px 0" }}>
                      <div
                        className="progress-bar-container"
                        style={{
                          width: "100%",
                          height: "25px",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${uploadPercentage.move || 0}%`,
                            height: "100%",
                            backgroundColor: "#2196F3",
                            borderRadius: "12px",
                            transition: "width 0.3s ease",
                          }}
                        ></div>
                      </div>
                      <div className="progress-text" style={{ fontSize: "14px", marginTop: "8px", color: "#666" }}>
                        {operationStatus.move || "Processing move..."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-storagefooter">
              <button className="btn btn-secondary" onClick={() => setShowMoveModal(false)} disabled={moveProgress}>
                Batal
              </button>
              <button
                className="btn btn-success"
                onClick={handleMoveItems}
                disabled={moveProgress || !selectedDestinationBucket}
              >
                {moveProgress
                  ? "Memindahkan..."
                  : `Pindahkan ${selectedItems.length > 1 ? `${selectedItems.length} Item` : selectedItems[0].item.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StorageManagement
