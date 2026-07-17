<template>
  <router-view />
  <LnConfirmDialog />
  <LnToastStack :items="toastItems" @dismiss="dismissToast" />
</template>

<script setup lang="ts">
import { LnConfirmDialog, LnToastStack, useLnToast } from '@/components/linear'

const { items: toastItems, dismiss: dismissToast } = useLnToast()
</script>
