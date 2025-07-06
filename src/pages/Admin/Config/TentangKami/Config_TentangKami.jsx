"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import { useNavigate } from "react-router-dom"
import "./Config_TentangKami.css"
import { Container, Row, Col, Form, Button, Alert, Modal, Card } from "react-bootstrap"
import { ArrowLeft, Save, Plus, Edit, Trash2, Upload, FolderOpen, Image as ImageIcon } from "lucide-react"

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

  // State untuk modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // State untuk form
  const [newImage, setNewImage] = useState({
    file: null,
    name: "",
    description: "",
    bucket: "",
    folder: ""
  })

  const [editingImage, setEditingImage] = useState({
    id: null,
    name: "",
    description: "",
    imgUrl: ""
  })

  const [movingImage, setMovingImage] = useState({
    id: null,
    name: "",
    currentBucket: "",
    currentFolder: "",
    newBucket: "",
    newFolder: ""
  })

  const [deletingImage, setDeletingImage] = useState({
    id: null,
    name: "",
    imgUrl: ""
  })

  // Fetch data saat komponen dimount
  useEffect(() => {
    fetchData()
    fetchBuckets()
  }, [])

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
        .select("*")
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
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list("", {
            limit: 1000,
            offset: 0
          })
        
        if (!filesError) {
          const folders = files
            .filter(file => file.name && !file.name.includes('.'))
            .map(file => file.name)
          folderData[bucket.name] = folders
        }
      }
      setFolders(folderData)
    } catch (err) {
      console.error("Error fetching buckets:", err)
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

      const { error } = await supabase
        .from("text-content")
        .upsert({
          categories: "Tentang Kami",
          description: description
        }, {
          onConflict: "categories"
        })

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
      setError("Semua field harus diisi")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const fileName = `${newImage.name}.${newImage.file.name.split('.').pop()}`
      const filePath = newImage.folder ? `${newImage.folder}/${fileName}` : fileName

      // Upload file ke storage
      const { error: uploadError } = await supabase.storage
        .from(newImage.bucket)
        .upload(filePath, newImage.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(newImage.bucket)
        .getPublicUrl(filePath)

      // Insert ke database
      const { error: dbError } = await supabase
        .from("img-assets")
        .insert({
          name: newImage.name,
          description: newImage.description,
          assets: "Tentang Kami",
          imgUrl: urlData.publicUrl
        })

      if (dbError) throw dbError

      setSuccess("Gambar berhasil ditambahkan")
      setShowAddModal(false)
      setNewImage({
        file: null,
        name: "",
        description: "",
        bucket: "",
        folder: ""
      })
      fetchData()
    } catch (err) {
      console.error("Error uploading file:", err)
      setError("Gagal mengunggah gambar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle edit image
  const handleEditImage = async () => {
    if (!editingImage.name) {
      setError("Nama gambar harus diisi")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const { error } = await supabase
        .from("img-assets")
        .update({
          name: editingImage.name,
          description: editingImage.description
        })
        .eq("id", editingImage.id)

      if (error) throw error

      setSuccess("Gambar berhasil diperbarui")
      setShowEditModal(false)
      fetchData()
    } catch (err) {
      console.error("Error updating image:", err)
      setError("Gagal memperbarui gambar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle move image
  const handleMoveImage = async () => {
    if (!movingImage.newBucket) {
      setError("Bucket tujuan harus dipilih")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const oldUrl = movingImage.imgUrl
      const fileName = movingImage.name + "." + oldUrl.split('.').pop()
      const newFilePath = movingImage.newFolder ? `${movingImage.newFolder}/${fileName}` : fileName

      // Download file dari URL lama
      const response = await fetch(oldUrl)
      const blob = await response.blob()

      // Upload ke lokasi baru
      const { error: uploadError } = await supabase.storage
        .from(movingImage.newBucket)
        .upload(newFilePath, blob)

      if (uploadError) throw uploadError

      // Get URL baru
      const { data: urlData } = supabase.storage
        .from(movingImage.newBucket)
        .getPublicUrl(newFilePath)

      // Update database
      const { error: dbError } = await supabase
        .from("img-assets")
        .update({
          imgUrl: urlData.publicUrl
        })
        .eq("id", movingImage.id)

      if (dbError) throw dbError

      // Hapus file lama jika berbeda bucket/folder
      if (movingImage.currentBucket !== movingImage.newBucket || 
          movingImage.currentFolder !== movingImage.newFolder) {
        const oldFilePath = movingImage.currentFolder ? 
          `${movingImage.currentFolder}/${fileName}` : fileName
        
        await supabase.storage
          .from(movingImage.currentBucket)
          .remove([oldFilePath])
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
      const { error: dbError } = await supabase
        .from("img-assets")
        .delete()
        .eq("id", deletingImage.id)

      if (dbError) throw dbError

      // Hapus dari storage
      const url = deletingImage.imgUrl
      const urlParts = url.split('/')
      const bucket = urlParts[urlParts.length - 3]
      const fileName = urlParts[urlParts.length - 1]
      
      await supabase.storage
        .from(bucket)
        .remove([fileName])

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
      description: "",
      bucket: buckets[0]?.name || "",
      folder: ""
    })
    setShowAddModal(true)
  }

  const openEditModal = (image) => {
    setEditingImage({
      id: image.id,
      name: image.name,
      description: image.description || "",
      imgUrl: image.imgUrl
    })
    setShowEditModal(true)
  }

  const openMoveModal = (image) => {
    const url = image.imgUrl
    const urlParts = url.split('/')
    const currentBucket = urlParts[urlParts.length - 3]
    const currentFolder = urlParts.length > 4 ? urlParts[urlParts.length - 2] : ""
    
    setMovingImage({
      id: image.id,
      name: image.name,
      imgUrl: image.imgUrl,
      currentBucket,
      currentFolder,
      newBucket: currentBucket,
      newFolder: currentFolder
    })
    setShowMoveModal(true)
  }

  const openDeleteModal = (image) => {
    setDeletingImage({
      id: image.id,
      name: image.name,
      imgUrl: image.imgUrl
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
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/admin-tentangPuskesmas")}
          className="back-button"
        >
          <ArrowLeft size={20} />
          Kembali
        </Button>
        <h1>Konfigurasi Tentang Kami</h1>
      </div>

      <Container>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
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
                {images.map((image) => (
                  <Col md={6} lg={4} key={image.id} className="mb-4">
                    <Card className="image-card">
                      <Card.Img 
                        variant="top" 
                        src={image.imgUrl} 
                        alt={image.name}
                        className="image-preview"
                      />
                      <Card.Body>
                        <Card.Title>{image.name}</Card.Title>
                        <Card.Text className="text-muted">
                          {image.description || "Tidak ada deskripsi"}
                        </Card.Text>
                        <div className="image-actions">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openEditModal(image)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => openMoveModal(image)}
                          >
                            <FolderOpen size={16} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(image)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
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
                onChange={(e) => setNewImage({...newImage, file: e.target.files[0]})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nama Gambar</Form.Label>
              <Form.Control
                type="text"
                value={newImage.name}
                onChange={(e) => setNewImage({...newImage, name: e.target.value})}
                placeholder="Masukkan nama gambar"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deskripsi (Opsional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newImage.description}
                onChange={(e) => setNewImage({...newImage, description: e.target.value})}
                placeholder="Masukkan deskripsi gambar"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bucket</Form.Label>
                  <Form.Select
                    value={newImage.bucket}
                    onChange={(e) => setNewImage({...newImage, bucket: e.target.value})}
                  >
                    <option value="">Pilih Bucket</option>
                    {buckets.map(bucket => (
                      <option key={bucket.name} value={bucket.name}>
                        {bucket.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Folder (Opsional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={newImage.folder}
                    onChange={(e) => setNewImage({...newImage, folder: e.target.value})}
                    placeholder="Masukkan nama folder"
                  />
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
          <Modal.Title>Edit Gambar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama Gambar</Form.Label>
              <Form.Control
                type="text"
                value={editingImage.name}
                onChange={(e) => setEditingImage({...editingImage, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editingImage.description}
                onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
              />
            </Form.Group>
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
            <p>{movingImage.currentBucket}/{movingImage.currentFolder || "root"}</p>
          </div>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bucket Tujuan</Form.Label>
                  <Form.Select
                    value={movingImage.newBucket}
                    onChange={(e) => setMovingImage({...movingImage, newBucket: e.target.value})}
                  >
                    {buckets.map(bucket => (
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
                  <Form.Control
                    type="text"
                    value={movingImage.newFolder}
                    onChange={(e) => setMovingImage({...movingImage, newFolder: e.target.value})}
                    placeholder="Kosongkan untuk root"
                  />
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
          <p>Apakah Anda yakin ingin menghapus gambar <strong>{deletingImage.name}</strong>?</p>
          <p className="text-danger">Tindakan ini tidak dapat dibatalkan.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDeleteImage} disabled={saving}>
            {saving ? "Menghapus..." : "Hapus"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Config_TentangKami