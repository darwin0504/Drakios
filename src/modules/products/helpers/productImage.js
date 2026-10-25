const imageFields = [
  'imageUrl',
  'image_url',
  'imagePath',
  'image_path',
  'image',
  'photoUrl',
  'photo_url',
  'photo',
  'pictureUrl',
  'picture_url',
  'picture',
  'thumbnailUrl',
  'thumbnail_url',
  'thumbnail',
]

const getImageValue = (value) => {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  for (const key of ['url', 'secure_url', 'src', 'path', 'location']) {
    if (typeof value[key] === 'string' && value[key].trim()) {
      return value[key].trim()
    }
  }

  return ''
}

export const getProductImageUrl = (product) => {
  if (!product || typeof product !== 'object') {
    return ''
  }

  let imageValue = ''

  for (const field of imageFields) {
    imageValue = getImageValue(product[field])
    if (imageValue) break
  }

  if (!imageValue) {
    for (const [field, value] of Object.entries(product)) {
      if (/^(image|photo|picture|thumbnail)/i.test(field)) {
        imageValue = getImageValue(value)
        if (imageValue) break
      }
    }
  }

  if (!imageValue) {
    imageValue = getImageValue(product.data) || getImageValue(product.product)
  }

  if (!imageValue) {
    return ''
  }

  if (/^(https?:|data:|blob:)/i.test(imageValue)) {
    return imageValue
  }

  try {
    const apiUrl = new URL(import.meta.env.VITE_API_URL || window.location.origin, window.location.origin)
    return new URL(imageValue, `${apiUrl.origin}/`).toString()
  } catch {
    return imageValue
  }
}
