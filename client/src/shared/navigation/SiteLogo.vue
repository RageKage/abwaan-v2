<script setup lang="ts"></script>

<template>
  <router-link to="/" class="site-logo-link">
    <div class="logo-wrapper">
      <img
        src="@/assets/logo/Abwaan_4.svg"
        alt="Wisdom Weyn Logo"
        class="logo-img"
      />
    </div>
  </router-link>
</template>

<style scoped>
.site-logo-link {
  display: block;
  line-height: 0;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 3rem; /* equivalent to w-12 */
  height: 3rem; /* equivalent to h-12 */
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-img:hover {
  transform: scale(1.05);
}
</style>
