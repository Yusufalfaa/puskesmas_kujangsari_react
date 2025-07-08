"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import "./Config_TenagaKerja.css"
import { Button } from "react-bootstrap"
import { Edit, Trash2, RefreshCw, Search } from "lucide-react"

const Config_TenagaKerja = () => {
  const [tenagaKerja, setTenagaKerja] = useState([])
  const [groupedTenagaKerja, setGroupedTenagaKerja] = useState({})
  const [expandedSections, setExpandedSections] = useState({})
  const [buckets, setBuckets] = useState([])
  const [folders, setFolders] = useState({})
  const [uploadFile, setUploadFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // States untuk modal
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("add")
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

  // PERBAIKAN: Daftar ekstensi gambar yang diizinkan
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]

  // PERBAIKAN: Function untuk mengecek apakah file adalah gambar
  const isImageFile = (filename) => {
    if (!filename || !filename.includes(".")) return false
    const extension = filename.split(".").pop().toLowerCase()
    return imageExtensions.includes(extension)
  }

  // PERBAIKAN: Function untuk mendapatkan nama file tanpa ekstensi
  const getFileNameWithoutExtension = (filename) => {
    if (!filename || !filename.includes(".")) return filename
    return filename.substring(0, filename.lastIndexOf("."))
  }

  useEffect(() => {
    fetchTenagaKerja()
    fetchBuckets()
    fetchUniqueJobdesks()
  }, [])

  useEffect(() => {
    if (formData.bucket) {
      fetchFolders(formData.bucket)
    }
  }, [formData.bucket])

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

  const fetchTenagaKerja = async () => {
    try {
      const { data, error } = await supabase
        .from("sdm")
        .select("*, created_at, updated_at")
        .order("jobdesk", { ascending: true })

      if (error) throw error

      const allData = data || []
      setTenagaKerja(allData)

      const grouped = allData.reduce((acc, item) => {
        const category = item.jobdesk || "Tidak Dikategorikan"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      }, {})

      Object.keys(grouped).forEach((category) => {
        grouped[category].sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateA - dateB
        })
      })

      setGroupedTenagaKerja(grouped)

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

  const detectBucketAndFolderFromUrl = (url) => {
    if (!url) return { bucket: "", folder: "" }

    try {
      let workingUrl = url
      try {
        workingUrl = decodeURIComponent(url)
      } catch (decodeError) {
        workingUrl = url
      }

      const urlObj = new URL(workingUrl)
      const pathParts = urlObj.pathname.split("/")

      const bucketIndex = pathParts.findIndex((part) => part === "public") + 1

      if (bucketIndex > 0 && bucketIndex < pathParts.length) {
        const bucket = pathParts[bucketIndex]

        let folder = "root"
        if (bucketIndex + 1 < pathParts.length) {
          const folderPart = pathParts[bucketIndex + 1]
          if (folderPart && !folderPart.includes(".")) {
            folder = folderPart
          }
        }

        return { bucket, folder }
      }

      return { bucket: "", folder: "" }
    } catch (error) {
      console.error("Error parsing URL:", error)
      return { bucket: "", folder: "" }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Tidak diketahui"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Tidak diketahui"
    }
  }

  const getStorageLocation = (url) => {
    if (!url) return "Tidak ada foto"

    try {
      const decodedUrl = decodeURIComponent(url)
      const { bucket, folder } = detectBucketAndFolderFromUrl(decodedUrl)

      if (!bucket) return "Lokasi tidak diketahui"

      if (folder === "root") {
        return bucket
      }

      const decodedFolder = decodeURIComponent(folder)
      return `${bucket}/${decodedFolder}`
    } catch (error) {
      console.error("Error getting storage location:", error)
      return "Lokasi tidak diketahui"
    }
  }

  // DEBUG FUNCTION: Lihat semua data staff dan file
  const debugSync = async () => {
    console.log("🔍 DEBUG: Starting debug analysis...")

    try {
      // 1. Lihat semua staff
      const { data: allStaff, error: fetchError } = await supabase
        .from("sdm")
        .select("*")
        .not("profilePictureUrl", "is", null)

      if (fetchError) throw fetchError

      console.log("👥 ALL STAFF DATA:")
      allStaff.forEach((staff, index) => {
        const expectedFileName = `${staff.name || "NULL"} ${staff.degree || "NULL"}`
        console.log(`${index + 1}. ${staff.name} ${staff.degree}`)
        console.log(`   ID: ${staff.id}`)
        console.log(`   URL: ${staff.profilePictureUrl}`)
        console.log(`   Expected filename (without ext): "${expectedFileName}"`)
        console.log("")
      })

      // 2. Lihat semua file di bucket sdm
      const { data: rootFiles, error: rootError } = await supabase.storage.from("sdm").list("", { limit: 1000 })

      if (rootError) throw rootError

      console.log("📁 ALL IMAGE FILES IN SDM BUCKET:")

      // PERBAIKAN: Filter hanya file gambar di root
      const rootImageFiles = rootFiles.filter((file) => isImageFile(file.name))
      console.log("Root image files:")
      rootImageFiles.forEach((file) => {
        const nameWithoutExt = getFileNameWithoutExtension(file.name)
        console.log(`  - ${file.name} -> "${nameWithoutExt}"`)
      })

      // PERBAIKAN: Filter hanya file gambar di folder
      const folders = rootFiles.filter((item) => !item.name.includes("."))
      console.log(`\nFolders found: ${folders.map((f) => f.name).join(", ")}`)

      for (const folder of folders) {
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from("sdm")
          .list(folder.name, { limit: 1000 })

        if (!folderError && folderFiles) {
          const folderImageFiles = folderFiles.filter((file) => isImageFile(file.name))
          console.log(`\n${folder.name}/ folder image files:`)
          folderImageFiles.forEach((file) => {
            const nameWithoutExt = getFileNameWithoutExtension(file.name)
            console.log(`  - ${folder.name}/${file.name} -> "${nameWithoutExt}"`)
          })
        }
      }

      // 3. PERBAIKAN: Manual matching test untuk semua staff
      console.log("\n🎯 MANUAL MATCHING TEST FOR ALL STAFF:")
      for (const staff of allStaff) {
        if (!staff.name || !staff.degree) {
          console.log(`⚠️ Skipping ${staff.name || "Unknown"} - missing name or degree`)
          continue
        }

        const expectedFileName = `${staff.name.trim()} ${staff.degree.trim()}`
        console.log(`\nTesting ${staff.name}: "${expectedFileName}"`)

        // Test di semua folder
        for (const folder of folders) {
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from("sdm")
            .list(folder.name, { limit: 1000 })

          if (!folderError && folderFiles) {
            const folderImageFiles = folderFiles.filter((file) => isImageFile(file.name))

            const matchingFile = folderImageFiles.find((file) => {
              const nameWithoutExt = getFileNameWithoutExtension(file.name)
              return nameWithoutExt === expectedFileName
            })

            if (matchingFile) {
              console.log(`  ✅ Found in ${folder.name}: ${matchingFile.name}`)
            } else {
              console.log(`  ❌ Not found in ${folder.name}`)
              // Show what files are available for comparison
              if (folderImageFiles.length > 0) {
                console.log(`    Available files in ${folder.name}:`)
                folderImageFiles.forEach((file) => {
                  const nameWithoutExt = getFileNameWithoutExtension(file.name)
                  console.log(`      - "${file.name}" -> "${nameWithoutExt}"`)
                })
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Debug failed:", error)
    }
  }

  // MANUAL FIX: Update Pele specifically
  const manualFixPele = async () => {
    if (!window.confirm("Apakah Anda yakin ingin memperbaiki URL Pele secara manual?")) return

    setSyncing(true)
    setError("")
    setSuccess("")

    try {
      console.log("🔧 MANUAL FIX: Starting manual fix for Pele...")

      // 1. Find Pele in database
      const { data: allStaff, error: staffError } = await supabase.from("sdm").select("*").eq("name", "Pele")

      if (staffError) throw staffError

      if (!allStaff || allStaff.length === 0) {
        throw new Error("Pele tidak ditemukan di database")
      }

      const peleData = allStaff[0]
      console.log("Found Pele:", peleData)

      // 2. PERBAIKAN: Buat expected filename berdasarkan nama + gelar
      if (!peleData.name || !peleData.degree) {
        throw new Error("Data Pele tidak lengkap (nama atau gelar kosong)")
      }

      const expectedFileName = `${peleData.name.trim()} ${peleData.degree.trim()}`
      console.log(`Looking for file with name (without extension): "${expectedFileName}"`)

      // 3. PERBAIKAN: Check semua file gambar di folder Bidan
      const { data: bidanFiles, error: bidanError } = await supabase.storage.from("sdm").list("Bidan", { limit: 1000 })

      if (bidanError) throw bidanError

      // Filter hanya file gambar
      const bidanImageFiles = bidanFiles.filter((file) => isImageFile(file.name))

      console.log("Image files in Bidan folder:")
      bidanImageFiles.forEach((file) => {
        const nameWithoutExt = getFileNameWithoutExtension(file.name)
        console.log(`  - "${file.name}" -> "${nameWithoutExt}"`)
      })

      // PERBAIKAN: Cari berdasarkan nama tanpa ekstensi
      const matchingFile = bidanImageFiles.find((file) => {
        const nameWithoutExt = getFileNameWithoutExtension(file.name)
        const isMatch = nameWithoutExt === expectedFileName
        console.log(`Checking: "${nameWithoutExt}" === "${expectedFileName}" -> ${isMatch}`)
        return isMatch
      })

      if (matchingFile) {
        console.log(`✅ Found matching image file: ${matchingFile.name}`)

        // 4. Generate new URL
        const newPath = `Bidan/${matchingFile.name}`
        const { data: urlData } = supabase.storage.from("sdm").getPublicUrl(newPath)
        const newUrl = urlData.publicUrl

        console.log(`Old URL: ${peleData.profilePictureUrl}`)
        console.log(`New URL: ${newUrl}`)

        // 5. Update database
        const { error: updateError } = await supabase
          .from("sdm")
          .update({
            profilePictureUrl: newUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", peleData.id)

        if (updateError) throw updateError

        console.log("✅ Successfully updated Pele's URL")
        setSuccess(`Berhasil memperbaiki URL Pele! File: ${matchingFile.name}`)
        await fetchTenagaKerja()
      } else {
        console.log("❌ No matching image file found in Bidan folder")
        console.log(`Expected: "${expectedFileName}" (with any image extension)`)
        setError(`File gambar "${expectedFileName}" tidak ditemukan di folder Bidan`)
      }
    } catch (error) {
      console.error("Manual fix failed:", error)
      setError("Gagal memperbaiki URL Pele: " + error.message)
    } finally {
      setSyncing(false)
    }
  }

  // PERBAIKAN: SYNC FUNCTION yang fokus pada file gambar
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
      console.log("🚀 Starting sync process for image files...")

      const { data: allStaff, error: fetchError } = await supabase
        .from("sdm")
        .select("*")
        .not("profilePictureUrl", "is", null)

      if (fetchError) throw fetchError

      console.log(`📋 Found ${allStaff.length} staff members`)
      setSyncProgress({ current: 0, total: allStaff.length })

      let updatedCount = 0

      const { data: rootFiles, error: rootError } = await supabase.storage.from("sdm").list("", { limit: 1000 })

      if (rootError) throw rootError

      const allImageFiles = []

      if (rootFiles) {
        // PERBAIKAN: Hanya ambil file gambar di root
        rootFiles
          .filter((file) => isImageFile(file.name))
          .forEach((file) => {
            allImageFiles.push({
              name: file.name,
              nameWithoutExt: getFileNameWithoutExtension(file.name),
              path: file.name,
              folder: "root",
            })
          })

        const folders = rootFiles.filter((item) => !item.name.includes("."))

        for (const folder of folders) {
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from("sdm")
            .list(folder.name, { limit: 1000 })

          if (!folderError && folderFiles) {
            // PERBAIKAN: Hanya ambil file gambar di folder
            folderFiles
              .filter((file) => isImageFile(file.name))
              .forEach((file) => {
                allImageFiles.push({
                  name: file.name,
                  nameWithoutExt: getFileNameWithoutExtension(file.name),
                  path: `${folder.name}/${file.name}`,
                  folder: folder.name,
                })
              })
          }
        }
      }

      console.log(`📄 Total image files found: ${allImageFiles.length}`)
      allImageFiles.forEach((file) => {
        console.log(`  - ${file.path} -> "${file.nameWithoutExt}"`)
      })

      for (let i = 0; i < allStaff.length; i++) {
        const staff = allStaff[i]

        if (!staff.name || !staff.degree) {
          console.log(`⚠️ Skipping ${staff.name || "Unknown"} - missing data`)
          setSyncProgress({ current: i + 1, total: allStaff.length })
          continue
        }

        const expectedFileName = `${staff.name.trim()} ${staff.degree.trim()}`
        console.log(`\n👤 Processing ${staff.name}: Looking for "${expectedFileName}"`)

        // PERBAIKAN: Cari berdasarkan nama tanpa ekstensi
        const matchingFile = allImageFiles.find((file) => {
          return file.nameWithoutExt === expectedFileName
        })

        if (matchingFile) {
          console.log(`✅ Found matching image: ${matchingFile.path}`)

          const { data: urlData } = supabase.storage.from("sdm").getPublicUrl(matchingFile.path)
          const newUrl = urlData.publicUrl

          if (newUrl !== staff.profilePictureUrl) {
            console.log(`🔄 Updating URL for ${staff.name}`)
            console.log(`  Old: ${staff.profilePictureUrl}`)
            console.log(`  New: ${newUrl}`)

            const { error: updateError } = await supabase
              .from("sdm")
              .update({
                profilePictureUrl: newUrl,
                updated_at: new Date().toISOString(),
              })
              .eq("id", staff.id)

            if (!updateError) {
              console.log(`✅ Successfully updated ${staff.name}`)
              updatedCount++
            } else {
              console.error(`❌ Failed to update ${staff.name}:`, updateError)
            }
          } else {
            console.log(`ℹ️ URL for ${staff.name} is already correct`)
          }
        } else {
          console.log(`❌ No matching image file found for ${staff.name}`)
        }

        setSyncProgress({ current: i + 1, total: allStaff.length })
      }

      if (updatedCount > 0) {
        setSuccess(`Berhasil mengupdate ${updatedCount} dari ${allStaff.length} URL foto`)
        await fetchTenagaKerja()
      } else {
        setSuccess(`Tidak ada URL yang perlu diupdate dari ${allStaff.length} file`)
      }
    } catch (error) {
      console.error("💥 Sync failed:", error)
      setError("Gagal menyinkronkan lokasi file: " + error.message)
    } finally {
      setSyncing(false)
      setSyncProgress({ current: 0, total: 0 })
    }
  }

  const handleOpenModal = (type, data = null) => {
    setModalType(type)
    setSelectedTenagaKerja(data)
    setShowNewJobdeskInput(false)

    if (type === "edit" && data) {
      const { bucket, folder } = detectBucketAndFolderFromUrl(data.profilePictureUrl)

      setFormData({
        name: data.name || "",
        jobdesk: data.jobdesk || "",
        degree: data.degree || "",
        profilePictureUrl: data.profilePictureUrl || "",
        bucket: bucket,
        folder: folder,
      })

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
        folder: "root",
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

    const cleanName = (formData.name || "").trim()
    const cleanDegree = (formData.degree || "").trim()

    if (!cleanName || !cleanDegree) {
      setError("Nama dan Gelar tidak boleh kosong")
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

      if (uploadFile) {
        const fileExt = uploadFile.name.split(".").pop()
        const cleanName = formData.name.trim()
        const cleanDegree = formData.degree.trim()
        const fileName = `${cleanName} ${cleanDegree}.${fileExt}`
        const filePath = formData.folder === "root" ? fileName : `${formData.folder}/${fileName}`

        if (modalType === "edit" && selectedTenagaKerja?.profilePictureUrl) {
          try {
            const { bucket: oldBucket, folder: oldFolder } = detectBucketAndFolderFromUrl(
              selectedTenagaKerja.profilePictureUrl,
            )

            if (oldBucket) {
              const oldUrl = new URL(selectedTenagaKerja.profilePictureUrl)
              const oldFileName = decodeURIComponent(oldUrl.pathname.split("/").pop())
              const oldFilePath = oldFolder === "root" ? oldFileName : `${oldFolder}/${oldFileName}`

              await supabase.storage.from(oldBucket).remove([oldFilePath])
            }
          } catch (deleteError) {
            console.error("Error deleting old file:", deleteError)
          }
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(formData.bucket)
          .upload(filePath, uploadFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from(formData.bucket).getPublicUrl(filePath)
        profilePictureUrl = urlData.publicUrl
      }

      const currentTime = new Date().toISOString()

      if (modalType === "add") {
        const { data, error } = await supabase.from("sdm").insert([
          {
            name: formData.name,
            jobdesk: formData.jobdesk,
            degree: formData.degree,
            profilePictureUrl: profilePictureUrl,
            created_at: currentTime,
            updated_at: currentTime,
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
            updated_at: currentTime,
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
      if (profilePictureUrl) {
        try {
          const { bucket, folder } = detectBucketAndFolderFromUrl(profilePictureUrl)

          if (bucket) {
            const url = new URL(profilePictureUrl)
            const fileName = decodeURIComponent(url.pathname.split("/").pop())
            const filePath = folder === "root" ? fileName : `${folder}/${fileName}`

            const { error: storageError } = await supabase.storage.from(bucket).remove([filePath])

            if (storageError) console.error("Error deleting file:", storageError)
          }
        } catch (urlError) {
          console.error("Error parsing URL:", urlError)
        }
      }

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

  return (
    <div className="config-tenagaKerja">
      {/* Header */}
      <div className="config-tenagaKerja-header-new">
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
        <h1>Kelola Tenaga Kerja</h1>
        <div className="header-actions">
          <button
            className="btn-debug"
            onClick={debugSync}
            title="Debug: Lihat semua data dan file gambar"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              color: "#e53e3e",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Search size={16} />
            Debug
          </button>
          <button
            className="btn-manual-fix"
            onClick={manualFixPele}
            disabled={syncing}
            title="Manual fix untuk Pele"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              color: "#38a169",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Fix Pele
          </button>
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

      {/* Daftar Tenaga Kerja */}
      <div className="staff-section">
        <h2>Daftar Tenaga Kerja</h2>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="staff-container">
            {Object.entries(groupedTenagaKerja).map(([category, items]) => (
              <div key={category} className="staff-category-section">
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

                          <div className="photo-details">
                            <small className="photo-location">
                              <strong>Lokasi:</strong> {getStorageLocation(person.profilePictureUrl)}
                            </small>
                            <small className="photo-updated">
                              <strong>Terakhir diupdate:</strong> {formatDate(person.updated_at)}
                            </small>
                          </div>
                        </div>
                        <div className="staff-actions">
                          <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal("edit", person)}>
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteTenagaKerja(person.id, person.profilePictureUrl)}
                          >
                            <Trash2 size={16} />
                          </Button>
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

      {/* Modal sama seperti sebelumnya */}
      {showModal && (
        <div className="modal-tenagaKerja-overlay">
          <div className="modal-tenagaKerja-content">
            <div className="modal-tenagaKerja-header">
              <h2>{modalType === "add" ? "Tambah Tenaga Kerja" : "Edit Tenaga Kerja"}</h2>
              <button className="modal-tenagaKerja-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-tenagaKerja-form">
              <div className="form-group">
                <label>Nama:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Naufalino Farhan"
                  required
                />
                <small className="form-text">Nama akan disimpan di database tanpa gelar</small>
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
                  placeholder="Contoh: S.T"
                  required
                />
                <small className="form-text">Gelar akan digabung dengan nama untuk nama file foto</small>
              </div>

              {formData.name && formData.degree && (
                <div className="file-name-preview">
                  <strong>Nama file foto akan menjadi:</strong> {formData.name.trim()} {formData.degree.trim()}.jpg
                </div>
              )}

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
                    <div className="current-image-info">
                      <p>
                        <strong>Lokasi:</strong> {getStorageLocation(formData.profilePictureUrl)}
                      </p>
                    </div>
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

              <div className="modal-tenagaKerja-actions">
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
