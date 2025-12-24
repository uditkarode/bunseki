<template>
  <!-- If no search has been performed yet  -->
  <p class="msg jp-text" v-if="typeof features == 'undefined'">
     入力して「分析」ボタンを押してください
  </p>

  <!-- If a search has been performed but the contents have not loaded -->
  <p class="msg-big jp-text" v-else-if="features === 'loading'">
    ロード中。。。
  </p>

  <p class="msg-big" v-else-if="typeof features === 'string'">
    <span class="en-text" style="color: rgb(222, 164, 164); margin-right: 12px">ERROR:</span>
    <span class="jp-text" style="color: rgb(215, 215, 215)">{{ features }}</span>
  </p>

  <div v-else class="root">
    <!-- Sentence splitter -->
    <div class="container analysis-container">
      <template v-for="(entry, index) in features" :key="index">
        <template
          v-if="entry.surface_form && entry.surface_form.includes('\n')"
        >
          <template v-for="(_, i) in entry.surface_form" :key="i">
            <hr class="w-full h-6 opacity-0" />
          </template>
        </template>

        <div
          v-else-if="entry.surface_form && entry.surface_form.trim()"
          class="analysis-container-item jp-text"
          :style="{ backgroundColor: COLORS[entry.pos] }"
          @mouseenter="(event) => startHover(entry, event)"
          @mousemove="updateTooltipPosition"
          @mouseleave="cancelHover"
        >
          <p>
            {{ entry.surface_form }}
          </p>
        </div>
      </template>
    </div>

    <!-- Hover Tooltip -->
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div
          v-if="showTooltip && hoveredEntry"
          class="tooltip-popup"
          :style="tooltipStyle"
        >
          <!-- Word and Reading -->
          <div class="tooltip-header">
            <span class="tooltip-word jp-text">{{ hoveredEntry.surface_form }}</span>
            <span class="tooltip-reading jp-text" v-if="hoveredEntry.reading">
              {{ toHiragana(hoveredEntry.reading) }}
            </span>
          </div>

          <!-- Loading State -->
          <p v-if="tooltipDetails === 'loading'" class="tooltip-loading en-text">
            Loading...
          </p>

          <!-- Error State -->
          <p v-else-if="typeof tooltipDetails === 'string'" class="tooltip-error en-text">
            {{ tooltipDetails }}
          </p>

          <!-- Details -->
          <template v-else-if="tooltipDetails">
            <!-- Meanings -->
            <div class="tooltip-meanings en-text" v-if="tooltipDetails.meanings.length">
              <p class="tooltip-label">Meanings:</p>
              <ul>
                <li v-for="(meaning, i) in tooltipDetails.meanings" :key="i">
                  {{ meaning }}
                </li>
              </ul>
            </div>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { toHiragana } from "wanakana";
import type { IpadicFeatures } from "kuromoji";
import type { Details, PhraseDetail } from "../utils";
import { API_HOST } from "../constants";

const props = defineProps<{
  features: IpadicFeatures[] | "loading" | string | undefined;
}>();

const COLORS: Record<string, string> = {
  形容詞: "#192230",
  名詞: "#301924",
  動詞: "#192A30",
};

// Hover tooltip state
const hoveredEntry = ref<IpadicFeatures | undefined>(undefined);
const showTooltip = ref(false);
const tooltipDetails = ref<Details | "loading" | string | undefined>(undefined);
const tooltipPosition = ref({ x: 0, y: 0 });
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed style for tooltip positioning
const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x + 15}px`,
  top: `${tooltipPosition.value.y + 15}px`,
}));

// Reset tooltip when features change
watch(() => props.features, v => {
  if (v == "loading") {
    cancelHover();
  }
});

function startHover(entry: IpadicFeatures, event: MouseEvent) {
  // Clear any existing timeout
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
  
  // Store initial position
  tooltipPosition.value = { x: event.clientX, y: event.clientY };
  
  // Show tooltip instantly
  hoverTimeout = setTimeout(async () => {
    hoveredEntry.value = entry;
    showTooltip.value = true;
    tooltipDetails.value = "loading";
    
    try {
      const result = await fetch(`${API_HOST}/api/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          str: entry.basic_form ?? entry.surface_form,
        }),
      });

      const response: PhraseDetail[] = await result.json();
      if (response.length) {
        const detailEntry = response[0];
        if (detailEntry) {
          tooltipDetails.value = {
            meanings: [...new Set(detailEntry.senses.map((sense) =>
              sense.english_definitions.join(", ")
            ).map(w => w.toLowerCase()))],
          };
        }
      } else {
        tooltipDetails.value = "No definition found";
      }
    } catch (e) {
      tooltipDetails.value = "Error loading details";
    }
  }, 0);
}

function updateTooltipPosition(event: MouseEvent) {
  tooltipPosition.value = { x: event.clientX, y: event.clientY };
}

function cancelHover() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  showTooltip.value = false;
  hoveredEntry.value = undefined;
  tooltipDetails.value = undefined;
}
</script>

<style scoped>
.root {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;
  gap: 10px;

  @media screen and (max-width: 800px) {
    flex-direction: column-reverse;
  }
}

.container {
  border-radius: 14px;
  border: 1px solid #30363d;
  background: #161b22;
}

.msg {
  color: #6c6b6b;
  opacity: 0.6;
  font-size: large;
  margin-bottom: 60px;
}

.msg-big {
  font-size: x-large;
  font-weight: 700;
  margin-bottom: 60px;
}

.analysis-container {
  display: flex;
  align-items: center;
  height: fit-content;
  flex-wrap: wrap;
  min-height: 100px;
  row-gap: 10px;
  column-gap: 10px;
  padding: 20px;
}

.analysis-container-item {
  border-radius: 14px;
  border: 1px solid #30363d;
  color: white;
  height: min-content;
  font-size: 38px;

  padding-left: 13px;
  padding-right: 14px;
  padding-top: 3px;
  padding-bottom: 4px;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.analysis-container-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>

<style>
/* Tooltip styles - not scoped since teleported to body */
.tooltip-popup {
  position: fixed;
  z-index: 9999;
  max-width: 350px;
  min-width: 200px;
  padding: 16px 20px;
  
  /* Glassmorphism effect */
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  border: 1px solid rgba(116, 228, 222, 0.3);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(116, 228, 222, 0.1);
  
  /* Prevent tooltip from going off-screen */
  pointer-events: none;
}

.tooltip-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(116, 228, 222, 0.2);
}

.tooltip-word {
  color: #74e4de;
  font-size: 24px;
  font-weight: 600;
}

.tooltip-reading {
  color: #80c0d4;
  font-size: 16px;
}

.tooltip-loading {
  color: #8b949e;
  font-size: 14px;
  font-style: italic;
}

.tooltip-error {
  color: #f85149;
  font-size: 14px;
}

.tooltip-label {
  color: #74e4de;
  font-weight: 600;
}

.tooltip-meanings {
  font-size: 14px;
}

.tooltip-meanings p {
  margin-bottom: 6px;
}

.tooltip-meanings ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.tooltip-meanings li {
  position: relative;
  padding-left: 16px;
  margin-bottom: 4px;
  color: #c9d1d9;
  line-height: 1.4;
}

.tooltip-meanings li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #74e4de;
  font-weight: bold;
}

/* Fade animation */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>

