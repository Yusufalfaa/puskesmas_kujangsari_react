"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import "./Config_TenagaKerja.css"

const Config_TenagaKerja = () => {
  const [tenagaKerja, setTenagaKerja] = useState([])
  const [groupedTenagaKerja, setGroupedTenagaKerja] = useState({}) // State untuk data yang dikelompokkan
  const [expandedSections, setExpandedSections] = useState({}) // State untuk expand/collapse
  const [buckets, setBuckets] = useState([])
  const [folders, setFolders] = useState({})
  const [uploadFile, setUploadFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // States untuk modal
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("add") // 'add' atau 'edit'
  const [selectedTenagaKerja, setSelectedTenagaKerja] = useState(null)
  const [uniqueJobdesks, setUniqueJobdesks] = useState([])

  // State untuk menampilkan input bidang pekerjaan baru
  const [showNewJobdeskInput, setShowNewJobdeskInput] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    jobdesk: "",
    degree: "",
    profilePictureUrl: "",
    bucket: "",
    folder: "",
  })

  useEffect(() => {
    fetchTenagaKerja()
    fetchBuckets()
    fetchUniqueJobdesks()
  }, [])

  // Effect untuk mendeteksi bucket dan folder dari foto yang sudah ada
  useEffect(() => {
    if (formData.bucket) {
      fetchFolders(formData.bucket)
    }
  }, [formData.bucket])

  const fetchTenagaKerja = async () => {
    try {
      // Tambahkan created_at dalam query dan urutkan berdasarkan jobdesk dulu
      const { data, error } = await supabase.from("sdm").select("*").order("jobdesk", { ascending: true })

      if (error) throw error

      const allData = data || []
      setTenagaKerja(allData)

      // Kelompokkan data berdasarkan jobdesk
      const grouped = allData.reduce((acc, item) => {
        const category = item.jobdesk || "Tidak Dikategorikan"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      }, {})

      // Urutkan setiap kategori berdasarkan created_at terlama (ascending)
      Object.keys(grouped).forEach((category) => {
        grouped[category].sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateA - dateB // Ascending (terlama dulu)
        })
      })

      setGroupedTenagaKerja(grouped)

      // Set semua section expanded by default
      const initialExpandedState = {}
      Object.keys(grouped).forEach((category) => {
        initialExpandedState[category] = true
      })
      setExpandedSections(initialExpandedState)
    } catch (error) {
      console.error("Error fetching tenaga kerja:", error)
      setError("Gagal mengambil data tenaga kerja")
    }
  }

  // Fungsi untuk toggle expand/collapse
  const toggleSection = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const fetchUniqueJobdesks = async () => {
    try {
      const { data, error } = await supabase.from("sdm").select("jobdesk").not("jobdesk", "is", null)

      if (error) throw error

      const uniqueJobdeskArray = [...new Set(data.map((item) => item.jobdesk))]
      setUniqueJobdesks(uniqueJobdeskArray)
    } catch (error) {
      console.error("Error fetching unique jobdesks:", error)
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

      const folderList = data.filter((item) => !item.name.includes(".")).map((item) => item.name)

      setFolders((prev) => ({ ...prev, [bucketName]: folderList }))
    } catch (error) {
      console.error("Error fetching folders:", error)
      setError("Gagal mengambil data folder")
    }
  }

  // Function untuk mendeteksi bucket dan folder dari URL foto
  const detectBucketAndFolderFromUrl = (url) => {
    if (!url) return { bucket: "", folder: "" }

    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split("/")

      // Format URL Supabase storage: /storage/v1/object/public/bucket-name/folder-name/file-name
      const bucketIndex = pathParts.findIndex((part) => part === "public") + 1

      if (bucketIndex > 0 && bucketIndex < pathParts.length) {
        const bucket = pathParts[bucketIndex]
        const folder = pathParts[bucketIndex + 1] || "root"

        return { bucket, folder }
      }

      return { bucket: "", folder: "" }
    } catch (error) {
      console.error("Error parsing URL:", error)
      return { bucket: "", folder: "" }
    }
  }

  const handleOpenModal = (type, data = null) => {
    setModalType(type)
    setSelectedTenagaKerja(data)
    setShowNewJobdeskInput(false)

    if (type === "edit" && data) {
      // Deteksi bucket dan folder dari foto yang sudah ada
      const { bucket, folder } = detectBucketAndFolderFromUrl(data.profilePictureUrl)

      setFormData({
        name: data.name || "",
        jobdesk: data.jobdesk || "",
        degree: data.degree || "",
        profilePictureUrl: data.profilePictureUrl || "",
        bucket: bucket,
        folder: folder,
      })

      // Jika bucket terdeteksi, load foldernya
      if (bucket) {
        fetchFolders(bucket)
      }
    } else {
      setFormData({
        name: "",
        jobdesk: "",
        degree: "",
        profilePictureUrl: "",
        bucket: "",
        folder: "root", // Set default ke root folder
      })
    }

    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedTenagaKerja(null)
    setShowNewJobdeskInput(false)
    setFormData({
      name: "",
      jobdesk: "",
      degree: "",
      profilePictureUrl: "",
      bucket: "",
      folder: "",
    })
    setUploadFile(null)
  }

  // Handle perubahan dropdown bidang pekerjaan
  const handleJobdeskChange = (e) => {
    const value = e.target.value

    if (value === "new") {
      setShowNewJobdeskInput(true)
      setFormData({ ...formData, jobdesk: "" })
    } else {
      setShowNewJobdeskInput(false)
      setFormData({ ...formData, jobdesk: value })
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.jobdesk || !formData.degree) {
      setError("Nama, Bidang Pekerjaan, dan Gelar harus diisi")
      return
    }

    if (modalType === "add" && !uploadFile) {
      setError("Foto harus diupload")
      return
    }

    if (uploadFile && !formData.bucket) {
      setError("Bucket harus dipilih jika mengupload foto")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let profilePictureUrl = formData.profilePictureUrl

      // Upload file jika ada
      if (uploadFile) {
        const fileExt = uploadFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        // Jika folder adalah 'root', upload langsung ke bucket tanpa folder
        const filePath = formData.folder === "root" ? fileName : `${formData.folder}/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(formData.bucket)
          .upload(filePath, uploadFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from(formData.bucket).getPublicUrl(filePath)

        profilePictureUrl = urlData.publicUrl
      }

      if (modalType === "add") {
        const { data, error } = await supabase.from("sdm").insert([
          {
            name: formData.name,
            jobdesk: formData.jobdesk,
            degree: formData.degree,
            profilePictureUrl: profilePictureUrl,
          },
        ])

        if (error) throw error
        setSuccess("Data tenaga kerja berhasil ditambahkan!")
      } else {
        const { data, error } = await supabase
          .from("sdm")
          .update({
            name: formData.name,
            jobdesk: formData.jobdesk,
            degree: formData.degree,
            profilePictureUrl: profilePictureUrl,
          })
          .eq("id", selectedTenagaKerja.id)

        if (error) throw error
        setSuccess("Data tenaga kerja berhasil diperbarui!")
      }

      fetchTenagaKerja()
      fetchUniqueJobdesks()
      handleCloseModal()
    } catch (error) {
      console.error("Error saving data:", error)
      setError("Gagal menyimpan data: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTenagaKerja = async (id, profilePictureUrl) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data tenaga kerja ini?")) return

    setLoading(true)
    try {
      // Hapus foto dari storage jika ada
      if (profilePictureUrl) {
        try {
          const { bucket, folder } = detectBucketAndFolderFromUrl(profilePictureUrl)

          if (bucket) {
            const url = new URL(profilePictureUrl)
            const fileName = url.pathname.split("/").pop()

            // Jika folder adalah 'root', file berada langsung di bucket
            const filePath = folder === "root" ? fileName : `${folder}/${fileName}`

            const { error: storageError } = await supabase.storage.from(bucket).remove([filePath])

            if (storageError) console.error("Error deleting file:", storageError)
          }
        } catch (urlError) {
          console.error("Error parsing URL:", urlError)
        }
      }

      // Hapus dari database
      const { error: dbError } = await supabase.from("sdm").delete().eq("id", id)

      if (dbError) throw dbError

      setSuccess("Data tenaga kerja berhasil dihapus!")
      fetchTenagaKerja()
      fetchUniqueJobdesks()
    } catch (error) {
      console.error("Error deleting data:", error)
      setError("Gagal menghapus data: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk navigasi ke halaman bucket management
  const navigateToBucketManagement = () => {
    // Ganti dengan routing yang sesuai dengan aplikasi Anda
    window.location.href = "/bucket-management" // atau menggunakan router.push jika menggunakan Next.js router
  }

  return (
    <div className="config-gallery">
      {/* Header */}
      <div className="config-header-new">
        <button className="btn-back" onClick={() => window.history.back()}>
          ← Kembali
        </button>
        <h1>Kelola Tenaga Kerja</h1>
        <div className="header-actions">
          <button className="btn-add-staff" onClick={() => handleOpenModal("add")}>
            Tambah Tenaga Kerja
          </button>
        </div>
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

      {/* Daftar Tenaga Kerja - DIUBAH MENJADI GROUPED */}
      <div className="staff-section">
        <h2>Daftar Tenaga Kerja</h2>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="staff-container">
            {Object.entries(groupedTenagaKerja).map(([category, items]) => (
              <div key={category} className="staff-category-section">
                {/* Header dengan tombol expand/collapse */}
                <div className="category-header" onClick={() => toggleSection(category)}>
                  <h3>{category}</h3>
                  <div className="expand-controls">
                    <span className="item-count">({items.length} orang)</span>
                    <button className="expand-btn" type="button">
                      <svg
                        className={`expand-icon ${expandedSections[category] ? "expanded" : ""}`}
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
                <div className={`staff-content ${expandedSections[category] ? "expanded" : "collapsed"}`}>
                  <div className="staff-grid">
                    {items.map((person) => (
                      <div key={person.id} className="staff-card">
                        <div className="staff-image">
                          {person.profilePictureUrl ? (
                            <img src={person.profilePictureUrl || "/placeholder.svg"} alt={person.name} />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                        </div>
                        <div className="staff-info">
                          <h4>{person.name}</h4>
                          <p className="staff-jobdesk">{person.jobdesk}</p>
                          <p className="staff-degree">{person.degree}</p>
                        </div>
                        <div className="staff-actions">
                          <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal("edit", person)}>
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteTenagaKerja(person.id, person.profilePictureUrl)}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalType === "add" ? "Tambah Tenaga Kerja" : "Edit Tenaga Kerja"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Nama:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bidang Pekerjaan:</label>
                <div className="jobdesk-input-container">
                  <select
                    value={showNewJobdeskInput ? "new" : formData.jobdesk}
                    onChange={handleJobdeskChange}
                    required
                  >
                    <option value="">Pilih Bidang Pekerjaan</option>
                    {uniqueJobdesks.map((jobdesk) => (
                      <option key={jobdesk} value={jobdesk}>
                        {jobdesk}
                      </option>
                    ))}
                    <option value="new">+ Tambah Bidang Pekerjaan Baru</option>
                  </select>

                  {showNewJobdeskInput && (
                    <input
                      type="text"
                      value={formData.jobdesk}
                      onChange={(e) => setFormData({ ...formData, jobdesk: e.target.value })}
                      placeholder="Masukkan bidang pekerjaan baru"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Gelar:</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Foto Profil:</label>
                <input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files[0])} />
                {formData.profilePictureUrl && (
                  <div className="current-image">
                    <p>Foto saat ini:</p>
                    <img
                      src={formData.profilePictureUrl || "/placeholder.svg"}
                      alt="Current"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>

              {(uploadFile || modalType === "add") && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Pilih Bucket:</label>
                    <select
                      value={formData.bucket}
                      onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                      required
                    >
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
                      value={formData.folder}
                      onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                      required
                    >
                      <option value="root">Root (Tanpa Folder)</option>
                      {folders[formData.bucket] &&
                        folders[formData.bucket].map((folder) => (
                          <option key={folder} value={folder}>
                            {folder}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Menyimpan..." : modalType === "add" ? "Tambah" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Config_TenagaKerja
