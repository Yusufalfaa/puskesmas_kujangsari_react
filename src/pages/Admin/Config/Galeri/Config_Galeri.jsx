"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import "./Config_Galeri.css"
import { Button } from "react-bootstrap"
import { Edit, Trash2, FolderOpen, RefreshCw } from "lucide-react"

const Config_Gallery = () => {
  const [galleries, setGalleries] = useState([])
  const [groupedGalleries, setGroupedGalleries] = useState({})
  const [expandedSections, setExpandedSections] = useState({})
  const [buckets, setBuckets] = useState([])
  const [folders, setFolders] = useState({})
  const [selectedBucket, setSelectedBucket] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")
  const [photoType, setPhotoType] = useState("")
  const [uploadFile, setUploadFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadingFolders, setLoadingFolders] = useState(false)

  // DITAMBAHKAN: State untuk nama file custom
  const [customFileName, setCustomFileName] = useState("")

  // DITAMBAHKAN: State untuk sync functionality
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 })

  // State untuk modal
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // State untuk form edit
  const [editingPhoto, setEditingPhoto] = useState({
    id: null,
    photoType: "",
    imgUrl: "",
    fileName: "", // DITAMBAHKAN: untuk menyimpan nama file saat edit
  })

  // State untuk form move
  const [movingPhoto, setMovingPhoto] = useState({
    id: null,
    photoType: "",
    imgUrl: "",
    currentBucket: "",
    currentFolder: "",
    newBucket: "",
    newFolder: "",
  })

  // State untuk form delete
  const [deletingPhoto, setDeletingPhoto] = useState({
    id: null,
    photoType: "",
    imgUrl: "",
  })

  // Photo type options
  const photoTypes = ["Tim Kita", "Fasilitas Puskesmas", "Kegiatan", "Pelayanan", "Lainnya"]

  // DITAMBAHKAN: Daftar ekstensi gambar yang diizinkan
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]

  // DITAMBAHKAN: Function untuk mengecek apakah file adalah gambar
  const isImageFile = (filename) => {
    if (!filename || !filename.includes(".")) return false
    const extension = filename.split(".").pop().toLowerCase()
    return imageExtensions.includes(extension)
  }

  // DITAMBAHKAN: Function untuk mendapatkan nama file tanpa ekstensi
  const getFileNameWithoutExtension = (filename) => {
    if (!filename || !filename.includes(".")) return filename
    return filename.substring(0, filename.lastIndexOf("."))
  }

  // DITAMBAHKAN: Function untuk validasi nama file
  const validateFileName = (fileName) => {
    if (!fileName || fileName.trim() === "") {
      return "Nama file tidak boleh kosong"
    }

    // Karakter yang tidak diizinkan dalam nama file
    const invalidChars = /[<>:"/\\|?*]/g
    if (invalidChars.test(fileName)) {
      return 'Nama file tidak boleh mengandung karakter: < > : " / \\ | ? *'
    }

    // Panjang nama file
    if (fileName.length > 100) {
      return "Nama file terlalu panjang (maksimal 100 karakter)"
    }

    return null
  }

  // DITAMBAHKAN: Function untuk membuat nama file yang aman
  const sanitizeFileName = (fileName) => {
    return fileName
      .trim()
      .replace(/[<>:"/\\|?*]/g, "_") // Ganti karakter tidak valid dengan underscore
      .replace(/\s+/g, "_") // Ganti spasi dengan underscore
      .replace(/_{2,}/g, "_") // Ganti multiple underscore dengan single underscore
  }

  useEffect(() => {
    fetchGalleries()
    fetchBuckets()
  }, [])

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("")
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("")
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [success])

  const fetchGalleries = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("gallery")
        .select("*, updated_at")
        .order("created_at", { ascending: false })

      if (error) throw error

      const allData = data || []
      setGalleries(allData)

      // Group galleries by photoType
      const grouped = allData.reduce((groups, gallery) => {
        const type = gallery.photoType || "Lainnya"
        if (!groups[type]) {
          groups[type] = []
        }
        groups[type].push(gallery)
        return groups
      }, {})

      // Sort each category by updated_at (most recent first)
      Object.keys(grouped).forEach((category) => {
        grouped[category].sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0)
          const dateB = new Date(b.updated_at || b.created_at || 0)
          return dateB - dateA // Most recent first
        })
      })

      // Sort categories alphabetically, but keep "Lainnya" at the bottom
      const sortedGroupedGalleries = {}
      const sortedCategories = Object.keys(grouped).sort((a, b) => {
        // Always put "Lainnya" at the bottom
        if (a === "Lainnya") return 1
        if (b === "Lainnya") return -1
        // Sort other categories alphabetically
        return a.localeCompare(b, "id", { sensitivity: "base" })
      })

      // Rebuild the object with sorted categories
      sortedCategories.forEach((category) => {
        sortedGroupedGalleries[category] = grouped[category]
      })

      setGroupedGalleries(sortedGroupedGalleries)

      // Set all sections expanded by default using sorted categories
      const initialExpandedState = {}
      sortedCategories.forEach((category) => {
        initialExpandedState[category] = true
      })
      setExpandedSections(initialExpandedState)
    } catch (error) {
      console.error("Error fetching galleries:", error)
      setError("Gagal mengambil data galeri")
    } finally {
      setLoading(false)
    }
  }

  // Function to toggle expand/collapse
  const toggleSection = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const fetchBuckets = async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets()
      if (error) throw error
      setBuckets(data || [])

      // Fetch folders untuk setiap bucket
      const folderData = {}
      for (const bucket of data || []) {
        const folders = await fetchFoldersForBucket(bucket.name)
        folderData[bucket.name] = folders
      }
      setFolders(folderData)
    } catch (error) {
      console.error("Error fetching buckets:", error)
      setError("Gagal mengambil data bucket")
    }
  }

  const fetchFoldersForBucket = async (bucketName) => {
    try {
      const { data: files, error } = await supabase.storage.from(bucketName).list("", {
        limit: 1000,
        offset: 0,
      })

      if (error) {
        console.error(`Error fetching folders for bucket ${bucketName}:`, error)
        return []
      }

      // Filter untuk mendapatkan folder (items tanpa extension)
      const folders = files
        .filter((file) => file.name && !file.name.includes(".") && file.name !== ".emptyFolderPlaceholder")
        .map((file) => file.name)
        .sort()

      return folders
    } catch (err) {
      console.error(`Error fetching folders for bucket ${bucketName}:`, err)
      return []
    }
  }

  // Update folders ketika bucket berubah
  const updateFoldersForBucket = async (bucketName) => {
    if (!bucketName) return

    setLoadingFolders(true)
    try {
      const bucketFolders = await fetchFoldersForBucket(bucketName)
      setFolders((prev) => ({
        ...prev,
        [bucketName]: bucketFolders,
      }))
    } catch (err) {
      console.error("Error updating folders:", err)
    } finally {
      setLoadingFolders(false)
    }
  }

  // Handle bucket change untuk Upload Modal
  const handleBucketChangeUpload = async (bucketName) => {
    setSelectedBucket(bucketName)
    setSelectedFolder("")

    if (bucketName && !folders[bucketName]) {
      await updateFoldersForBucket(bucketName)
    }
  }

  // Handle bucket change untuk Move Modal
  const handleBucketChangeMove = async (bucketName) => {
    setMovingPhoto({
      ...movingPhoto,
      newBucket: bucketName,
      newFolder: "",
    })

    if (bucketName && !folders[bucketName]) {
      await updateFoldersForBucket(bucketName)
    }
  }

  // Helper function untuk mengekstrak path dari URL
  const extractPathFromUrl = (url) => {
    try {
      // Decode URL sekali untuk mengatasi double encoding
      const decodedUrl = decodeURIComponent(url.trim())

      // Split URL untuk mendapatkan path setelah /storage/v1/object/public/
      const parts = decodedUrl.split("/storage/v1/object/public/")
      if (parts.length < 2) {
        throw new Error("Invalid URL format")
      }

      const fullPath = parts[1]
      const pathParts = fullPath.split("/")

      // Extract bucket name (first part after public/)
      const bucketName = pathParts[0]

      // Extract file path (everything after bucket name)
      const filePath = pathParts.slice(1).join("/")

      return { bucketName, filePath }
    } catch (err) {
      console.error("Error extracting path from URL:", err)
      throw err
    }
  }

  // Helper function untuk membuat URL yang bersih
  const createCleanPublicUrl = (bucketName, filePath) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
    return data.publicUrl
  }

  // Helper function untuk format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "Tidak diketahui"

    try {
      const date = new Date(dateString)
      return date.toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      })
    } catch (err) {
      return "Format tanggal tidak valid"
    }
  }

  // Helper function untuk mendapatkan info lokasi dari URL
  const getLocationInfo = (imgUrl) => {
    try {
      const { bucketName, filePath } = extractPathFromUrl(imgUrl)
      const pathParts = filePath.split("/")
      const folder = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : ""

      return {
        bucket: bucketName,
        folder: folder,
      }
    } catch (err) {
      return {
        bucket: "Tidak diketahui",
        folder: "Tidak diketahui",
      }
    }
  }

  // DITAMBAHKAN: Function untuk mendapatkan nama file dari URL
  const getFileNameFromUrl = (imgUrl) => {
    try {
      const { filePath } = extractPathFromUrl(imgUrl)
      const fileName = filePath.split("/").pop()
      return getFileNameWithoutExtension(fileName)
    } catch (err) {
      return "Tidak diketahui"
    }
  }

  // DITAMBAHKAN: Sync function untuk galeri
  const syncFileLocations = async () => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menyinkronkan lokasi file? Proses ini akan memperbarui URL foto berdasarkan lokasi file gambar di storage.",
      )
    ) {
      return
    }

    setSyncing(true)
    setError("")
    setSuccess("")
    setSyncProgress({ current: 0, total: 0 })

    try {
      console.log("🚀 Starting sync process for gallery images...")

      // Ambil semua data galeri yang memiliki imgUrl
      const { data: allGalleries, error: fetchError } = await supabase
        .from("gallery")
        .select("*")
        .not("imgUrl", "is", null)

      if (fetchError) throw fetchError

      console.log(`📋 Found ${allGalleries.length} gallery items`)
      setSyncProgress({ current: 0, total: allGalleries.length })

      let updatedCount = 0

      // Ambil semua bucket untuk pencarian file
      const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets()
      if (bucketError) throw bucketError

      const allImageFiles = []

      // Scan semua bucket untuk mencari file gambar
      for (const bucket of bucketList) {
        console.log(`🔍 Scanning bucket: ${bucket.name}`)

        // Scan root folder
        const { data: rootFiles, error: rootError } = await supabase.storage.from(bucket.name).list("", { limit: 1000 })

        if (!rootError && rootFiles) {
          // Ambil file gambar di root
          rootFiles
            .filter((file) => isImageFile(file.name))
            .forEach((file) => {
              allImageFiles.push({
                name: file.name,
                nameWithoutExt: getFileNameWithoutExtension(file.name),
                path: file.name,
                bucket: bucket.name,
                folder: "root",
                fullPath: file.name,
              })
            })

          // Scan folders
          const folders = rootFiles.filter((item) => !item.name.includes("."))
          for (const folder of folders) {
            const { data: folderFiles, error: folderError } = await supabase.storage
              .from(bucket.name)
              .list(folder.name, { limit: 1000 })

            if (!folderError && folderFiles) {
              folderFiles
                .filter((file) => isImageFile(file.name))
                .forEach((file) => {
                  allImageFiles.push({
                    name: file.name,
                    nameWithoutExt: getFileNameWithoutExtension(file.name),
                    path: `${folder.name}/${file.name}`,
                    bucket: bucket.name,
                    folder: folder.name,
                    fullPath: `${folder.name}/${file.name}`,
                  })
                })
            }
          }
        }
      }

      console.log(`📄 Total image files found: ${allImageFiles.length}`)

      // Proses setiap item galeri
      for (let i = 0; i < allGalleries.length; i++) {
        const gallery = allGalleries[i]

        try {
          // Extract info dari URL saat ini
          const { bucketName: currentBucket, filePath: currentPath } = extractPathFromUrl(gallery.imgUrl)
          const currentFileName = currentPath.split("/").pop()

          console.log(`\n📷 Processing gallery item ${i + 1}: ${gallery.photoType}`)
          console.log(`   Current: ${currentBucket}/${currentPath}`)

          // Cari file yang cocok berdasarkan nama file
          const matchingFile = allImageFiles.find((file) => {
            return file.name === currentFileName && file.bucket === currentBucket
          })

          if (matchingFile) {
            // Buat URL baru
            const newUrl = createCleanPublicUrl(matchingFile.bucket, matchingFile.fullPath)

            if (newUrl !== gallery.imgUrl) {
              console.log(`🔄 Updating URL for gallery item`)
              console.log(`  Old: ${gallery.imgUrl}`)
              console.log(`  New: ${newUrl}`)

              const { error: updateError } = await supabase
                .from("gallery")
                .update({
                  imgUrl: newUrl,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", gallery.id)

              if (!updateError) {
                console.log(`✅ Successfully updated gallery item`)
                updatedCount++
              } else {
                console.error(`❌ Failed to update gallery item:`, updateError)
              }
            } else {
              console.log(`ℹ️ URL for gallery item is already correct`)
            }
          } else {
            console.log(`❌ No matching file found for gallery item`)
          }
        } catch (itemError) {
          console.error(`❌ Error processing gallery item:`, itemError)
        }

        setSyncProgress({ current: i + 1, total: allGalleries.length })
      }

      if (updatedCount > 0) {
        setSuccess(`Berhasil mengupdate ${updatedCount} dari ${allGalleries.length} URL foto galeri`)
        await fetchGalleries()
      } else {
        setSuccess(`Tidak ada URL yang perlu diupdate dari ${allGalleries.length} foto galeri`)
      }
    } catch (error) {
      console.error("💥 Sync failed:", error)
      setError("Gagal menyinkronkan lokasi file: " + error.message)
    } finally {
      setSyncing(false)
      setSyncProgress({ current: 0, total: 0 })
    }
  }

  // Handle file upload - DIMODIFIKASI untuk menggunakan custom filename
  const handleFileUpload = async (e) => {
    e.preventDefault()

    if (!uploadFile || !selectedBucket || !photoType) {
      setError("Pastikan semua field terisi")
      return
    }

    // Validasi nama file jika diisi
    if (customFileName) {
      const validationError = validateFileName(customFileName)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const fileExt = uploadFile.name.split(".").pop()

      // Gunakan custom filename jika diisi, atau generate otomatis
      let fileName
      if (customFileName && customFileName.trim() !== "") {
        const sanitizedName = sanitizeFileName(customFileName.trim())
        fileName = `${sanitizedName}.${fileExt}`
      } else {
        // Generate unique filename jika tidak ada custom name
        fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      }

      const filePath = selectedFolder ? `${selectedFolder}/${fileName}` : fileName

      // Cek apakah file sudah ada
      const { data: existingFile } = await supabase.storage.from(selectedBucket).list(selectedFolder || "", {
        search: fileName,
      })

      if (existingFile && existingFile.length > 0) {
        setError(`File dengan nama "${fileName}" sudah ada. Gunakan nama yang berbeda.`)
        setSaving(false)
        return
      }

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from(selectedBucket).upload(filePath, uploadFile)

      if (uploadError) throw uploadError

      // Get public URL
      const publicUrl = createCleanPublicUrl(selectedBucket, filePath)

      // Insert into gallery table
      const { error: insertError } = await supabase.from("gallery").insert([
        {
          photoType: photoType,
          imgUrl: publicUrl,
        },
      ])

      if (insertError) throw insertError

      setSuccess("Foto berhasil diupload!")
      setUploadFile(null)
      setPhotoType("")
      setSelectedBucket("")
      setSelectedFolder("")
      setCustomFileName("") // Reset custom filename
      fetchGalleries()
      handleCloseUploadModal()
    } catch (error) {
      console.error("Error uploading file:", error)
      setError("Gagal mengupload foto: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle edit photo - DIMODIFIKASI untuk menghandle rename file
  const handleEditPhoto = async () => {
    if (!editingPhoto.photoType) {
      setError("Tipe foto harus dipilih")
      return
    }

    // Validasi nama file jika diubah
    if (editingPhoto.fileName) {
      const validationError = validateFileName(editingPhoto.fileName)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    try {
      setSaving(true)
      setError("")

      let newImgUrl = editingPhoto.imgUrl

      // Jika nama file diubah, rename file di storage
      if (editingPhoto.fileName && editingPhoto.fileName.trim() !== "") {
        const { bucketName, filePath } = extractPathFromUrl(editingPhoto.imgUrl)
        const currentFileName = filePath.split("/").pop()
        const currentFileNameWithoutExt = getFileNameWithoutExtension(currentFileName)
        const fileExt = currentFileName.split(".").pop()

        const sanitizedNewName = sanitizeFileName(editingPhoto.fileName.trim())
        const newFileName = `${sanitizedNewName}.${fileExt}`

        // Jika nama file berbeda, lakukan rename
        if (newFileName !== currentFileName) {
          const pathParts = filePath.split("/")
          pathParts[pathParts.length - 1] = newFileName
          const newFilePath = pathParts.join("/")

          // Cek apakah file dengan nama baru sudah ada
          const folderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : ""
          const { data: existingFile } = await supabase.storage.from(bucketName).list(folderPath || "", {
            search: newFileName,
          })

          if (existingFile && existingFile.length > 0) {
            setError(`File dengan nama "${newFileName}" sudah ada. Gunakan nama yang berbeda.`)
            setSaving(false)
            return
          }

          // Download file lama
          const { data: fileData, error: downloadError } = await supabase.storage.from(bucketName).download(filePath)
          if (downloadError) throw downloadError

          // Upload dengan nama baru
          const { error: uploadError } = await supabase.storage.from(bucketName).upload(newFilePath, fileData)
          if (uploadError) throw uploadError

          // Hapus file lama
          const { error: deleteError } = await supabase.storage.from(bucketName).remove([filePath])
          if (deleteError) console.error("Error deleting old file:", deleteError)

          // Update URL
          newImgUrl = createCleanPublicUrl(bucketName, newFilePath)
        }
      }

      // Update database
      const { error } = await supabase
        .from("gallery")
        .update({
          photoType: editingPhoto.photoType,
          imgUrl: newImgUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingPhoto.id)

      if (error) throw error

      setSuccess("Foto berhasil diperbarui")
      setShowEditModal(false)
      fetchGalleries()
    } catch (err) {
      console.error("Error updating photo:", err)
      setError("Gagal memperbarui foto: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle move photo
  const handleMovePhoto = async () => {
    if (!movingPhoto.newBucket) {
      setError("Bucket tujuan harus dipilih")
      return
    }

    try {
      setSaving(true)
      setError("")

      // Extract path dari URL lama
      const { bucketName: oldBucketName, filePath: oldFilePath } = extractPathFromUrl(movingPhoto.imgUrl)

      // Dapatkan nama file dari path lama
      const oldFileName = oldFilePath.split("/").pop()

      // Buat path baru
      const newFilePath = movingPhoto.newFolder ? `${movingPhoto.newFolder}/${oldFileName}` : oldFileName

      // Download file dari lokasi lama
      const { data: fileData, error: downloadError } = await supabase.storage.from(oldBucketName).download(oldFilePath)

      if (downloadError) throw downloadError

      // Upload ke lokasi baru
      const { error: uploadError } = await supabase.storage.from(movingPhoto.newBucket).upload(newFilePath, fileData, {
        upsert: false,
      })

      if (uploadError) throw uploadError

      // Get URL baru yang bersih
      const newPublicUrl = createCleanPublicUrl(movingPhoto.newBucket, newFilePath)

      // Update database
      const { error: dbError } = await supabase
        .from("gallery")
        .update({
          imgUrl: newPublicUrl,
        })
        .eq("id", movingPhoto.id)

      if (dbError) throw dbError

      // Hapus file lama jika berbeda bucket/folder
      if (oldBucketName !== movingPhoto.newBucket || oldFilePath !== newFilePath) {
        await supabase.storage.from(oldBucketName).remove([oldFilePath])
      }

      setSuccess("Foto berhasil dipindahkan")
      setShowMoveModal(false)
      fetchGalleries()
    } catch (err) {
      console.error("Error moving photo:", err)
      setError("Gagal memindahkan foto: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle delete photo
  const handleDeletePhoto = async () => {
    try {
      setSaving(true)
      setError("")

      // Hapus dari database
      const { error: dbError } = await supabase.from("gallery").delete().eq("id", deletingPhoto.id)

      if (dbError) throw dbError

      // Extract path dari URL dan hapus dari storage
      const { bucketName, filePath } = extractPathFromUrl(deletingPhoto.imgUrl)

      await supabase.storage.from(bucketName).remove([filePath])

      setSuccess("Foto berhasil dihapus")
      setShowDeleteModal(false)
      fetchGalleries()
    } catch (err) {
      console.error("Error deleting photo:", err)
      setError("Gagal menghapus foto: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Modal handlers
  const handleOpenUploadModal = () => {
    setShowUploadModal(true)
  }

  const handleCloseUploadModal = () => {
    setShowUploadModal(false)
    setSelectedBucket("")
    setSelectedFolder("")
    setPhotoType("")
    setUploadFile(null)
    setCustomFileName("") // Reset custom filename
  }

  const openEditModal = (photo) => {
    setEditingPhoto({
      id: photo.id,
      photoType: photo.photoType,
      imgUrl: photo.imgUrl,
      fileName: getFileNameFromUrl(photo.imgUrl), // Set nama file saat ini
    })
    setShowEditModal(true)
  }

  const openMoveModal = (photo) => {
    try {
      const { bucketName, filePath } = extractPathFromUrl(photo.imgUrl)
      const pathParts = filePath.split("/")
      const currentFolder = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : ""

      setMovingPhoto({
        id: photo.id,
        photoType: photo.photoType,
        imgUrl: photo.imgUrl,
        currentBucket: bucketName,
        currentFolder: currentFolder,
        newBucket: bucketName,
        newFolder: currentFolder,
      })
      setShowMoveModal(true)
    } catch (err) {
      setError("Gagal mengekstrak informasi foto: " + err.message)
    }
  }

  const openDeleteModal = (photo) => {
    setDeletingPhoto({
      id: photo.id,
      photoType: photo.photoType,
      imgUrl: photo.imgUrl,
    })
    setShowDeleteModal(true)
  }

  if (loading) {
    return (
      <div className="config-galeri-loading">
        <div className="loading-spinner"></div>
        <p>Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="config-galeri-gallery">
      {/* Header - DITAMBAHKAN TOMBOL SYNC */}
      <div className="config-galeri-header-new">
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
        <h1>Kelola Galeri</h1>
        <div className="header-actions">
          <button
            className="btn-sync"
            onClick={syncFileLocations}
            disabled={syncing}
            title="Sinkronkan lokasi file gambar yang dipindahkan manual"
          >
            <RefreshCw size={16} className={syncing ? "spinning" : ""} />
            {syncing ? (
              <span>
                Syncing... ({syncProgress.current}/{syncProgress.total})
              </span>
            ) : (
              "Sync Files"
            )}
          </button>
          <button className="btn-add-photo" onClick={handleOpenUploadModal}>
            Tambah Foto
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
          <button className="alert-close" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
          <button className="alert-close" onClick={() => setSuccess("")}>
            ×
          </button>
        </div>
      )}

      {/* Gallery Sections - Following TenagaKerja Structure */}
      <div className="gallery-section">
        <h2>Daftar Galeri Foto</h2>

        {Object.keys(groupedGalleries).length === 0 ? (
          <div className="no-galleries">
            <div className="no-galleries-icon">📷</div>
            <h3>Belum ada foto</h3>
            <p>Tambahkan foto pertama Anda untuk memulai galeri</p>
          </div>
        ) : (
          <div className="gallery-container">
            {Object.entries(groupedGalleries).map(([photoType, photos]) => (
              <div key={photoType} className="gallery-category-section">
                {/* Header dengan tombol expand/collapse */}
                <div className="category-header" onClick={() => toggleSection(photoType)}>
                  <h3>{photoType}</h3>
                  <div className="expand-controls">
                    <span className="item-count">({photos.length} foto)</span>
                    <button className="expand-btn" type="button">
                      <svg
                        className={`expand-icon ${expandedSections[photoType] ? "expanded" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content yang bisa di-expand/collapse */}
                <div className={`gallery-content ${expandedSections[photoType] ? "expanded" : "collapsed"}`}>
                  <div className="gallery-grid">
                    {photos.map((photo) => {
                      const locationInfo = getLocationInfo(photo.imgUrl)
                      return (
                        <div key={photo.id} className="gallery-item">
                          <img
                            src={photo.imgUrl || "/placeholder.svg"}
                            alt={photo.photoType}
                            className="gallery-image"
                          />
                          <div className="gallery-info">
                            {/* DITAMBAHKAN: Informasi nama file */}
                            <div className="photo-details">
                              <small className="photo-filename">
                                <strong>Nama File:</strong> {getFileNameFromUrl(photo.imgUrl)}
                              </small>
                              <small className="photo-location">
                                <strong>Lokasi:</strong> {locationInfo.bucket}/{locationInfo.folder || ""}
                              </small>
                              <small className="photo-updated">
                                <strong>Terakhir diupdate:</strong> {formatDate(photo.updated_at)}
                              </small>
                            </div>

                            <div className="gallery-actions">
                              <Button variant="outline-primary" size="sm" onClick={() => openEditModal(photo)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="outline-warning" size="sm" onClick={() => openMoveModal(photo)}>
                                <FolderOpen size={16} />
                              </Button>
                              <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(photo)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal - DITAMBAHKAN FIELD NAMA FILE */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Upload Foto Baru</h2>
              <button className="modal-close" onClick={handleCloseUploadModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="modal-form">
              {/* DIPINDAHKAN: Field Nama File sebelum Tipe Foto */}
              <div className="form-group">
                <label>Nama File (Opsional):</label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="Masukkan nama file tanpa ekstensi"
                />
                <small className="form-text">
                  Jika kosong, nama file akan dibuat otomatis. Ekstensi akan ditambahkan secara otomatis.
                </small>
              </div>

              <div className="form-group">
                <label>Tipe Foto:</label>
                <select value={photoType} onChange={(e) => setPhotoType(e.target.value)} required>
                  <option value="">Pilih Tipe</option>
                  {photoTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pilih Bucket:</label>
                  <select value={selectedBucket} onChange={(e) => handleBucketChangeUpload(e.target.value)} required>
                    <option value="">Pilih Bucket</option>
                    {buckets.map((bucket) => (
                      <option key={bucket.name} value={bucket.name}>
                        {bucket.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pilih Folder:</label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    disabled={!selectedBucket || loadingFolders}
                  >
                    <option value="">Root Folder</option>
                    {selectedBucket &&
                      folders[selectedBucket]?.map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
                        </option>
                      ))}
                  </select>
                  {loadingFolders && <small className="text-muted">Memuat folder...</small>}
                </div>
              </div>

              <div className="form-group">
                <label>Pilih File:</label>
                <input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files[0])} required />
                {uploadFile && customFileName && (
                  <small className="form-text">
                    <strong>Nama file akan menjadi:</strong> {sanitizeFileName(customFileName)}.
                    {uploadFile.name.split(".").pop()}
                  </small>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseUploadModal}>
                  Batal
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? "Mengupload..." : "Upload Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - DITAMBAHKAN FIELD NAMA FILE */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Foto</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-form">
              {/* DIPINDAHKAN: Field untuk edit nama file sebelum Tipe Foto */}
              <div className="form-group">
                <label>Nama File:</label>
                <input
                  type="text"
                  value={editingPhoto.fileName}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, fileName: e.target.value })}
                  placeholder="Masukkan nama file tanpa ekstensi"
                />
                <small className="form-text">
                  Mengubah nama file akan merename file di storage. Ekstensi akan dipertahankan.
                </small>
              </div>

              <div className="form-group">
                <label>Tipe Foto:</label>
                <select
                  value={editingPhoto.photoType}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, photoType: e.target.value })}
                >
                  {photoTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {editingPhoto.imgUrl && (
                <div className="form-group">
                  <label>Preview Foto:</label>
                  <div className="photo-preview">
                    <img
                      src={editingPhoto.imgUrl || "/placeholder.svg"}
                      alt={editingPhoto.photoType}
                      style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                    />
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Batal
                </button>
                <button type="button" className="btn btn-primary" onClick={handleEditPhoto} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move Modal - DITAMBAHKAN PREVIEW FOTO */}
      {showMoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Pindahkan Foto</h2>
              <button className="modal-close" onClick={() => setShowMoveModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-form">
              <div className="current-location">
                <strong>Lokasi Saat Ini:</strong>
                <p>
                  {movingPhoto.currentBucket}/{movingPhoto.currentFolder || "root"}
                </p>
              </div>

              {/* DITAMBAHKAN: Preview Foto */}
              {movingPhoto.imgUrl && (
                <div className="form-group">
                  <label>Preview Foto:</label>
                  <div className="photo-preview">
                    <img
                      src={movingPhoto.imgUrl || "/placeholder.svg"}
                      alt={movingPhoto.photoType}
                      style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                    />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Bucket Tujuan:</label>
                  <select value={movingPhoto.newBucket} onChange={(e) => handleBucketChangeMove(e.target.value)}>
                    {buckets.map((bucket) => (
                      <option key={bucket.name} value={bucket.name}>
                        {bucket.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Folder Tujuan:</label>
                  <select
                    value={movingPhoto.newFolder}
                    onChange={(e) => setMovingPhoto({ ...movingPhoto, newFolder: e.target.value })}
                    disabled={!movingPhoto.newBucket || loadingFolders}
                  >
                    <option value="">Root (Tidak ada folder)</option>
                    {movingPhoto.newBucket &&
                      folders[movingPhoto.newBucket] &&
                      folders[movingPhoto.newBucket].map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
                        </option>
                      ))}
                  </select>
                  {loadingFolders && <small className="text-muted">Memuat folder...</small>}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMoveModal(false)}>
                  Batal
                </button>
                <button type="button" className="btn btn-warning" onClick={handleMovePhoto} disabled={saving}>
                  {saving ? "Memindahkan..." : "Pindahkan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Hapus Foto</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-form">
              <div className="delete-confirmation">
                <div className="photo-preview">
                  <img
                    src={deletingPhoto.imgUrl || "/placeholder.svg"}
                    alt={deletingPhoto.photoType}
                    style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                  />
                </div>
                <p>
                  Apakah Anda yakin ingin menghapus foto <strong>{deletingPhoto.photoType}</strong>?
                </p>
                <p className="warning-text">Tindakan ini tidak dapat dibatalkan.</p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Batal
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeletePhoto} disabled={saving}>
                  {saving ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Config_Gallery
