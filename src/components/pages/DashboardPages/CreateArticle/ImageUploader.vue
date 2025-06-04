<!-- src/components/pages/DashboardPages/CreateArticle/ImageUploader.vue -->
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
import { defineComponent, ref } from "vue";
import { PlusIcon, XMarkIcon } from "@heroicons/vue/24/outline";

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
  },
  emits: ["update:modelValue"],
  setup(_, { emit }) {
    const isDragging = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);

    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    const handleDragOver = () => {
      isDragging.value = true;
    };

    const handleDragLeave = () => {
      isDragging.value = false;
    };

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
        handleFile(files[0]);
      }
    };

    const handleFile = (file: File) => {
      if (!file.type.match("image.*")) {
        alert("Bitte nur Bilder hochladen.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          emit("update:modelValue", e.target.result as string);
        }
      };

      reader.onerror = () => {
        alert("Fehler beim Lesen der Datei.");
      };

      reader.readAsDataURL(file);
    };

    const removeImage = () => {
      emit("update:modelValue", "");
      if (fileInput.value) {
        fileInput.value.value = "";
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

  &.drag-over {
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
