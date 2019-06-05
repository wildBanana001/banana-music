<template>
  <div class="player" :class="{'player-active': active}" @click="goDetail">
    <img :src="currentSong.cover">
  </div>
</template>

<script>
import store from '@/store.js'

export default {
  data () {
    return {
      active: false
    }
  },
  computed: {
    currentSong () {
      return store.state.currentSong
    },
  },
  watch: {
    currentSong (newVal) {
      newVal.name ? this.active = true : this.active = false
    }
  },
  methods: {
    goDetail () {
      if (this.currentSong.name) {
        wx.navigateTo({
          url: '../detail/main'
        })
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.player {
  position: fixed;
  left: 80%;
  top: 90%;
  img {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    border: 1rpx solid #ffc773;
  }
  &-active {
    animation: rotateArround linear 3s infinite;
  }
}
@keyframes rotateArround {
	from {transform: rotateZ(0deg);}
	to {transform: rotateZ(360deg);}
}
</style>
