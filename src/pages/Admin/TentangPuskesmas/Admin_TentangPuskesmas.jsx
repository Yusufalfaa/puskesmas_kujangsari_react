"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabase"
import { useNavigate } from "react-router-dom"
import "./TentangPuskesmas.css"
import { Container, Row, Col } from "react-bootstrap"
import { Settings } from "lucide-react"

const TentangPuskesmas = () => {
  const navigate = useNavigate()
  const [showPopup, setShowPopup] = useState(false)
  const [popupImage, setPopupImage] = useState("")
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })

  // State untuk gambar dari Supabase (tentangkami sekarang array)
  const [images, setImages] = useState({
    tentangkami: [], // Changed to array
    visiMisi: null,
    motto: null,
    tataNilai: null,
    strukturOrganisasi: null,
  })

  // State untuk teks konten dari Supabase
  const [textContent, setTextContent] = useState({
    tentangKami: "",
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fungsi untuk mengambil gambar dari Supabase
  const fetchImages = async () => {
    try {
      setLoading(true)

      // Fetch gambar Tentang Kami (bisa multiple)
      const { data: tentangKamiData, error: tentangKamiError } = await supabase
        .from("img-assets")
        .select("*")
        .eq("assets", "Tentang Kami")
        .order("created_at", { ascending: true }) // Order by creation date

      // Fetch gambar lainnya (single images)
      const [
        { data: visiMisiData, error: visiMisiError },
        { data: mottoData, error: mottoError },
        { data: tataNilaiData, error: tataNilaiError },
        { data: strukturData, error: strukturError },
      ] = await Promise.all([
        supabase.from("img-assets").select("*").eq("assets", "Visi Misi").single(),
        supabase.from("img-assets").select("*").eq("assets", "Motto").single(),
        supabase.from("img-assets").select("*").eq("assets", "Tata Nilai").single(),
        supabase.from("img-assets").select("*").eq("assets", "Struktur Organisasi").single(),
      ])

      console.log("Fetched images data:", {
        tentangKami: tentangKamiData,
        visiMisi: visiMisiData,
        motto: mottoData,
        tataNilai: tataNilaiData,
        struktur: strukturData,
      })

      // Update state dengan gambar yang berhasil diambil
      setImages({
        tentangkami: tentangKamiData || [], // Array of images
        visiMisi: visiMisiData?.imgUrl || null,
        motto: mottoData?.imgUrl || null,
        tataNilai: tataNilaiData?.imgUrl || null,
        strukturOrganisasi: strukturData?.imgUrl || null,
      })

      // Collect errors untuk gambar yang tidak ditemukan
      const errors = []
      if (tentangKamiError && tentangKamiError.code !== "PGRST116") errors.push("Tentang Kami")
      if (visiMisiError) errors.push("Visi Misi")
      if (mottoError) errors.push("Motto")
      if (tataNilaiError) errors.push("Tata Nilai")
      if (strukturError) errors.push("Struktur Organisasi")

      if (errors.length > 0) {
        setError(`Gambar tidak ditemukan: ${errors.join(", ")}`)
      } else {
        setError(null)
      }
    } catch (err) {
      console.error("Error fetching images:", err)
      setError("Gagal memuat gambar dari database.")
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk mengambil teks konten dari Supabase
  const fetchTextContent = async () => {
    try {
      // Fetch teks Tentang Kami
      const { data: tentangKamiText, error: tentangKamiError } = await supabase
        .from("text-content")
        .select("description")
        .eq("categories", "Tentang Kami")
        .single()

      if (tentangKamiError) {
        console.error("Error fetching Tentang Kami text:", tentangKamiError)
      } else {
        setTextContent({
          tentangKami: tentangKamiText?.description || "",
        })
      }
    } catch (err) {
      console.error("Error fetching text content:", err)
    }
  }

  useEffect(() => {
    fetchImages()
    fetchTextContent()
  }, [])

  // Navigation functions for settings buttons
  const handleSettingsClick = (route) => {
    navigate(route)
  }

  const openPopup = (imageSrc) => {
    if (!imageSrc) return // Jangan buka popup jika gambar tidak ada
    setPopupImage(imageSrc)
    setShowPopup(true)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const closePopup = () => {
    setShowPopup(false)
    setPopupImage("")
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const toggleZoom = (e) => {
    e.stopPropagation()
    if (scale === 1) {
      setScale(2)
    } else {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true)
      setStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging || scale === 1) return
    const newX = e.clientX - start.x
    const newY = e.clientY - start.y
    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleWindowMouseMove = (e) => {
      if (isDragging && scale > 1) {
        const newX = e.clientX - start.x
        const newY = e.clientY - start.y
        setPosition({ x: newX, y: newY })
      }
    }

    const handleWindowMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    if (isDragging) {
      window.addEventListener("mousemove", handleWindowMouseMove)
      window.addEventListener("mouseup", handleWindowMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove)
      window.removeEventListener("mouseup", handleWindowMouseUp)
    }
  }, [isDragging, start, scale])

  const dragHandlers = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
  }

  // Component untuk menampilkan placeholder gambar
  const ImagePlaceholder = ({ text }) => (
    <div
      style={{
        height: "300px",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px dashed #dee2e6",
        borderRadius: "5px",
        color: "#6c757d",
      }}
    >
      <p>{text}</p>
    </div>
  )

  // Component untuk menampilkan multiple images dalam gallery
  const ImageGallery = ({ images, altText }) => {
    if (!images || images.length === 0) {
      return <ImagePlaceholder text={`Gambar ${altText} tidak tersedia`} />
    }

    return (
      <div className="image-gallery">
        {images.map((image, index) => (
          <div key={index} className="gallery-item-tentangPuskesmas">
            <img
              src={image.imgUrl || "/placeholder.svg"}
              alt={`${altText} ${index + 1}`}
              onClick={() => openPopup(image.imgUrl)}
              onError={(e) => {
                console.error(`Error loading ${altText} image ${index + 1}`)
                e.target.style.opacity = "0.5"
              }}
              style={{
                width: "100%",
                objectFit: "cover",
                borderRadius: "35px",
                cursor: "pointer",
              }}
            />
            {image.description && (
              <p
                style={{
                  fontSize: "0.9em",
                  color: "#666",
                  textAlign: "center",
                  marginTop: "5px",
                }}
              >
                {image.description}
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Component untuk header section dengan settings button
  const SectionHeader = ({ title, settingsRoute }) => (
    <div className="section-header">
      <h2>{title}</h2>
      <button className="settings-btn-tentangPuskesmas" onClick={() => handleSettingsClick(settingsRoute)} title="Pengaturan">
        <Settings size={17.5} />
      </button>
    </div>
  )

  return (
    <div>
      <div className="banner" style={{
        marginBottom: "-5px",
      }}>
        <h1>PROFIL PUSKESMAS KUJANGSARI</h1>
        <p>Semua yang perlu Anda ketahui tentang Puskesmas Kujangsari tersedia di sini.</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            margin: "20px",
            borderRadius: "5px",
          }}
        >
          <p>Memuat gambar...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "15px",
            borderRadius: "5px",
            margin: "20px",
            textAlign: "center",
          }}
        >
          {error}
          <button
            onClick={fetchImages}
            style={{
              marginLeft: "10px",
              padding: "5px 15px",
              backgroundColor: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="content">
        <section className="tentang-kami">
          <SectionHeader title="Tentang Kami" settingsRoute="/admin-config-tentangKami" />
          <Container>
            <Row>
              <Col md={6} className="text-column">
                {textContent.tentangKami ? (
                  textContent.tentangKami.split("\n").map((paragraph, index) => (
                    <p key={index} style={{ marginBottom: "1rem" }}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p>Memuat konten...</p>
                )}
              </Col>
              <Col md={6} className="image-column">
                <ImageGallery images={images.tentangkami} altText="Tentang Kami" />
              </Col>
            </Row>
          </Container>
        </section>

        <section className="visi-misi">
          <SectionHeader title="Visi & Misi" settingsRoute="/admin-config-visiMisi" />
          <Container>
            <Row>
              <Col className="section-image-container">
                {images.visiMisi ? (
                  <img
                    src={images.visiMisi || "/placeholder.svg"}
                    alt="Visi Misi"
                    onClick={() => openPopup(images.visiMisi)}
                    onError={(e) => {
                      console.error("Error loading visi misi image")
                      e.target.style.opacity = "0.5"
                    }}
                  />
                ) : (
                  <ImagePlaceholder text="Gambar Visi & Misi tidak tersedia" />
                )}
              </Col>
            </Row>
          </Container>
        </section>

        <section className="motto-tata-nilai">
          <SectionHeader title="Motto & Tata Nilai" settingsRoute="/admin-config-motto_tataNilai" />
          <Container>
            <Row>
              <Col md={6} className="section-image-container">
                {images.motto ? (
                  <img
                    src={images.motto || "/placeholder.svg"}
                    alt="Motto"
                    onClick={() => openPopup(images.motto)}
                    onError={(e) => {
                      console.error("Error loading motto image")
                      e.target.style.opacity = "0.5"
                    }}
                  />
                ) : (
                  <ImagePlaceholder text="Gambar Motto tidak tersedia" />
                )}
              </Col>
              <Col md={6} className="section-image-container">
                {images.tataNilai ? (
                  <img
                    src={images.tataNilai || "/placeholder.svg"}
                    alt="Tata Nilai"
                    onClick={() => openPopup(images.tataNilai)}
                    onError={(e) => {
                      console.error("Error loading tata nilai image")
                      e.target.style.opacity = "0.5"
                    }}
                  />
                ) : (
                  <ImagePlaceholder text="Gambar Tata Nilai tidak tersedia" />
                )}
              </Col>
            </Row>
          </Container>
        </section>

        <section className="struktur-organisasi">
          <SectionHeader title="Struktur Organisasi" settingsRoute="/admin-config-strukturOrganisasi" />
          <Container>
            <Row>
              <Col className="section-image-container">
                {images.strukturOrganisasi ? (
                  <img
                    src={images.strukturOrganisasi || "/placeholder.svg"}
                    alt="Struktur Organisasi"
                    onClick={() => openPopup(images.strukturOrganisasi)}
                    onError={(e) => {
                      console.error("Error loading struktur organisasi image")
                      e.target.style.opacity = "0.5"
                    }}
                  />
                ) : (
                  <ImagePlaceholder text="Gambar Struktur Organisasi tidak tersedia" />
                )}
              </Col>
            </Row>
          </Container>
        </section>
      </div>

      {/* Pop-up Gambar */}
      {showPopup && popupImage && (
        <div className="popup" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={popupImage || "/placeholder.svg"}
              alt="Pop-up"
              onClick={toggleZoom}
              {...dragHandlers}
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: isDragging ? "none" : "transform 0.3s ease",
                cursor: scale === 1 ? "zoom-in" : isDragging ? "grabbing" : "grab",
                maxWidth: "90%",
                maxHeight: "90%",
                userSelect: "none",
              }}
            />
            <button className="close-btn" onClick={closePopup}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TentangPuskesmas
