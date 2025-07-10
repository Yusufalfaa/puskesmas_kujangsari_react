"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import "./Config_TenagaMedis.css"

const Config_TenagaMedis = () => {
  const [doctors, setDoctors] = useState([])
  const [groupedDoctors, setGroupedDoctors] = useState({})
  const [expandedSections, setExpandedSections] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  // Fetch data dokter dari database
  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)

      // Metode 1: Menggunakan JOIN untuk mengambil data sekaligus
      const { data: doctorsWithHomepage, error: joinError } = await supabase.from("sdm").select(`
          id,
          name,
          jobdesk,
          degree,
          profilePictureUrl,
          medical_personnel_homepage:medical-personnel-homepage(
            id,
            set-show
          )
        `)

      if (joinError) {
        console.log("JOIN error, trying alternative method:", joinError)

        // Metode 2: Fetch terpisah jika JOIN gagal
        const { data: homepageData, error: homepageError } = await supabase
          .from("medical-personnel-homepage")
          .select("*")

        if (homepageError) throw homepageError

        const { data: doctorDetails, error: doctorError } = await supabase
          .from("sdm")
          .select("id, name, jobdesk, degree, profilePictureUrl")
          .in("jobdesk", ["Dokter", "Dokter Gigi"])

        if (doctorError) throw doctorError

        // Gabungkan data homepage dengan detail dokter
        const combinedData = doctorDetails.map((doctor) => {
          const homepageInfo = homepageData.find((hp) => hp.doctor_id === doctor.id)
          return {
            ...doctor,
            set_show: homepageInfo ? homepageInfo["set-show"] : false,
            homepage_id: homepageInfo ? homepageInfo.id : null,
          }
        })

        setDoctors(combinedData)
        groupDoctorsByJobdesk(combinedData)
      } else {
        // Proses data dari JOIN
        const processedData = doctorsWithHomepage.map((doctor) => {
          const homepageInfo = doctor.medical_personnel_homepage?.[0]
          return {
            id: doctor.id,
            name: doctor.name,
            jobdesk: doctor.jobdesk,
            degree: doctor.degree,
            profilePictureUrl: doctor.profilePictureUrl,
            set_show: homepageInfo ? homepageInfo["set-show"] : false,
            homepage_id: homepageInfo ? homepageInfo.id : null,
          }
        })

        setDoctors(processedData)
        groupDoctorsByJobdesk(processedData)
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
      setMessage("Error mengambil data dokter: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Function untuk mengelompokkan dokter berdasarkan jobdesk
  const groupDoctorsByJobdesk = (doctorsData) => {
    // Group doctors by jobdesk
    const grouped = doctorsData.reduce((groups, doctor) => {
      const jobdesk = doctor.jobdesk || "Lainnya"
      if (!groups[jobdesk]) {
        groups[jobdesk] = []
      }
      groups[jobdesk].push(doctor)
      return groups
    }, {})

    // Sort each category by name (A-Z)
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => {
        return a.name.localeCompare(b.name, "id", { sensitivity: "base" })
      })
    })

    // Sort categories alphabetically A-Z
    const sortedGroupedDoctors = {}
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      return a.localeCompare(b, "id", { sensitivity: "base" })
    })

    // Rebuild the object with sorted categories
    sortedCategories.forEach((category) => {
      sortedGroupedDoctors[category] = grouped[category]
    })

    setGroupedDoctors(sortedGroupedDoctors)

    // Set all sections expanded by default
    const initialExpandedState = {}
    sortedCategories.forEach((category) => {
      initialExpandedState[category] = true
    })
    setExpandedSections(initialExpandedState)
  }

  // Function to toggle expand/collapse
  const toggleSection = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleToggleShow = async (doctorId, currentStatus) => {
    try {
      setSaving(true)

      const doctor = doctors.find((d) => d.id === doctorId)

      if (doctor.homepage_id) {
        // Update existing record
        const { error } = await supabase
          .from("medical-personnel-homepage")
          .update({ "set-show": !currentStatus })
          .eq("id", doctor.homepage_id)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase.from("medical-personnel-homepage").insert({
          doctor_id: doctorId,
          "set-show": !currentStatus,
        })

        if (error) throw error
      }

      // Update local state
      const updatedDoctors = doctors.map((doctor) =>
        doctor.id === doctorId ? { ...doctor, set_show: !currentStatus } : doctor,
      )

      setDoctors(updatedDoctors)
      groupDoctorsByJobdesk(updatedDoctors)

      setMessage("Pengaturan berhasil diperbarui")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error updating doctor status:", error)
      setMessage("Error memperbarui pengaturan")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleRefreshData = async () => {
    try {
      setSaving(true)

      // Refresh data untuk memastikan sinkronisasi
      await fetchDoctors()

      setMessage("Data berhasil diperbarui")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error refreshing data:", error)
      setMessage("Error memperbarui data")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="config-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Memuat data dokter...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="config-container">
      {/* Header baru sesuai Config_Galeri */}
      <div className="config-tenaga-medis-header-new">
        <div className="header-left">
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
        </div>

        <div className="header-center">
          <h1>Konfigurasi Tenaga Medis</h1>
          <p>Atur dokter mana saja yang ingin ditampilkan di halaman utama</p>
        </div>

        <div className="header-actions">
          <button className="btn-refresh" onClick={handleRefreshData} disabled={saving}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {saving ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {message && <div className={`message ${message.includes("Error") ? "error" : "success"}`}>{message}</div>}

      {/* Medical Staff Sections - Following Config_Galeri Structure */}
      <div className="medical-staff-section">
        <h2>Daftar Tenaga Medis</h2>
        {Object.keys(groupedDoctors).length === 0 ? (
          <div className="empty-state">
            <p>Tidak ada data dokter yang ditemukan</p>
          </div>
        ) : (
          <div className="config-medical-staff-container">
            {Object.entries(groupedDoctors).map(([jobdesk, doctorsInCategory]) => (
              <div key={jobdesk} className="medical-staff-category-section">
                {/* Header dengan tombol expand/collapse */}
                <div className="category-header" onClick={() => toggleSection(jobdesk)}>
                  <h3>{jobdesk}</h3>
                  <div className="expand-controls">
                    <span className="item-count">({doctorsInCategory.length} orang)</span>
                    <button className="expand-btn" type="button">
                      <svg
                        className={`expand-icon ${expandedSections[jobdesk] ? "expanded" : ""}`}
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
                <div className={`medical-staff-content ${expandedSections[jobdesk] ? "expanded" : "collapsed"}`}>
                  <div className="doctors-grid">
                    {doctorsInCategory.map((doctor) => (
                      <div key={doctor.id} className="doctor-card">
                        <div className="doctor-image-container">
                          <img
                            src={doctor.profilePictureUrl || "/default-doctor.png"}
                            alt={doctor.name}
                            className="doctor-image"
                            onError={(e) => {
                              e.target.src = "/default-doctor.png"
                            }}
                          />
                        </div>

                        <div className="doctor-info">
                          <h3 className="doctor-name">{doctor.name}</h3>
                          <p className="doctor-specialization">
                            {doctor.degree} - {doctor.jobdesk}
                          </p>
                        </div>

                        <div className="doctor-controls">
                          <label className="toggle-label">Status Tampil:</label>
                          <div className="toggle-container">
                            <select
                              className={`status-dropdown ${doctor.set_show ? "active" : "inactive"}`}
                              value={doctor.set_show ? "true" : "false"}
                              onChange={(e) => handleToggleShow(doctor.id, doctor.set_show)}
                              disabled={saving}
                            >
                              <option value="true">Ditampilkan</option>
                              <option value="false">Disembunyikan</option>
                            </select>
                          </div>
                        </div>

                        <div className="doctor-status">
                          <span className={`status-badge ${doctor.set_show ? "active" : "inactive"}`}>
                            {doctor.set_show ? "Aktif" : "Tidak Aktif"}
                          </span>
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
    </div>
  )
}

export default Config_TenagaMedis
