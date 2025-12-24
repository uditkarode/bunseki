<template>
  <div class="flex w-full">
    <textarea
      wrap="soft"
      style="resize: none; overflow: hidden"
      placeholder="入力してください。。。"
      ref="inputRef"
      @input="(e) => { 
          const target = <HTMLInputElement>e.target;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }"
      class="container jp-input"
    />

    <button class="submit-button" @click="$emit('analyse', inputRef?.value ?? '')">
      <p class="submit-button__text">分析</p>
    </button>
  </div>
</template>

<script setup lang="ts">
const inputRef: Ref<HTMLInputElement | null> = ref(null);


defineEmits<{
  analyse: [text: string];
}>();
</script>

<style scoped>
.container {
  border-radius: 14px;
  border: 1px solid #30363d;
  background: #161b22;
}

.jp-input {
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  outline: none !important;
  padding: 14px;
  color: #fbfbfb;
  font-size: 24px;
  flex-grow: 1;
  height: min-content;
}

.submit-button {
  background: #0c322a;
  height: 100%;
  width: 80px;
  margin-left: 10px;
  font-size: 22px;
  border-radius: 12px;
  background: linear-gradient(120deg, rgb(19, 20, 20) 0%, rgb(17, 17, 18) 100%);
  border: 1px solid #30363d;
}

.submit-button__text {
  color: black;
  font-weight: 500;
  background: linear-gradient(
    0deg,
    rgba(116, 228, 222, 1) 0%,
    rgba(21, 114, 200, 1) 100%
  );
  background-clip: text;
  min-width: max-content;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
