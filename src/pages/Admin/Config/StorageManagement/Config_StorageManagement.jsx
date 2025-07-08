"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import "./StorageManagement.css"

const StorageManagement = () => {
  const [buckets, setBuckets] = useState([])
  const [calculatingStorage, setCalculatingStorage] = useState(false)
  const [refreshingStorage, setRefreshingStorage] = useState(false) // State baru untuk refresh
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newBucketName, setNewBucketName] = useState("")
  const [showAddBucketModal, setShowAddBucketModal] = useState(false)

  // States untuk bucket content management
  const [expandedBucket, setExpandedBucket] = useState("")
  const [bucketContents, setBucketContents] = useState({})
  const [showUploadForm, setShowUploadForm] = useState({})
  const [uploadFileToBucket, setUploadFileToBucket] = useState(null)
  const [newFolderInBucket, setNewFolderInBucket] = useState({})
  const [showCreateFolderForm, setShowCreateFolderForm] = useState({})

  // State untuk navigasi folder
  const [currentFolderPath, setCurrentFolderPath] = useState({})

  // State untuk storage usage
  const [storageUsage, setStorageUsage] = useState({
    database: 0,
    storage: 0,
    maxDatabase: 500, // 500 MB untuk free tier
    maxStorage: 1024, // 1 GB untuk free tier
  })

  // Ganti progress states dengan yang lebih detail
  const [uploadProgress, setUploadProgress] = useState({})
  const [createFolderProgress, setCreateFolderProgress] = useState({})
  const [deleteProgress, setDeleteProgress] = useState({})
  const [generalLoading, setGeneralLoading] = useState(false)

  // Tambahkan state untuk progress percentage
  const [uploadPercentage, setUploadPercentage] = useState({})
  const [operationStatus, setOperationStatus] = useState({})

  // Tambahkan state untuk delete bucket progress
  const [deleteBucketProgress, setDeleteBucketProgress] = useState({})

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

      // Langsung hitung storage usage setelah buckets dimuat
      if (data && data.length > 0) {
        await fetchStorageUsageOptimized(data, true) // true untuk initial load
      }
    } catch (error) {
      console.error("Error fetching buckets:", error)
      setError("Gagal mengambil data bucket")
    } finally {
      setGeneralLoading(false)
    }
  }

  // Fungsi untuk menghitung database usage menggunakan RPC
  const fetchDatabaseUsage = async () => {
    try {
      // Coba gunakan RPC function terlebih dahulu
      const { data: sizeData, error: sizeError } = await supabase.rpc("get_database_size")

      if (!sizeError && sizeData && sizeData.length > 0) {
        return Math.max(sizeData[0].total_size_mb || 1, 1)
      }

      // Fallback: hitung manual berdasarkan tabel
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
          // Table mungkin tidak ada atau tidak bisa diakses
          continue
        }
      }

      if (accessibleTables === 0) {
        // Jika tidak ada tabel yang bisa diakses, return estimasi minimal
        return 2 // 2MB minimal
      }

      // Estimasi: 2KB per row rata-rata
      const estimatedDbSize = Math.round((totalRows * 2048) / (1024 * 1024))

      return Math.max(estimatedDbSize, 1) // Minimal 1MB
    } catch (error) {
      console.error("Error calculating database usage:", error)
      return 3 // Default 3MB jika gagal
    }
  }

  // Fungsi optimized untuk menghitung storage usage
  const fetchStorageUsageOptimized = async (bucketsData = buckets, isInitialLoad = false) => {
    if (isInitialLoad) {
      setCalculatingStorage(true)
    } else {
      setRefreshingStorage(true)
    }

    try {
      let totalStorageSize = 0

      console.log("Starting storage calculation...")

      // Hitung database usage
      const dbUsage = await fetchDatabaseUsage()

      // Hitung storage usage
      for (const bucket of bucketsData) {
        try {
          console.log(`Processing bucket: ${bucket.name}`)
          const bucketSize = await calculateBucketSizeOptimized(bucket.name)
          totalStorageSize += bucketSize
          console.log(`Bucket ${bucket.name}: ${(bucketSize / (1024 * 1024)).toFixed(2)} MB`)
        } catch (err) {
          console.warn(`Error calculating size for bucket ${bucket.name}:`, err)
        }
      }

      console.log(`Total storage: ${(totalStorageSize / (1024 * 1024)).toFixed(2)} MB`)
      console.log(`Database usage: ${dbUsage} MB`)

      setStorageUsage((prev) => ({
        ...prev,
        database: dbUsage,
        storage: Math.round(totalStorageSize / (1024 * 1024)), // Convert to MB
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

  // Fungsi untuk membuat RPC function di Supabase (opsional)
  const createDatabaseSizeRPC = async () => {
    // Anda perlu menjalankan SQL ini di Supabase SQL Editor:
    /*
    CREATE OR REPLACE FUNCTION get_database_size()
    RETURNS bigint
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      db_size bigint;
    BEGIN
      SELECT pg_database_size(current_database()) INTO db_size;
      RETURN db_size;
    END;
    $$;
    */

    try {
      const { data, error } = await supabase.rpc("get_database_size")
      if (error) throw error
      return Math.round(data / (1024 * 1024)) // Convert to MB
    } catch (error) {
      console.warn("RPC function not available, using estimation")
      return await fetchDatabaseUsage()
    }
  }

  // Fungsi untuk mendapatkan daftar tabel dan menghitung usage
  const fetchDatabaseUsageAdvanced = async () => {
    try {
      // Coba dapatkan informasi tabel dari information_schema
      const { data: tables, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_type", "BASE TABLE")

      if (error) {
        console.warn("Cannot access information_schema, using manual calculation")
        return await fetchDatabaseUsage()
      }

      let totalEstimatedSize = 0

      for (const table of tables) {
        try {
          const { count, error: countError } = await supabase
            .from(table.table_name)
            .select("*", { count: "exact", head: true })

          if (!countError && count) {
            // Estimasi berdasarkan nama tabel
            let avgRowSize = 1024 // 1KB default

            // Sesuaikan estimasi berdasarkan jenis tabel
            if (table.table_name.includes("log") || table.table_name.includes("audit")) {
              avgRowSize = 512 // Log biasanya lebih kecil
            } else if (table.table_name.includes("user") || table.table_name.includes("profile")) {
              avgRowSize = 2048 // User data biasanya lebih besar
            } else if (table.table_name.includes("content") || table.table_name.includes("post")) {
              avgRowSize = 4096 // Content bisa lebih besar
            }

            totalEstimatedSize += count * avgRowSize
          }
        } catch (err) {
          console.warn(`Error processing table ${table.table_name}:`, err)
        }
      }

      return Math.round(totalEstimatedSize / (1024 * 1024)) // Convert to MB
    } catch (error) {
      console.error("Error in advanced database calculation:", error)
      return await fetchDatabaseUsage()
    }
  }

  // Fungsi optimized untuk menghitung ukuran bucket
  const calculateBucketSizeOptimized = async (bucketName, folderPath = "", depth = 0) => {
    // Batasi kedalaman rekursi untuk mencegah infinite loop
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

        // Cek apakah ini adalah folder
        const isFolder = !file.name.includes(".") || file.metadata?.mimetype === "application/x-directory"

        if (isFolder) {
          // Rekursif untuk folder
          const folderSize = await calculateBucketSizeOptimized(bucketName, fullPath, depth + 1)
          totalSize += folderSize
        } else {
          // Untuk file, gunakan metadata size jika tersedia
          if (file.metadata && file.metadata.size) {
            totalSize += file.metadata.size
          } else {
            // Fallback: estimasi berdasarkan nama file atau gunakan ukuran default
            // Ini lebih cepat daripada download
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

  // Fungsi untuk estimasi ukuran file berdasarkan ekstensi
  const estimateFileSize = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    // Estimasi berdasarkan tipe file (dalam bytes)
    const sizeEstimates = {
      // Images
      jpg: 2 * 1024 * 1024, // 2MB
      jpeg: 2 * 1024 * 1024, // 2MB
      png: 3 * 1024 * 1024, // 3MB
      gif: 1 * 1024 * 1024, // 1MB
      webp: 1.5 * 1024 * 1024, // 1.5MB

      // Documents
      pdf: 5 * 1024 * 1024, // 5MB
      doc: 1 * 1024 * 1024, // 1MB
      docx: 1 * 1024 * 1024, // 1MB
      xls: 2 * 1024 * 1024, // 2MB
      xlsx: 2 * 1024 * 1024, // 2MB

      // Videos
      mp4: 50 * 1024 * 1024, // 50MB
      avi: 100 * 1024 * 1024, // 100MB
      mov: 75 * 1024 * 1024, // 75MB

      // Audio
      mp3: 5 * 1024 * 1024, // 5MB
      wav: 10 * 1024 * 1024, // 10MB

      // Default
      default: 1 * 1024 * 1024, // 1MB
    }

    return sizeEstimates[extension] || sizeEstimates["default"]
  }

  // Alternative: Menggunakan Supabase RPC untuk menghitung storage (jika tersedia)
  const fetchStorageUsageViaRPC = async () => {
    setCalculatingStorage(true)
    try {
      // Ini adalah contoh jika Anda membuat RPC function di Supabase
      // CREATE OR REPLACE FUNCTION get_storage_usage()
      // RETURNS TABLE(bucket_name text, total_size bigint)
      // LANGUAGE plpgsql
      // AS $$
      // BEGIN
      //   RETURN QUERY
      //   SELECT
      //     b.name as bucket_name,
      //     COALESCE(SUM(o.metadata->>'size')::bigint, 0) as total_size
      //   FROM storage.buckets b
      //   LEFT JOIN storage.objects o ON b.id = o.bucket_id
      //   GROUP BY b.name;
      // END;
      // $$;

      const { data, error } = await supabase.rpc("get_storage_usage")

      if (error) throw error

      let totalSize = 0
      if (data) {
        totalSize = data.reduce((sum, bucket) => sum + (bucket.total_size || 0), 0)
      }

      setStorageUsage((prev) => ({
        ...prev,
        storage: Math.round(totalSize / (1024 * 1024)), // Convert to MB
      }))
    } catch (error) {
      console.error("RPC method not available, falling back to client-side calculation")
      // Fallback ke method optimized
      await fetchStorageUsageOptimized()
    } finally {
      setCalculatingStorage(false)
    }
  }

  // Helper function untuk clear cache bucket
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

  // Fetch bucket contents dengan caching
  const fetchBucketContents = async (bucketName, folderPath = "", forceRefresh = false) => {
    const cacheKey = `${bucketName}/${folderPath}`

    // Cek cache terlebih dahulu, kecuali jika force refresh
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

  // Toggle bucket expansion
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

  // Navigasi ke folder
  const navigateToFolder = async (bucketName, folderPath) => {
    setCurrentFolderPath((prev) => ({ ...prev, [bucketName]: folderPath }))
    await fetchBucketContents(bucketName, folderPath)
  }

  // Generate breadcrumb
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

  // Validasi file gambar
  const validateImageFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    const maxSize = 10 * 1024 * 1024 // 10MB maksimal

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Hanya file gambar yang diizinkan (JPEG, PNG, GIF, WebP, SVG)")
    }

    if (file.size > maxSize) {
      throw new Error("Ukuran file maksimal 10MB")
    }

    return true
  }

  // Upload file to bucket
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

      // Simulasi progress untuk upload
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

      // Complete progress
      setUploadPercentage((prev) => ({ ...prev, [progressKey]: 100 }))
      setOperationStatus((prev) => ({ ...prev, [progressKey]: "Upload selesai!" }))

      setTimeout(() => {
        setSuccess("File berhasil diupload!")
        setUploadFileToBucket(null)
        setShowUploadForm((prev) => ({ ...prev, [`${bucketName}/${folderPath}`]: false }))
      }, 500)

      // Clear cache dan refresh data
      setBucketContents((prev) => {
        const newContents = { ...prev }
        Object.keys(newContents).forEach((key) => {
          if (key.startsWith(bucketName)) {
            delete newContents[key]
          }
        })
        return newContents
      })

      // Delay kecil untuk memastikan Supabase sudah update
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

  // Create folder in bucket
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

      // Simulasi progress untuk creating folder
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

      // Clear cache dan refresh data
      setBucketContents((prev) => {
        const newContents = { ...prev }
        Object.keys(newContents).forEach((key) => {
          if (key.startsWith(bucketName)) {
            delete newContents[key]
          }
        })
        return newContents
      })

      // Delay kecil untuk memastikan Supabase sudah update
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

  // Delete file from bucket
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

      // Clear cache dan refresh data
      setBucketContents((prev) => {
        const newContents = { ...prev }
        Object.keys(newContents).forEach((key) => {
          if (key.startsWith(bucketName)) {
            delete newContents[key]
          }
        })
        return newContents
      })

      // Delay kecil untuk memastikan Supabase sudah update
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

  // Delete folder from bucket
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

      // Clear cache dan refresh data
      setBucketContents((prev) => {
        const newContents = { ...prev }
        Object.keys(newContents).forEach((key) => {
          if (key.startsWith(bucketName)) {
            delete newContents[key]
          }
        })
        return newContents
      })

      // Delay kecil untuk memastikan Supabase sudah update
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

  // Get file URL
  const getFileUrl = (bucketName, filePath) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
    return data.publicUrl
  }

  // Format file size
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

      // Clear cache
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

  // Clear messages
  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  // Render storage usage chart
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

        {/* Tombol untuk refresh storage usage */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            className="btn btn-primary"
            onClick={() => fetchStorageUsageOptimized(buckets, false)} // false untuk refresh manual
            disabled={calculatingStorage || refreshingStorage}
          >
            {calculatingStorage ? "Calculating..." : refreshingStorage ? "Refreshing..." : "Refresh"}
          </button>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
            *Ukuran dihitung berdasarkan metadata dan estimasi
          </p>
        </div>
      </div>
    )
  }

  // Render bucket contents
  const renderBucketContents = (bucketName, folderPath = "") => {
    const currentPath = currentFolderPath[bucketName] || ""
    const contents = bucketContents[`${bucketName}/${currentPath}`] || []
    const contentKey = `${bucketName}/${currentPath}`
    const breadcrumb = generateBreadcrumb(bucketName)

    return (
      <div className="bucket-contents">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-nav">
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
            <div key={item.name} className="content-item">
              <div className="content-info">
                <span
                  className="content-icon"
                  style={{ cursor: item.isFolder ? "pointer" : "default" }}
                  onClick={() => {
                    if (item.isFolder) {
                      navigateToFolder(bucketName, item.fullPath)
                    }
                  }}
                >
                  {item.isFolder ? "📁" : "📄"}
                </span>
                <div className="content-details">
                  <p
                    className="content-name"
                    style={{ cursor: item.isFolder ? "pointer" : "default" }}
                    onClick={() => {
                      if (item.isFolder) {
                        navigateToFolder(bucketName, item.fullPath)
                      }
                    }}
                  >
                    {item.name}
                  </p>
                  {!item.isFolder && (
                    <p className="content-size">
                      {item.metadata?.size ? formatFileSize(item.metadata.size) : "Ukuran tidak diketahui"}
                    </p>
                  )}
                </div>
              </div>
              <div className="content-actions">
                {!item.isFolder && (
                  <a
                    href={getFileUrl(bucketName, item.fullPath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-info btn-sm"
                  >
                    Lihat
                  </a>
                )}
                {item.isFolder ? (
                  <div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteFolder(bucketName, item.fullPath)}
                      disabled={deleteProgress[`${bucketName}/${item.fullPath}`]}
                    >
                      {deleteProgress[`${bucketName}/${item.fullPath}`] ? "Deleting..." : "Hapus"}
                    </button>
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
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteFile(bucketName, item.fullPath)}
                      disabled={deleteProgress[`${bucketName}/${item.fullPath}`]}
                    >
                      {deleteProgress[`${bucketName}/${item.fullPath}`] ? "Deleting..." : "Hapus File"}
                    </button>
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
            <div className="loading">
              <span className="spinner"></span>
              Loading...
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
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteBucket(bucket.name)}
                      disabled={deleteBucketProgress[bucket.name]}
                    >
                      {deleteBucketProgress[bucket.name] ? "Deleting..." : "Hapus"}
                    </button>
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

        {/* Storage Usage Charts */}
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
    </div>
  )
}

export default StorageManagement
