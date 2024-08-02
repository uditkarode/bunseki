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
      <template v-for="entry in features">
        <template
          v-if="entry.surface_form && entry.surface_form.includes('\n')"
        >
          <template v-for="_ in entry.surface_form">
            <hr class="w-full h-6 opacity-0" />
          </template>
        </template>

        <div
          v-else-if="entry.surface_form && entry.surface_form.trim()"
          class="analysis-container-item jp-text"
          :style="{ backgroundColor: COLORS[entry.pos] }"
          @click="getDetails(entry)"
        >
          <p>
            {{ entry.surface_form }}
          </p>
        </div>
      </template>
    </div>

    <div v-if="selected" class="analysis-spacer" />

    <!-- Word Details -->
    <div v-if="selected" class="container details-container">
      <div class="details-container__detail-item container">
        <!-- Word and Reading -->
        <div class="flex items-end mb-2">
          <p class="details-container__t1 jp-text">
            {{ selected.surface_form }}
          </p>

          <Spacer :horizontal="30" />

          <p class="details-container__t2 jp-text">
            {{ selected.reading }}
          </p>
        </div>

        <!-- Details -->
        <p
          v-if="selected && (!details || typeof details == 'string')"
          class="en-text"
          style="font-size: 24px"
        >
          {{ details ?? "Loading..." }}
        </p>

        <template
          v-if="selected && details && typeof details != 'string'"
          style="font-size: 30px"
        >
          <hr style="border: 1px solid #1e2a30" />
          <Spacer :vertical="12" />

          <!-- JLPT -->
          <div class="flex en-text" style="font-size: 20px" v-if="details.jlpt">
            <p class="font-bold underline" style="color: #74e4de">Rank:</p>
            <Spacer :horizontal="18" />
            <p>{{ details.jlpt }}</p>
          </div>

          <Spacer :vertical="4" />

          <!-- Meanings -->
          <div
            class="flex-col en-text"
            style="font-size: 20px"
            v-if="details.meanings.length"
          >
            <p class="font-bold underline mb-1" style="color: #74e4de">
              Meanings:
            </p>
            <div
              class="flex"
              v-for="meaning in details.meanings"
              style="font-size: 20px"
            >
              <p style="color: #74e4de; font-weight: bold">•</p>
              <Spacer :horizontal="18" />
              <p>{{ meaning }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toHiragana } from "wanakana";
import { IpadicFeatures } from "kuromoji";
import { Details, PhraseDetail } from "../utils";
import { API_HOST } from "../constants";

const props = defineProps<{
  features: IpadicFeatures[] | "loading" | string | undefined;
}>();

const COLORS: Record<string, string> = {
  形容詞: "#192230",
  名詞: "#301924",
  動詞: "#192A30",
};

/// the IpadicFeature (word box) that has been selected (clicked on)
const selected = ref<IpadicFeatures | undefined>(undefined);

/// details about the {@link selected} item
/// undefined if {@link selected} is undefined, or if details are loading
type Err = string;
const details = ref<Details | "loading" | Err | undefined>(undefined);

watch(() => props.features, v => {
  if (v == "loading") selected.value = undefined;
});

async function getDetails(entry: IpadicFeatures) {
  if (entry.reading) {
    entry.reading = toHiragana(entry.reading);
  }

  selected.value = entry;
  details.value = "Loading...";

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
      const entry = response[0];
      details.value = {
        jlpt: entry.jlpt.join(", "),
        meanings: [...new Set(entry.senses.map((sense) =>
          sense.english_definitions.join(", ")
        ).map(w => w.toLowerCase()))],
      };
    }
  } catch (e) {
    details.value = undefined;
  }
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
}

.details-container {
  padding: 14px;
  height: fit-content;
  width: min(100%, max-content);

  @media screen and (max-width: 800px) {
    width: 100%;
  }
}

.details-container__t1 {
  color: #74e4de;
  font-size: 40px;
  white-space: nowrap;

  @media screen and (max-width: 800px) {
    font-size: 38px;
  }
}

.details-container__t2 {
  color: #80c0d4;
  font-size: 28px;
  white-space: nowrap;

  @media screen and (max-width: 800px) {
    font-size: 26px;
  }
}

.details-container__detail-item {
  background: #161e22;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 14px;
  padding-bottom: 14px;
  display: flex;
  flex-direction: column;

  @media screen and (min-width: 800px) {
    padding-left: 30px;
    padding-right: 30px;
  }
}
</style>
