<template>
  <div
    class="image-upload-area"
    @drop.prevent="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    :class="{ 'drag-over': isDragging, small: isSmall }"
    @click="triggerFileInput"
  >
    <div v-if="!modelValue" class="upload-placeholder" :class="{ small: isSmall }">
      <PlusIcon class="icon-size" />
      <span>{{ label }}</span>
      <small v-if="showHelp">{{ helpText }}</small>
      <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="hidden-input" />
    </div>
    <div v-else class="image-preview">
      <img :src="modelValue" :alt="alt" />
      <button @click.stop="removeImage" class="remove-image">
        <XMarkIcon class="icon-size" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from "vue";
import { PlusIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import api from "@/services/axiosInstance";

export default defineComponent({
  name: "ImageUploader",
  components: {
    PlusIcon,
    XMarkIcon,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "Bild einfügen",
    },
    helpText: {
      type: String,
      default: "Max 1 Bild",
    },
    showHelp: {
      type: Boolean,
      default: true,
    },
    alt: {
      type: String,
      default: "Bild",
    },
    isSmall: {
      type: Boolean,
      default: false,
    },
    imageMeta: {
      type: Object as PropType<{
        isEdit: boolean;
        isChapter: boolean;
        postId?: string;
        chapterId?: string;
      }>,
      required: true,
    },
  },
  emits: ["update:modelValue", "image-removed", "image-removed-error"],
  setup(props, { emit }) {
    const isDragging = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);

    const triggerFileInput = () => {
      if (fileInput.value) fileInput.value.click();
    };

    const handleDragOver = () => (isDragging.value = true);

    const handleDragLeave = () => (isDragging.value = false);

    const handleDrop = (event: DragEvent) => {
      isDragging.value = false;
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    };

    const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;

      if (files && files.length > 0) {
        const selectedFile = files[0];
        // Direkt verarbeiten - das neue Bild überschreibt das alte automatisch
        handleFile(selectedFile);
      }
    };

    /* die funktion überprüft ob das objekt schon in der db ist und lädt ggf. das bild schon hoch. */
    const handleFile = async (file: File) => {
      if (!file) {
        console.error("Keine Datei erhalten");
        return;
      }

      if (!file.type.match("image.*")) {
        alert("Bitte nur Bilder hochladen.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) emit("update:modelValue", e.target.result as string);
      };
      reader.onerror = () => alert("Fehler beim Lesen der Datei.");
      reader.readAsDataURL(file);

      const canUploadImmediately = props.imageMeta.postId && (props.imageMeta.chapterId || !props.imageMeta.isChapter);

      if (!canUploadImmediately) return;

      let endpoint: string = "";

      // Endpoint-Logik für sowohl Edit- als auch Nicht-Edit-Modus
      if (props.imageMeta.chapterId && props.imageMeta.postId) {
        endpoint = `article/addChapterImage/${props.imageMeta.postId}/${props.imageMeta.chapterId}`;
      } else if (props.imageMeta.postId && !props.imageMeta.chapterId) {
        endpoint = `article/addPostImage/${props.imageMeta.postId}`;
      } else {
        console.error("Kein gültiger Endpunkt für das Hochladen des Bildes gefunden.");
        return;
      }

      if (!endpoint) {
        console.error("Kein gültiger Endpunkt für das Hochladen des Bildes gefunden.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await api.patch(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
        console.log("endpoint:", endpoint);
        console.log("response:", res);

        if (res.status < 210) {
          // ich weiß den genauen Statuscode nicht, aber alle wären unter 210 (200, 202, 204)
          if (res.data.image) {
            console.log("Bild erfolgreich hochgeladen:", res.data.image);
            emit("update:modelValue", res.data.image);
          }
        } else {
          emit("image-removed-error", res.data.message || "Fehler beim Hochladen des Bildes.");
        }
      } catch (error) {
        console.error("Fehler beim Hochladen des Bildes:", error);
        emit(
          "image-removed-error",
          error instanceof Error ? error.message : "Unbekannter Fehler beim Hochladen des Bildes."
        );
      }
    };

    /* die funktion überprüft ob das bild schon hoch geladen wurde und löscht es dann ggf. */
    const removeImage = async () => {
      if (!props.imageMeta.postId || (props.imageMeta.chapterId && props.imageMeta.chapterId?.length < 10)) {
        console.log("Normaler Fall: Bild entfernen");
        emit("update:modelValue", "");
        if (fileInput.value) fileInput.value.value = "";
        emit("image-removed");
        return;
      }
      try {
        let entpoint: string;

        if (!props.imageMeta.isChapter) {
          if (!props.imageMeta.postId) throw new Error("Post ID is required for removing image.");
          if (!props.imageMeta.postId) {
            emit("image-removed-error", "Bildentfernung abgebrochen.");
            return;
          }
          entpoint = `article/removePostImage/${props.imageMeta.postId}`;
        } else {
          if (!props.imageMeta.chapterId) throw new Error("Chapter ID is required for removing chapter image.");
            emit("image-removed-error", "Kapitelbildentfernung abgebrochen.");
          entpoint = `article/removeChapterImage/${props.imageMeta.postId}/${props.imageMeta.chapterId}`;
          console.log("Kapitelbild entfernen:", entpoint);
        }

        const response = await api.delete(entpoint, { headers: { "Content-Type": "application/json" } });
        if (response.status < 210) {
          // ich weiß den genauen Statuscode nicht, aber alle wären unter 210 (200, 202, 204)
          emit("update:modelValue", "");
          if (fileInput.value) fileInput.value.value = "";
          emit("image-removed");
        } else {
          emit("image-removed-error", response.data.message || "Fehler beim Entfernen des Bildes.");
        }
      } catch (error) {
        console.error("Fehler beim Entfernen des Bildes:", error);
        emit(
          "image-removed-error",
          error instanceof Error ? error.message : "Unbekannter Fehler beim Entfernen des Bildes."
        );
      }
    };

    return {
      isDragging,
      fileInput,
      triggerFileInput,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileChange,
      removeImage,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.image-upload-area {
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  position: relative;
  overflow: hidden;
  flex: 1;
  transition: all 0.4s ease-out;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 2px dashed mixins.theme-color($theme, border-medium);
      transition: all 0.4s ease-out;
    }
  }

  over {
    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, hover-color);
        border-color: mixins.theme-color($theme, primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  &.small {
    min-height: 120px;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: map.get(vars.$spacing, xs);
  width: 100%;
  height: 100%;
  padding: map.get(vars.$spacing, m);
  transition: all 0.4s ease-out;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-secondary);
      transition: all 0.4s ease-out;
    }
  }

  &.small {
    padding: map.get(vars.$spacing, s);
  }
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .remove-image {
    position: absolute;
    top: map.get(vars.$spacing, xs);
    right: map.get(vars.$spacing, xs);
    background-color: rgba(105, 65, 65, 0.6);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    border: none;
    padding: 0;
    transition: all 0.4s ease-out;

    &:hover {
      background-color: rgba(177, 31, 31, 0.6);
    }

    svg {
      width: 20px;
      height: 20px;
      color: #fff;
      /* fallback color, can be overridden by theme */
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, danger);
        transition: all 0.4s ease-out;
      }
    }
  }
}

.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.icon-size {
  width: 20px;
  height: 20px;
}
</style>
