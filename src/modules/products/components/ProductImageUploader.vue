<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  currentImageUrl: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'update:error', 'update:preview'])

const fileInput = ref(null)
const previewUrl = ref('')
const error = ref('')
const dragging = ref(false)
const imageLoadFailed = ref(false)

const hasImage = computed(() => Boolean(previewUrl.value || props.currentImageUrl))
const displayedImage = computed(() => {
  if (previewUrl.value) return previewUrl.value
  return imageLoadFailed.value ? '' : props.currentImageUrl
})

const formatFileSize = (size) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

const setError = (message) => {
  error.value = message
  emit('update:error', message)
}

const clearPreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

const openFilePicker = () => {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}

const selectFile = (file) => {
  if (!file) return

  setError('')
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    clearPreview()
    emit('update:modelValue', null)
    emit('update:preview', props.currentImageUrl)
    setError('El formato no es compatible. Selecciona una imagen JPG, PNG o WEBP.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    clearPreview()
    emit('update:modelValue', null)
    emit('update:preview', props.currentImageUrl)
    setError('La imagen supera el límite de 5 MB. Elige un archivo más liviano.')
    return
  }

  clearPreview()
  imageLoadFailed.value = false
  previewUrl.value = URL.createObjectURL(file)
  emit('update:modelValue', file)
  emit('update:preview', previewUrl.value)
}

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  selectFile(file)
}

const handleDrop = (event) => {
  dragging.value = false
  selectFile(event.dataTransfer?.files?.[0])
}

const resetSelection = () => {
  clearPreview()
  imageLoadFailed.value = false
  setError('')
  emit('update:modelValue', null)
  emit('update:preview', props.currentImageUrl)
}

onBeforeUnmount(clearPreview)
</script>

<template>
  <section class="product-image-uploader" :aria-busy="disabled">
    <input
      ref="fileInput"
      class="product-image-file-input"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      aria-label="Seleccionar imagen del producto"
      aria-hidden="true"
      tabindex="-1"
      :disabled="disabled"
      @change="handleFileChange"
    />

    <div
      v-if="hasImage"
      class="product-image-selected"
      :class="{ 'is-disabled': disabled }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="handleDrop"
    >
      <div class="product-image-selected-visual" :class="{ 'is-dragging': dragging }">
        <img
          v-if="displayedImage"
          :src="displayedImage"
          :alt="modelValue?.name || 'Imagen del producto'"
          class="product-image-selected-img"
          @error="imageLoadFailed = true"
        />
        <div v-if="imageLoadFailed" class="product-image-load-error" role="status">
          <i class="bi bi-image" aria-hidden="true"></i>
          <span>No se pudo mostrar esta imagen</span>
        </div>
        <span class="product-image-status">
          <i :class="modelValue ? 'bi bi-stars' : 'bi bi-check-circle-fill'" aria-hidden="true"></i>
          {{ modelValue ? 'Nueva imagen' : 'Imagen actual' }}
        </span>
      </div>

      <div class="product-image-selected-details">
        <div class="product-image-file-summary">
          <span class="product-image-file-icon" aria-hidden="true">
            <i :class="modelValue ? 'bi bi-file-earmark-image' : 'bi bi-image'"></i>
          </span>
          <div class="min-w-0">
            <strong class="product-image-file-name">
              {{ modelValue?.name || 'Imagen guardada del producto' }}
            </strong>
            <span class="product-image-file-meta">
              {{ modelValue ? formatFileSize(modelValue.size) : 'Se conserva al guardar los cambios' }}
            </span>
          </div>
        </div>

        <div class="product-image-actions">
          <button type="button" class="btn btn-image-secondary" :disabled="disabled" @click="openFilePicker">
            <i class="bi bi-arrow-repeat me-1" aria-hidden="true"></i>
            Cambiar
          </button>
          <button
            v-if="modelValue"
            type="button"
            class="btn btn-image-remove"
            :disabled="disabled"
            @click="resetSelection"
          >
            <i class="bi bi-x-lg me-1" aria-hidden="true"></i>
            {{ currentImageUrl ? 'Cancelar' : 'Quitar' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="product-image-dropzone"
      :class="{ 'is-dragging': dragging, 'is-disabled': disabled, 'is-invalid': error }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="handleDrop"
    >
      <span class="product-image-dropzone-icon" aria-hidden="true">
        <i class="bi bi-cloud-arrow-up"></i>
      </span>
      <h3>Agrega una imagen del producto</h3>
      <p>Arrastra el archivo hasta aquí o selecciónalo desde tu dispositivo.</p>
      <button type="button" class="btn btn-image-select" :disabled="disabled" @click="openFilePicker">
        <i class="bi bi-folder2-open me-2" aria-hidden="true"></i>
        Seleccionar imagen
      </button>
      <span class="product-image-guidance">
        JPG, PNG o WEBP <span aria-hidden="true">·</span> Máximo 5 MB
      </span>
    </div>

    <div v-if="error" class="product-image-error" role="alert">
      <i class="bi bi-exclamation-circle-fill" aria-hidden="true"></i>
      <span>{{ error }}</span>
      <button type="button" :disabled="disabled" @click="resetSelection">
        Omitir imagen
      </button>
    </div>
  </section>
</template>
