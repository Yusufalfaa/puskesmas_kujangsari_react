"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import { useNavigate } from "react-router-dom"
import "./Config_SaranKeluhan.css"
import { Row, Col, Form, Button, Alert, Card } from "react-bootstrap"
import { ArrowLeft, Save, LinkIcon, FileText } from "lucide-react"

const Config_SaranKeluhan = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // State untuk deskripsi
  const [description, setDescription] = useState("")
  const [originalDescription, setOriginalDescription] = useState("")

  // State untuk URL redirect
  const [redirectUrl, setRedirectUrl] = useState("")
  const [originalRedirectUrl, setOriginalRedirectUrl] = useState("")

  // Fetch data saat komponen dimount
  useEffect(() => {
    fetchData()
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

  // Fetch data dari database
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch deskripsi dari text-content table
      const { data: textData, error: textError } = await supabase
        .from("text-content")
        .select("description")
        .eq("categories", "Saran Keluhan")
        .single()

      if (textError && textError.code !== "PGRST116") {
        throw textError
      }

      const fetchedDescription = textData?.description || ""
      setDescription(fetchedDescription)
      setOriginalDescription(fetchedDescription)

      // Fetch URL redirect dari redirect-pages-url table
      const { data: urlData, error: urlError } = await supabase
        .from("redirect-pages-url")
        .select("pagesUrl")
        .eq("categories", "Saran Keluhan")
        .single()

      if (urlError && urlError.code !== "PGRST116") {
        throw urlError
      }

      const fetchedUrl = urlData?.pagesUrl || ""
      setRedirectUrl(fetchedUrl)
      setOriginalRedirectUrl(fetchedUrl)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Gagal memuat data: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update deskripsi
  const updateDescription = async () => {
    if (description === originalDescription) {
      setSuccess("Tidak ada perubahan deskripsi untuk disimpan")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const { error } = await supabase.from("text-content").upsert(
        {
          categories: "Saran Keluhan",
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

  // Update URL redirect
  const updateRedirectUrl = async () => {
    if (redirectUrl === originalRedirectUrl) {
      setSuccess("Tidak ada perubahan URL untuk disimpan")
      return
    }

    // Validasi URL
    if (redirectUrl && !isValidUrl(redirectUrl)) {
      setError("Format URL tidak valid. Pastikan URL dimulai dengan http:// atau https://")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const { error } = await supabase.from("redirect-pages-url").upsert(
        {
          categories: "Saran Keluhan",
          pagesUrl: redirectUrl,
        },
        {
          onConflict: "categories",
        },
      )

      if (error) throw error

      setOriginalRedirectUrl(redirectUrl)
      setSuccess("URL redirect berhasil diperbarui")
    } catch (err) {
      console.error("Error updating redirect URL:", err)
      setError("Gagal memperbarui URL redirect: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Validasi URL
  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Update semua data sekaligus
  const updateAllData = async () => {
    const hasDescriptionChange = description !== originalDescription
    const hasUrlChange = redirectUrl !== originalRedirectUrl

    if (!hasDescriptionChange && !hasUrlChange) {
      setSuccess("Tidak ada perubahan untuk disimpan")
      return
    }

    // Validasi URL jika ada perubahan
    if (hasUrlChange && redirectUrl && !isValidUrl(redirectUrl)) {
      setError("Format URL tidak valid. Pastikan URL dimulai dengan http:// atau https://")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const promises = []

      // Update deskripsi jika ada perubahan
      if (hasDescriptionChange) {
        promises.push(
          supabase.from("text-content").upsert(
            {
              categories: "Saran Keluhan",
              description: description,
            },
            {
              onConflict: "categories",
            },
          ),
        )
      }

      // Update URL jika ada perubahan
      if (hasUrlChange) {
        promises.push(
          supabase.from("redirect-pages-url").upsert(
            {
              categories: "Saran Keluhan",
              pagesUrl: redirectUrl,
            },
            {
              onConflict: "categories",
            },
          ),
        )
      }

      const results = await Promise.all(promises)

      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error
      }

      // Update original values
      if (hasDescriptionChange) setOriginalDescription(description)
      if (hasUrlChange) setOriginalRedirectUrl(redirectUrl)

      setSuccess("Semua perubahan berhasil disimpan")
    } catch (err) {
      console.error("Error updating data:", err)
      setError("Gagal menyimpan perubahan: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="config-saranKeluhan-loading">
        <div className="loading-spinner"></div><p>Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="config-saranKeluhan-saran-keluhan">
      <div className="config-saranKeluhan-header">
        <Button variant="outline-secondary" onClick={() => navigate("/admin-saranKeluhan")} className="back-button">
          <ArrowLeft size={20} />
          Kembali
        </Button>
        <h1>Konfigurasi Saran dan Keluhan</h1>
      </div>

      <div className="config-saranKeluhan-container">
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

        <Row>
          {/* Deskripsi Section */}
          <Col lg={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h3>
                  <FileText size={20} className="me-2" />
                  Deskripsi Saran dan Keluhan
                </h3>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-4">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Masukkan deskripsi untuk halaman saran dan keluhan..."
                  />
                  <Form.Text className="text-muted">
                    Deskripsi ini akan ditampilkan di halaman Saran dan Keluhan
                  </Form.Text>
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={updateDescription}
                  disabled={saving || description === originalDescription}
                  className="w-100"
                >
                  <Save size={20} />
                  {saving ? "Menyimpan..." : "Simpan Deskripsi"}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* URL Redirect Section */}
          <Col lg={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h3>
                  <LinkIcon size={20} className="me-2" />
                  URL Redirect Saran dan Keluhan
                </h3>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-4">
                  <Form.Label>URL Redirect</Form.Label>
                  <Form.Control
                    type="url"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://example.com/saran-keluhan"
                  />
                  <Form.Text className="text-muted">
                    URL ini akan digunakan untuk redirect halaman saran dan keluhan. Pastikan URL dimulai dengan http://
                    atau https://
                  </Form.Text>
                </Form.Group>

                {/* Preview URL */}
                {redirectUrl && (
                  <div className="mb-4">
                    <Form.Label>Preview URL:</Form.Label>
                    <div className="p-3 bg-light rounded">
                      <a href={redirectUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        {redirectUrl}
                      </a>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={updateRedirectUrl}
                  disabled={saving || redirectUrl === originalRedirectUrl}
                  className="w-100"
                >
                  <LinkIcon size={20} />
                  {saving ? "Menyimpan..." : "Simpan URL"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Save All Button */}
        <Card>
          <Card.Body className="text-center">
            <h5 className="mb-3">Simpan Semua Perubahan</h5>
            <p className="text-muted mb-4">Klik tombol di bawah untuk menyimpan semua perubahan sekaligus</p>
            <Button
              variant="success"
              size="lg"
              onClick={updateAllData}
              disabled={saving || (description === originalDescription && redirectUrl === originalRedirectUrl)}
            >
              <Save size={20} />
              {saving ? "Menyimpan Semua..." : "Simpan Semua Perubahan"}
            </Button>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Config_SaranKeluhan
