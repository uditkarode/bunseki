<template>
  <img class="home__bg-blog" src="/bg-blog.svg" />

  <div class="home">
    <!-- title -->
    <p class="home__title jp-text">分析ツール</p>

    <!-- edit box and submit button -->
    <Editor @analyse="analyse" />

    <Spacer :vertical="18" />

    <!-- analysis (分析) section header -->
    <div class="w-full flex items-center">
      <div class="home__generic-separator home__separator-1" />
      <Spacer :horizontal="24" />
      <p class="home__title jp-text">分析</p>
      <Spacer :horizontal="24" />
      <div class="home__generic-separator home__separator-2" />
    </div>

    <!-- actual analysis -->
    <AnalysisResult :features="features" />
  </div>
</template>

<script setup lang="ts">
import Spacer from "@/components/spacer.vue";
import Editor from "@/components/editor.vue";
import AnalysisResult from "@/components/analysis-result.vue";

import type { IpadicFeatures } from "kuromoji";
import { API_HOST } from "@/constants";

type Err = string;
const features = ref<IpadicFeatures[] | "loading" | Err | undefined>(undefined);

async function analyse(jpText: string) {
  if (!jpText) {
    features.value = "入力してください!";
    return;
  }

  try {
    features.value = "loading";

    const result = await fetch(`${API_HOST}/api/tokenise`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        str: jpText,
      }),
    });

    const response: IpadicFeatures[] = await result.json();
    features.value = response;
  } catch (e) {
    features.value = e instanceof Error ? e.message : "Something went wrong!";
  }
}
</script>

<style scoped>
/* Generic Styles */
.home__generic-separator {
  border-radius: 6px;
  min-height: 6px;
  max-height: 6px;
  flex: 1;
}

.home__bg-blog {
  position: absolute;
  height: 90%;
  width: 60%;
  max-width: 930px;
  opacity: 0.8;
  top: 0;
  left: 0;
}

.home__separator-1 {
  background: linear-gradient(276deg, #1997cd 0%, rgba(49, 239, 216, 0) 100%);
}

.home__separator-2 {
  background: linear-gradient(90deg, #1997cd 0%, rgba(49, 239, 216, 0) 100%);
}

/* Component Styles */
.home {
  width: 86%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.home__title {
  border-radius: 6px;
  background: linear-gradient(
    0deg,
    rgba(116, 228, 222, 1) 0%,
    rgba(21, 114, 200, 1) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 40px;

  margin-top: 28px;
  margin-bottom: 28px;
}
</style>
