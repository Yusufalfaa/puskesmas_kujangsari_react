"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import { useNavigate } from "react-router-dom"
import "./Config_TentangKami.css"
import { Container, Row, Col, Form, Button, Alert, Modal, Card } from "react-bootstrap"
import { ArrowLeft, Save, Plus, Edit, Trash2, Upload, FolderOpen, ImageIcon } from "lucide-react"

const Config_TentangKami = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // State untuk teks description
  const [description, setDescription] = useState("")
  const [originalDescription, setOriginalDescription] = useState("")

  // State untuk gambar
  const [images, setImages] = useState([])
  const [buckets, setBuckets] = useState([])
  const [folders, setFolders] = useState({})
  const [loadingFolders, setLoadingFolders] = useState(false)

  // State untuk modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // State untuk form
  const [newImage, setNewImage] = useState({
    file: null,
    name: "",
    bucket: "",
    folder: "",
  })

  const [editingImage, setEditingImage] = useState({
    id: null,
    name: "",
    imgUrl: "",
  })

  const [movingImage, setMovingImage] = useState({
    id: null,
    name: "",
    currentBucket: "",
    currentFolder: "",
    newBucket: "",
    newFolder: "",
  })

  const [deletingImage, setDeletingImage] = useState({
    id: null,
    name: "",
    imgUrl: "",
  })

  // Fetch data saat komponen dimount
  useEffect(() => {
    fetchData()
    fetchBuckets()
  }, [])

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Fetch text description dan images
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch text description
      const { data: textData, error: textError } = await supabase
        .from("text-content")
        .select("description")
        .eq("categories", "Tentang Kami")
        .single()

      if (textError && textError.code !== "PGRST116") {
        throw textError
      }

      const fetchedDescription = textData?.description || ""
      setDescription(fetchedDescription)
      setOriginalDescription(fetchedDescription)

      // Fetch images
      const { data: imageData, error: imageError } = await supabase
        .from("img-assets")
        .select("*, updated_at")
        .eq("assets", "Tentang Kami")
        .order("created_at", { ascending: true })

      if (imageError) {
        throw imageError
      }

      setImages(imageData || [])
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Gagal memuat data: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch buckets dari Supabase Storage
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
    } catch (err) {
      console.error("Error fetching buckets:", err)
    }
  }

  // Fetch folders untuk bucket tertentu
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

  // Handle bucket change untuk Add Modal
  const handleBucketChangeAdd = async (bucketName) => {
    setNewImage({
      ...newImage,
      bucket: bucketName,
      folder: "",
    })

    if (bucketName && !folders[bucketName]) {
      await updateFoldersForBucket(bucketName)
    }
  }

  // Handle bucket change untuk Move Modal
  const handleBucketChangeMove = async (bucketName) => {
    setMovingImage({
      ...movingImage,
      newBucket: bucketName,
      newFolder: "",
    })

    if (bucketName && !folders[bucketName]) {
      await updateFoldersForBucket(bucketName)
    }
  }

  // Helper function untuk mengekstrak path dari URL - FIXED
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

  // Helper function untuk membuat URL yang bersih tanpa double encoding
  const createCleanPublicUrl = (bucketName, filePath) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    // Pastikan URL tidak mengalami double encoding
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
      const folder = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "Root"

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

  // Update text description
  const updateDescription = async () => {
    if (description === originalDescription) {
      setSuccess("Tidak ada perubahan untuk disimpan")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const { error } = await supabase.from("text-content").upsert(
        {
          categories: "Tentang Kami",
          description: description,
        },
        {
          onConflict: "categories",
        },
      )

      if (error) throw error

      setOriginalDescription(description)
      setSuccess("Deskripsi berhasil diperbarui")
    } catch (err) {
      console.error("Error updating description:", err)
      setError("Gagal memperbarui deskripsi: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async () => {
    if (!newImage.file || !newImage.name || !newImage.bucket) {
      setError("File, nama, dan bucket harus diisi")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const fileName = `${newImage.name}.${newImage.file.name.split(".").pop()}`
      const filePath = newImage.folder ? `${newImage.folder}/${fileName}` : fileName

      // Upload file ke storage
      const { error: uploadError } = await supabase.storage.from(newImage.bucket).upload(filePath, newImage.file)

      if (uploadError) throw uploadError

      // Get public URL yang bersih
      const publicUrl = createCleanPublicUrl(newImage.bucket, filePath)

      // Insert ke database
      const { error: dbError } = await supabase.from("img-assets").insert({
        name: newImage.name,
        assets: "Tentang Kami",
        imgUrl: publicUrl,
      })

      if (dbError) throw dbError

      setSuccess("Gambar berhasil ditambahkan")
      setShowAddModal(false)
      setNewImage({
        file: null,
        name: "",
        bucket: "",
        folder: "",
      })
      fetchData()
    } catch (err) {
      console.error("Upload error:", err)
      setError("Gagal mengunggah gambar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle edit image - COMPLETELY FIXED
  const handleEditImage = async () => {
    if (!editingImage.name) {
      setError("Nama gambar harus diisi")
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Extract bucket dan file path dari URL
      const { bucketName, filePath } = extractPathFromUrl(editingImage.imgUrl)

      // Dapatkan extension file dari path
      const fileExtension = filePath.split(".").pop()

      // Buat nama file baru
      const newFileName = `${editingImage.name}.${fileExtension}`

      // Tentukan folder path dan file name
      const pathParts = filePath.split("/")
      const currentFileName = pathParts[pathParts.length - 1]
      const folderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : ""

      // Buat path lengkap baru
      const newFilePath = folderPath ? `${folderPath}/${newFileName}` : newFileName

      // Jika nama file berubah, lakukan operasi rename di storage
      if (currentFileName !== newFileName) {
        // Download file dari storage
        const { data: fileData, error: downloadError } = await supabase.storage.from(bucketName).download(filePath)

        if (downloadError) {
          throw new Error(`Download failed: ${downloadError.message}`)
        }

        // Upload file dengan nama baru
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(newFilePath, fileData, {
          cacheControl: "3600",
          upsert: false, // Jangan overwrite jika sudah ada
        })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Hapus file lama SETELAH upload berhasil
        const { error: deleteError } = await supabase.storage.from(bucketName).remove([filePath])

        if (deleteError) {
          console.warn("Warning: Failed to delete old file:", deleteError.message)
          // Jangan throw error karena file baru sudah berhasil dibuat
        }

        // Dapatkan URL baru yang bersih
        const newPublicUrl = createCleanPublicUrl(bucketName, newFilePath)

        // Update database dengan nama dan URL baru
        const { error: dbError } = await supabase
          .from("img-assets")
          .update({
            name: editingImage.name,
            imgUrl: newPublicUrl,
          })
          .eq("id", editingImage.id)

        if (dbError) {
          throw new Error(`Database update failed: ${dbError.message}`)
        }

        setSuccess("Nama gambar dan file berhasil diperbarui")
      } else {
        // Jika nama file tidak berubah, hanya update nama di database
        const { error: dbError } = await supabase
          .from("img-assets")
          .update({
            name: editingImage.name,
          })
          .eq("id", editingImage.id)

        if (dbError) {
          throw new Error(`Database update failed: ${dbError.message}`)
        }

        setSuccess("Nama gambar berhasil diperbarui")
      }

      setShowEditModal(false)
      fetchData()
    } catch (err) {
      console.error("Error updating image:", err)
      setError("Gagal memperbarui gambar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle move image - FIXED
  const handleMoveImage = async () => {
    if (!movingImage.newBucket) {
      setError("Bucket tujuan harus dipilih")
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Extract path dari URL lama
      const { bucketName: oldBucketName, filePath: oldFilePath } = extractPathFromUrl(movingImage.imgUrl)

      // Dapatkan nama file dari path lama
      const oldFileName = oldFilePath.split("/").pop()
      const fileExtension = oldFileName.split(".").pop()
      const newFileName = `${movingImage.name}.${fileExtension}`

      // Buat path baru
      const newFilePath = movingImage.newFolder ? `${movingImage.newFolder}/${newFileName}` : newFileName

      // Download file dari lokasi lama
      const { data: fileData, error: downloadError } = await supabase.storage.from(oldBucketName).download(oldFilePath)

      if (downloadError) throw downloadError

      // Upload ke lokasi baru
      const { error: uploadError } = await supabase.storage.from(movingImage.newBucket).upload(newFilePath, fileData, {
        upsert: false,
      })

      if (uploadError) throw uploadError

      // Get URL baru yang bersih
      const newPublicUrl = createCleanPublicUrl(movingImage.newBucket, newFilePath)

      // Update database
      const { error: dbError } = await supabase
        .from("img-assets")
        .update({
          imgUrl: newPublicUrl,
        })
        .eq("id", movingImage.id)

      if (dbError) throw dbError

      // Hapus file lama jika berbeda bucket/folder
      if (oldBucketName !== movingImage.newBucket || oldFilePath !== newFilePath) {
        await supabase.storage.from(oldBucketName).remove([oldFilePath])
      }

      setSuccess("Gambar berhasil dipindahkan")
      setShowMoveModal(false)
      fetchData()
    } catch (err) {
      console.error("Error moving image:", err)
      setError("Gagal memindahkan gambar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle delete image
  const handleDeleteImage = async () => {
    try {
      setSaving(true)
      setError(null)

      // Hapus dari database
      const { error: dbError } = await supabase.from("img-assets").delete().eq("id", deletingImage.id)

      if (dbError) throw dbError

      // Extract path dari URL dan hapus dari storage
      const { bucketName, filePath } = extractPathFromUrl(deletingImage.imgUrl)

      await supabase.storage.from(bucketName).remove([filePath])

      setSuccess("Gambar berhasil dihapus")
      setShowDeleteModal(false)
      fetchData()
    } catch (err) {
      console.error("Error deleting image:", err)
      setError("Gagal menghapus gambar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Open modals
  const openAddModal = () => {
    setNewImage({
      file: null,
      name: "",
      bucket: buckets[0]?.name || "",
      folder: "",
    })
    setShowAddModal(true)
  }

  const openEditModal = (image) => {
    setEditingImage({
      id: image.id,
      name: image.name,
      imgUrl: image.imgUrl,
    })
    setShowEditModal(true)
  }

  const openMoveModal = (image) => {
    try {
      const { bucketName, filePath } = extractPathFromUrl(image.imgUrl)
      const pathParts = filePath.split("/")
      const currentFolder = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : ""

      setMovingImage({
        id: image.id,
        name: image.name,
        imgUrl: image.imgUrl,
        currentBucket: bucketName,
        currentFolder: currentFolder,
        newBucket: bucketName,
        newFolder: currentFolder,
      })
      setShowMoveModal(true)
    } catch (err) {
      setError("Gagal mengekstrak informasi gambar: " + err.message)
    }
  }

  const openDeleteModal = (image) => {
    setDeletingImage({
      id: image.id,
      name: image.name,
      imgUrl: image.imgUrl,
    })
    setShowDeleteModal(true)
  }

  if (loading) {
    return (
      <div className="config-tentangKami-tentangKami-loading">
        <div className="loading-spinner"></div>
        <p>Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="config-tentangKami-tentang-kami">
      <div className="config-tentangKami-header">
        <Button variant="outline-secondary" onClick={() => navigate("/admin-tentangPuskesmas")} className="back-button">
          <ArrowLeft size={20} />
          Kembali
        </Button>
        <h1>Konfigurasi Tentang Kami</h1>
      </div>

      <Container>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="custom-alert">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
            <button className="alert-close" onClick={() => setError(null)}>
              ×
            </button>
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="custom-alert">
            <span className="alert-icon">✅</span>
            <span>{success}</span>
            <button className="alert-close" onClick={() => setSuccess(null)}>
              ×
            </button>
          </Alert>
        )}

        {/* Text Description Section */}
        <Card className="mb-4">
          <Card.Header>
            <h3>Deskripsi Tentang Kami</h3>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masukkan deskripsi tentang puskesmas..."
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={updateDescription}
              disabled={saving || description === originalDescription}
            >
              <Save size={20} />
              {saving ? "Menyimpan..." : "Simpan Deskripsi"}
            </Button>
          </Card.Body>
        </Card>

        {/* Images Section */}
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h3>Gambar Tentang Kami</h3>
            <Button variant="success" onClick={openAddModal}>
              <Plus size={20} />
              Tambah Gambar
            </Button>
          </Card.Header>
          <Card.Body>
            {images.length === 0 ? (
              <div className="no-images">
                <ImageIcon size={64} className="text-muted" />
                <p>Belum ada gambar. Tambahkan gambar pertama Anda.</p>
              </div>
            ) : (
              <Row>
                {images.map((image) => {
                  const locationInfo = getLocationInfo(image.imgUrl)
                  return (
                    <Col md={6} lg={4} key={image.id} className="mb-4">
                      <Card className="image-card">
                        <Card.Img variant="top" src={image.imgUrl} alt={image.name} className="image-preview" />
                        <Card.Body>
                          <Card.Title>{image.name}</Card.Title>

                          {/* Informasi lokasi dan update */}
                          <div className="image-info mb-3">
                            <small className="text-muted d-block">
                              <strong>Lokasi:</strong> {locationInfo.bucket}/{locationInfo.folder}
                            </small>
                            <small className="text-muted d-block">
                              <strong>Terakhir diupdate:</strong> {formatDate(image.updated_at)}
                            </small>
                          </div>

                          <div className="image-actions">
                            <Button variant="outline-primary" size="sm" onClick={() => openEditModal(image)}>
                              <Edit size={16} />
                            </Button>
                            <Button variant="outline-warning" size="sm" onClick={() => openMoveModal(image)}>
                              <FolderOpen size={16} />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(image)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Add Image Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tambah Gambar Baru</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Pilih File</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage({ ...newImage, file: e.target.files[0] })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nama Gambar</Form.Label>
              <Form.Control
                type="text"
                value={newImage.name}
                onChange={(e) => setNewImage({ ...newImage, name: e.target.value })}
                placeholder="Masukkan nama gambar"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bucket</Form.Label>
                  <Form.Select value={newImage.bucket} onChange={(e) => handleBucketChangeAdd(e.target.value)}>
                    <option value="">Pilih Bucket</option>
                    {buckets.map((bucket) => (
                      <option key={bucket.name} value={bucket.name}>
                        {bucket.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Folder</Form.Label>
                  <Form.Select
                    value={newImage.folder}
                    onChange={(e) => setNewImage({ ...newImage, folder: e.target.value })}
                    disabled={!newImage.bucket || loadingFolders}
                  >
                    <option value="">Root (Tidak ada folder)</option>
                    {newImage.bucket &&
                      folders[newImage.bucket] &&
                      folders[newImage.bucket].map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
                        </option>
                      ))}
                  </Form.Select>
                  {loadingFolders && <Form.Text className="text-muted">Memuat folder...</Form.Text>}
                  {newImage.bucket &&
                    !loadingFolders &&
                    (!folders[newImage.bucket] || folders[newImage.bucket].length === 0) && (
                      <Form.Text className="text-muted">Tidak ada folder di bucket ini</Form.Text>
                    )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleFileUpload} disabled={saving}>
            <Upload size={20} />
            {saving ? "Mengunggah..." : "Unggah Gambar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Image Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Nama Gambar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama Gambar</Form.Label>
              <Form.Control
                type="text"
                value={editingImage.name}
                onChange={(e) => setEditingImage({ ...editingImage, name: e.target.value })}
                placeholder="Masukkan nama gambar"
              />
            </Form.Group>
            {editingImage.imgUrl && (
              <div className="mb-3">
                <Form.Label>Preview Gambar</Form.Label>
                <div>
                  <img
                    src={editingImage.imgUrl || "/placeholder.svg"}
                    alt={editingImage.name}
                    style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                  />
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleEditImage} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Move Image Modal */}
      <Modal show={showMoveModal} onHide={() => setShowMoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pindahkan Gambar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Lokasi Saat Ini:</strong>
            <p>
              {movingImage.currentBucket}/{movingImage.currentFolder || "root"}
            </p>
          </div>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bucket Tujuan</Form.Label>
                  <Form.Select value={movingImage.newBucket} onChange={(e) => handleBucketChangeMove(e.target.value)}>
                    {buckets.map((bucket) => (
                      <option key={bucket.name} value={bucket.name}>
                        {bucket.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Folder Tujuan</Form.Label>
                  <Form.Select
                    value={movingImage.newFolder}
                    onChange={(e) => setMovingImage({ ...movingImage, newFolder: e.target.value })}
                    disabled={!movingImage.newBucket || loadingFolders}
                  >
                    <option value="">Root (Tidak ada folder)</option>
                    {movingImage.newBucket &&
                      folders[movingImage.newBucket] &&
                      folders[movingImage.newBucket].map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
                        </option>
                      ))}
                  </Form.Select>
                  {loadingFolders && <Form.Text className="text-muted">Memuat folder...</Form.Text>}
                  {movingImage.newBucket &&
                    !loadingFolders &&
                    (!folders[movingImage.newBucket] || folders[movingImage.newBucket].length === 0) && (
                      <Form.Text className="text-muted">Tidak ada folder di bucket ini</Form.Text>
                    )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMoveModal(false)}>
            Batal
          </Button>
          <Button variant="warning" onClick={handleMoveImage} disabled={saving}>
            {saving ? "Memindahkan..." : "Pindahkan"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Image Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Hapus Gambar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-3">
              <img
                src={deletingImage.imgUrl || "/placeholder.svg"}
                alt={deletingImage.name}
                style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
              />
            </div>
            <p>
              Apakah Anda yakin ingin menghapus gambar <strong>{deletingImage.name}</strong>?
            </p>
            <p className="text-muted">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDeleteImage} disabled={saving}>
            <Trash2 size={20} />
            {saving ? "Menghapus..." : "Hapus"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Config_TentangKami
