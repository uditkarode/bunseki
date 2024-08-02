<template>
  <div v-if="$props.vertical" :style="{ marginTop: `${$props.vertical}px` }" />

  <div
    v-else-if="$props.horizontal"
    :style="{ marginLeft: `${$props.horizontal}px` }"
  />

  <div v-else-if="$props.grow" style="flex-grow: 1" />
</template>

<script setup lang="ts">
defineProps<{
  vertical?: number;
  horizontal?: number;
  grow?: boolean;
}>();
</script>
