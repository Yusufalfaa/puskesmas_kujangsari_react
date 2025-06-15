import { Cloudinary } from '@cloudinary/url-gen'

// Setup Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
  }
})

// Upload function
export const uploadToCloudinary = async (file, folder = 'puskesmas') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', folder)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    const data = await response.json()
    return {
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
      data
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}