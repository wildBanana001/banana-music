<template>
  <div class="detail">
    <div :style="safeHeight"></div>
    <img class="detail-bg" :src="info.cover">
    <div class="detail-top">
      <div class="detail-top-name">{{info.name}}</div>
      <div class="detail-top-singer">{{info.singer}}</div>
    </div>
    <div class="detail-content">
      <img :src="info.cover">
    </div>
    <div class="detail-bottom">
      <div class="detail-bottom-slider">
        <div class="detail-bottom-slider-left">{{startTime}}</div>
        <van-slider class="detail-bottom-slider-middle" value="0" @change="onChange" @drag="onDrag"/>
        <div class="detail-bottom-slider-right">{{endTime}}</div>
      </div>
      <!-- <player @play="onPlay" @timeUpdate="onTimeUpdate" :options="info"/> -->
    </div>
  </div>
</template>

<script>
import player from '@/components/player'
export default {
  // components: {
  //   player
  // },
  data () {
    return {
      info: {
        startTime: '0',
        endTime: '0'
      }
    }
  },
  computed: {
    safeHeight () {
      return wx.getStorageSync('safeHeight') ? wx.getStorageSync('safeHeight') : '20px'
    }
  },
  onLoad (option) {
    // option.source =`https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?format=json205361747&platform=yqq&cid=205361747&songmid=${option.songmid}&filename=C400${option.songmid}.m4a&guid=126548448`
    // console.log(option)
    // this.info = option
    this.info = {
      cover: 'http://imgcache.qq.com/music/photo/album_300/14/300_albumpic_6688414_0.jpg',
      name: '心如止水',
      singer: 'K.D',
      source: 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?format=json205361747&platform=yqq&cid=205361747&songmid=0040f8nz2C8hbC&filename=C4000040f8nz2C8hbC.m4a&guid=126548448'
    }
     wx.cloud.callFunction({
        name: 'http',
        data: {
          url: this.info.source
        }
    }).then(res => {
      let obj = JSON.parse(res.result).data.items[0]
      this.info.src = `http://ws.stream.qqmusic.qq.com/${obj.filename}?fromtag=0&guid=126548448&vkey=${obj.vkey}`
    })
  },
  methods: {
    onChange () {
      console.log('change')
    },
    onDrag () {
      console.log('drag')
    },
    onPlay (e) {
      // this.endTime = e.duration
    },
    onTimeUpdate (e) {
      this.startTime = e.currentTime
      this.endTime = e.duration
    },
    format (interval) {
      inerval = interval | 0
      const minute = interval / 60 | 0
      return `${minute}:${interval}`
    }
  },
}
</script>

<style lang="scss" scoped>
.detail {
  position: relative;
  width: 100vw;
  height: 100vh;
  &-bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    filter: blur(6px);
  }
  &-top {
    padding-top: 10rpx;
    text-align: center;
    color: #fff;
    font-size: 0;
    &-name {
      font-size: 36rpx;
    }
    &-singer {
      padding-top: 10rpx;
      font-size: 28rpx;
    }
  }
  &-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -65%);
    width: 500rpx;
    height: 500rpx;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  &-bottom {
    width: 100vw;
    position: absolute;
    bottom: 50rpx;
    &-slider {
      display: flex;
      align-items: center;
      &-left, &-right {
        flex: 1;
        font-size: 24rpx;
        color: #fff;
        padding-left: 20rpx;
      }
      &-middle {
        flex: 5;
      }
    }
  }
}
</style>
