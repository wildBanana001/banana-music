<template>
  <div class="detail">
    <div :style="safeHeight"></div>
    <img class="detail-bg" :src="info.cover">
    <div class="detail-back" @click="goBack">
       <van-icon name="arrow-left" color="#000" size="50rpx"/>
    </div>
    <div class="detail-top">
      <div class="detail-top-name">{{info.name}}</div>
      <div class="detail-top-singer">{{info.singer}}</div>
    </div>
    <div class="detail-content">
      <img :class="{'detail-active': isPlay}" :src="info.cover">
    </div>
    <div class="detail-bottom">
      <van-loading class="detail-loading"
        v-if="isLoading"
        color="#ffc773"
        type="spinner"
        size="100rpx"/>
      <div class="detail-bottom-slider">
        <div class="detail-bottom-slider-left">{{startTime}}</div>
        <van-slider class="detail-bottom-slider-middle"
          :value="sliderValue"
          inactive-color="#000"
          active-color="#ffc773"
          @change="onChange"
          @drag="onDrag"/>
        <div class="detail-bottom-slider-right">{{endTime}}</div>
      </div>
      <div class="player">
        <div v-if="isLike" class="player-like" @click="like">
          <van-icon name="like" color="#ffc773" size="60rpx"/>
        </div>
        <div v-else class="player-like" @click="like">
          <van-icon name="like-o" color="#000" size="60rpx"/>
        </div>
        <div class="player-pre" @click="preMusic">
          <img :src="changeMusic">
        </div>
        <div class="player-play" @click="onPlay">
          <van-icon :name="playIcon" color="#000" size="120rpx"/>
        </div>
        <div class="player-next" @click="nextMusic">
          <img :src="changeMusic">
        </div>
        <div class="player-list" @click="showList">
          <van-icon name="bars" color="#000" size="60rpx"/>
        </div>
      </div>
    </div>
    <van-action-sheet class="detail-sheet" :show="show" @close="onClose" :actions="actions">
      <div class="detail-sheet-item" v-for="item in list" :key="item.id"
        :class="{' detail-sheet-item-active': item.songmid === info.songmid}"
        @click="onSelect(item)">
        <span class="detail-sheet-item-name">{{item.name}}</span>
        <span class="detail-sheet-item-singer">-{{item.singer}}</span>
      </div>
    </van-action-sheet>
  </div>
</template>

<script>
import store from '@/store.js'

