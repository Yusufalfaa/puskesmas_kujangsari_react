"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import "./Config_Galeri.css"

const Config_Gallery = () => {
  const [galleries, setGalleries] = useState([])
  const [buckets, setBuckets] = useState([])
  const [folders, setFolders] = useState({})
  const [selectedBucket, setSelectedBucket] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")
  const [photoType, setPhotoType] = useState("")
  const [uploadFile, setUploadFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newBucketName, setNewBucketName] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [showAddBucket, setShowAddBucket] = useState(false)
  const [showAddFolder, setShowAddFolder] = useState(false)
  // State untuk bucket yang dipilih saat membuat folder
  const [folderBucket, setFolderBucket] = useState("")

  // State untuk modal upload
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Photo type options
  const photoTypes = ["Tim Kita", "Fasilitas Puskesmas", "Kegiatan", "Pelayanan", "Lainnya"]

  useEffect(() => {
    fetchGalleries()
    fetchBuckets()
  }, [])

  useEffect(() => {
    if (selectedBucket) {
      fetchFolders(selectedBucket)
    }
  }, [selectedBucket])

  // Tambahkan useEffect untuk folderBucket
  useEffect(() => {
    if (folderBucket) {
      fetchFolders(folderBucket)
    }
  }, [folderBucket])

  const fetchGalleries = async () => {
    try {
      const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setGalleries(data || [])
    } catch (error) {
      console.error("Error fetching galleries:", error)
      setError("Gagal mengambil data galeri")
    }
  }

  const fetchBuckets = async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets()
      if (error) throw error
      setBuckets(data || [])
    } catch (error) {
      console.error("Error fetching buckets:", error)
      setError("Gagal mengambil data bucket")
    }
  }

  const fetchFolders = async (bucketName) => {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list("", { limit: 100 })

      if (error) throw error

      // Filter only folders (items without file extensions)
      const folderList = data.filter((item) => !item.name.includes(".")).map((item) => item.name)

      setFolders((prev) => ({ ...prev, [bucketName]: folderList }))
    } catch (error) {
      console.error("Error fetching folders:", error)
      setError("Gagal mengambil data folder")
    }
  }

  // Fungsi untuk membuka modal
  const handleOpenUploadModal = () => {
    setShowUploadModal(true)
  }

  // Fungsi untuk menutup modal
  const handleCloseUploadModal = () => {
    setShowUploadModal(false)
    // Reset form
    setSelectedBucket("")
    setSelectedFolder("")
    setPhotoType("")
    setUploadFile(null)
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()

    if (!uploadFile || !selectedBucket || !photoType) {
      setError("Pastikan semua field terisi")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Generate unique filename
      const fileExt = uploadFile.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = selectedFolder ? `${selectedFolder}/${fileName}` : fileName

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(selectedBucket)
        .upload(filePath, uploadFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from(selectedBucket).getPublicUrl(filePath)

      // Insert into gallery table
      const { data: insertData, error: insertError } = await supabase.from("gallery").insert([
        {
          photoType: photoType,
          imgUrl: urlData.publicUrl,
        },
      ])

      if (insertError) throw insertError

      setSuccess("Foto berhasil diupload!")
      setUploadFile(null)
      setPhotoType("")
      fetchGalleries()

      // Tutup modal setelah berhasil upload
      handleCloseUploadModal()
    } catch (error) {
      console.error("Error uploading file:", error)
      setError("Gagal mengupload foto: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePhoto = async (galleryId, imgUrl) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus foto ini?")) return

    setLoading(true)
    try {
      // Extract file path from URL
      const url = new URL(imgUrl)
      const pathParts = url.pathname.split("/")
      const bucketName = pathParts[pathParts.length - 2]
      const fileName = pathParts[pathParts.length - 1]

      // Delete from storage
      const { error: storageError } = await supabase.storage.from(bucketName).remove([fileName])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase.from("gallery").delete().eq("id", galleryId)

      if (dbError) throw dbError

      setSuccess("Foto berhasil dihapus!")
      fetchGalleries()
    } catch (error) {
      console.error("Error deleting photo:", error)
      setError("Gagal menghapus foto: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) {
      setError("Nama bucket tidak boleh kosong")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.storage.createBucket(newBucketName, {
        public: true,
      })

      if (error) throw error

      setSuccess("Bucket berhasil dibuat!")
      setNewBucketName("")
      setShowAddBucket(false)
      fetchBuckets()
    } catch (error) {
      console.error("Error creating bucket:", error)
      setError("Gagal membuat bucket: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    // Gunakan folderBucket untuk membuat folder
    if (!newFolderName.trim() || !folderBucket) {
      setError("Nama folder dan bucket harus dipilih")
      return
    }

    setLoading(true)
    try {
      // Create a placeholder file in the folder to create the folder structure
      const placeholderFile = new Blob([""], { type: "text/plain" })

      const { error } = await supabase.storage
        .from(folderBucket)
        .upload(`${newFolderName}/.placeholder`, placeholderFile)

      if (error) throw error

      setSuccess("Folder berhasil dibuat!")
      setNewFolderName("")
      setFolderBucket("")
      setShowAddFolder(false)
      fetchFolders(folderBucket)
    } catch (error) {
      console.error("Error creating folder:", error)
      setError("Gagal membuat folder: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBucket = async (bucketName) => {
    if (
      !window.confirm(`Apakah Anda yakin ingin menghapus bucket "${bucketName}"? Semua file di dalamnya akan terhapus.`)
    )
      return

    setLoading(true)
    try {
      const { error } = await supabase.storage.deleteBucket(bucketName)
      if (error) throw error

      setSuccess("Bucket berhasil dihapus!")
      fetchBuckets()

      if (selectedBucket === bucketName) {
        setSelectedBucket("")
        setSelectedFolder("")
      }
      // Reset folderBucket jika bucket yang dihapus sedang dipilih
      if (folderBucket === bucketName) {
        setFolderBucket("")
      }
    } catch (error) {
      console.error("Error deleting bucket:", error)
      setError("Gagal menghapus bucket: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="config-gallery">
      {/* Header - DIUBAH SESUAI PERMINTAAN */}
      <div className="config-header-new">
        <button className="btn-back" onClick={() => window.history.back()}>
          ← Kembali
        </button>
        <h1>Kelola Galeri</h1>
        <button className="btn-add-photo" onClick={handleOpenUploadModal}>
          Tambah Foto
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      {/* Gallery List */}
      <div className="gallery-section">
        <h2>Daftar Foto Galeri</h2>
        <div className="gallery-grid">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="gallery-item">
              <img src={gallery.imgUrl || "/placeholder.svg"} alt={gallery.photoType} className="gallery-image" />
              <div className="gallery-info">
                <p className="photo-type">{gallery.photoType}</p>
                <p className="photo-date">{new Date(gallery.created_at).toLocaleDateString("id-ID")}</p>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeletePhoto(gallery.id, gallery.imgUrl)}>
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Upload */}
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
              <div className="form-row">
                <div className="form-group">
                  <label>Pilih Bucket:</label>
                  <select value={selectedBucket} onChange={(e) => setSelectedBucket(e.target.value)} required>
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
                    disabled={!selectedBucket}
                  >
                    <option value="">Root Folder</option>
                    {selectedBucket &&
                      folders[selectedBucket]?.map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
                        </option>
                      ))}
                  </select>
                </div>
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

              <div className="form-group">
                <label>Pilih File:</label>
                <input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files[0])} required />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseUploadModal}>
                  Batal
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? "Mengupload..." : "Upload Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Config_Gallery
