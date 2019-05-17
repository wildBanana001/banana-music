<template>
  <div class="detail">
    <div :style="safeHeight"></div>
    <div class="detail-top">
      name
    </div>
  </div>
</template>

<script>

export default {
  computed: {
    safeHeight () {
      return wx.getStorageSync('safeHeight') ? wx.getStorageSync('safeHeight') : '20px'
    }
  },
  onLoad (option) {
    console.log(option.query)
  }
}
</script>

<style scoped>

</style>