const db = wx.cloud.database()
export default {
  data () {
    return {
      userInfo: wx.getStorageSync('userinfo') || {},
      startTime: '00:00',
      endTime: '00:00',
      info: {},
      changeMusic: '/static/images/changeMusic.svg',
      likeIcon: 'like-o',
      isLike: false,
      isPlay: false,
      bga: null,
      list: [],
      sliderValue: 0,
      show: false,
      actions: [{
        name: '分享',
        subname: '',
        openType: 'share'
      }],
      currentSongIndex: 0,
      isLoading: true
    }
  },
  computed: {
    safeHeight () {
      return wx.getStorageSync('safeHeight') ? wx.getStorageSync('safeHeight') : '20px'
    },
    playIcon () {
      return this.isPlay ? 'pause-circle-o' : 'play-circle-o'
    },
  },
  onLoad (option) {
    if (option.from) {
      if (option.from === 'favorite') {
        db.collection(option.from).where({
          _openid: this.userInfo.openid
        }).get().then(res => {
          res.data.map((item, index) => {
            this.list[index] = item.song
          })
        })
      } else {
        this.list = store.state[option.from]
      }
      this.getMusic()
    }
  },
  methods: {
    onDrag (e) {
      this.sliderValue = e.target.value
      let currentTime = this.bga.duration * e.target.value / 100
      this.bga.seek(currentTime)
    },
    onPlay () {
      this.isPlay = !this.isPlay
      if (this.isPlay) this.bga.play()
      else this.bga.pause()
    },
    onTimeUpdate () {
      this.startTime = this.format(this.bga.currentTime)
      this.endTime = this.format(this.bga.duration)
      if (this.bga.currentTime > 0 && this.bga.duration > 0) {
        this.sliderValue = this.bga.currentTime / this.bga.duration * 100
      }
      if (this.bga.currentTime === this.bga.duration) this.isPlay = false
    },
    format (interval) {
      if (interval) {
        let inerval = interval | 0
        let m = (interval / 60) | 0
        let s = (interval % 60).toFixed(0)
        s = s > 10 ? s : '0' + s
        m = m > 10 ? m : '0' + m
        return `${m}:${s}`
      }
    },
    goBack () {
      wx.navigateBack({
        delta: 1
      })
    },
    like () {
      this.isLike = !this.isLike
      if (this.isLike) {
        this.info.like = true
        db.collection('favorite').add({
          data: {
            _id: this.info.songmid,
            song: this.info
          }
        })
      } else {
        this.info.like = false
        db.collection('favorite').doc(this.info.songmid).remove({
          success(res) {
            console.log(res.data)
          }
        })
      }
    },
    showList () {
      this.show = true
      this.actions[0].subname = this.info.name
    },
    onClose () {
      this.show = false
    },
    onSelect (item) {
      store.state.currentSong = item
      this.getMusic()
      this.onClose()
    },
    preMusic () {
      let index = this.currentSongIndex - 1
      if (index === -1) index = this.list.length
      store.state.currentSong = this.list[index]
      this.getMusic()
    },
    nextMusic () {
      let index = this.currentSongIndex + 1
      if (index === this.list.length + 1) index = 0
      store.state.currentSong = this.list[index]
      this.getMusic()
    },
    getCurrentSongIndex () {
      this.list.map((item, index) => {
        if (this.info.songmid === item.songmid) {
          this.currentSongIndex = index
        }
      })
    },
    getMusic () {
      this.isLoading = true
      this.info = store.state.currentSong
      this.isLike = this.info.like
      this.info.source =`https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?format=json205361747&platform=yqq&cid=205361747&songmid=${this.info.songmid}&filename=C400${this.info.songmid}.m4a&guid=126548448` 
      wx.cloud.callFunction({
        name: 'http',
        data: {
          url: this.info.source
        }
      }).then(res => {
        this.isLoading = false
        let obj = JSON.parse(res.result).data.items[0]
        this.info.src = `http://ws.stream.qqmusic.qq.com/${obj.filename}?fromtag=0&guid=126548448&vkey=${obj.vkey}`
        this.bga = wx.getBackgroundAudioManager()
        this.bga.title = this.info.name
        this.bga.epname = this.info.name
        this.bga.singer = this.info.singer
        this.bga.coverImgUrl = this.info.cover
        this.bga.src = this.info.src
        this.isPlay = true
        this.bga.onTimeUpdate(this.onTimeUpdate)
        this.getCurrentSongIndex()
        this.played()
      })
    },
    played () {
      let arr = store.state.played
      arr.some(item => {
        if (item.songmid === this.info.songmid) {
          return true
        }
      }) ? null : store.state.played.push(this.info)
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
    filter: blur(10px);
  }
  &-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 0%);
    z-index: 99;
  }
  &-back {
    padding: 10rpx 0 0 20rpx;
  }
  &-top {
    padding-top: 10rpx;
    text-align: center;
    color: #000;
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
      height: 100rpx;
      display: flex;
      align-items: center;
      &-left, &-right {
        flex: 1;
        font-size: 24rpx;
        color: #000;
        padding-left: 20rpx;
      }
      &-middle {
        flex: 5;
      }
    }
    .player {
      width: 100vw;
      height: 140rpx;
      display: flex;
      justify-content: space-around;
      align-items: center;
      &-pre, &-next {
        width: 100rpx;
        height: 100rpx;
        img {
          width: 100%;
          height: 100%;
        }
      }
      &-next {
        transform: rotateY(180deg);
      }
    }
  }
  &-sheet {
    &-item {
      border-top: 1rpx solid 	rgba(204, 204, 204, .3);
      padding: 15rpx 20rpx;
      &-name {
        font-size: 34rpx;
      }
      &-singer {
        font-size: 28rpx;
        color: #666;
      }
      &-active {
        color: #ffc773;
        .detail-sheet-item-singer {
          color: #ffc773;
        }
      }
    }
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
