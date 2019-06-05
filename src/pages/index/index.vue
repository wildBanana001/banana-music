<template>
  <div class="home">
    <div class="safe-top" :style="safeHeight"></div>
    <div :style="safeHeight"></div>
    <div class="home-search" @click="goSearch">
      <img :src="searchIcon">
    </div>
    <div class="home-banner">
      <swiper class="home-banner-swiper"
        :indicator-dots="true"
        indicator-color="	rgba(255,199,115,.2)"
        indicator-active-color="#ffc773"
        :autoplay="true"
        :circular="true">
        <block v-for="item in banner" :key="item.id">
          <swiper-item @click="goDetail(item, 'topMusicList')">
            <img :src="item.cover">
          </swiper-item>
        </block>
      </swiper>
    </div>
    <div class="home-music">
      <!--
      <div class="home-music-recommend">
        <div class="home-music-title">今日推荐</div>
        <ul>
          <li class="home-music-recommend-info" v-for="item in recommendMusic" :key="item.id">
            <div class="music-list">
              <image :src="item.cover"/>
              <p>{{item.name}}</p>
            </div>
          </li>
        </ul>
      </div>
      -->
      <div class="home-music-songs">
        <div class="home-music-title">推荐单曲</div>
        <ul>
          <li class="home-music-songs-info" v-for="item in recommendMusic" :key="item.id" @click="goDetail(item, 'recMusicList')">
            <img :src="item.cover"/>
            <div class="home-music-songs-info-content">
              <p class="home-music-songs-info-content-name">{{item.name}}</p>
              <p class="home-music-songs-info-content-singer">{{item.singer}}</p>
            </div>
            <div class="home-music-songs-info-play">
              <van-icon name="audio" color="#ffc773" size="24px"/>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <vplay/>
  </div>
</template>

<script>
import store from '@/store.js'
import vplay from '@/components/player'

const db = wx.cloud.database()
export default {
  components: {
    vplay
  },
  data () {
    return {
      searchIcon: '/static/images/search.svg',
      banner: [],
      recommendMusic: [],
      recommendMusics: []
    }
  },
  computed: {
    userInfo () {
      return wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : {}
    },
    safeHeight () {
      return wx.getStorageSync('safeHeight') ? wx.getStorageSync('safeHeight') : '20px'
    }
  },
  created() {
    this.init()
  },
  methods: {
    getTopMusic () {
      wx.cloud.callFunction({
        name: 'http',
        data: {
          url: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8¬ice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=27&_=1519963122923'
        }
      }).then(res => {
        let obj = JSON.parse(res.result)
        let arr = []
        obj.songlist.some((item, index) => {
          arr[index] = {}
          arr[index].name = item.data.albumname
          arr[index].songmid = item.data.songmid
          arr[index].id = item.data.albumid
          arr[index].singer = ''
          item.data.singer.map(v => {
            arr[index].singer = arr[index].singer + v.name + ' '
          })
          let temp = item.data.albumid.toString().slice(-2)
          if (temp[0] === '0') temp = temp[1]
          arr[index].cover = `http://imgcache.qq.com/music/photo/album_300/${temp}/300_albumpic_${item.data.albumid}_0.jpg`
          db.collection('favorite').doc(item.data.songmid).get().then(res => {
            arr[index].like = true
          }).catch(res => {
            arr[index].like = false
          })
          if (index === 8) return true
        })
        this.banner = arr
        store.state.topMusicList = arr
      })
    },
    getRecommendMusic () {
      wx.cloud.callFunction({
        name: 'http',
        data: {
          url: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8¬ice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=36&_=1520777874472'
        }
      }).then(res => {
        let obj = JSON.parse(res.result)
        let arr = []
        obj.songlist.map((item, index) => {
          arr[index] = {}
          arr[index].name = item.data.albumname
          arr[index].id = item.data.albumid
          arr[index].songmid = item.data.songmid
          arr[index].singer = ''
          item.data.singer.map(v => {
            arr[index].singer = arr[index].singer + v.name + ' '
          })
          let temp = item.data.albumid.toString().slice(-2)
          if (temp[0] === '0') temp = temp[1]
          arr[index].cover = `http://imgcache.qq.com/music/photo/album_300/${temp}/300_albumpic_${item.data.albumid}_0.jpg`
          db.collection('favorite').doc(item.data.songmid).get().then(res => {
            arr[index].like = true
          }).catch(res => {
            arr[index].like = false
          })
        })
        this.recommendMusics = arr
        this.recommendMusic = arr.slice(0, 10)
        store.state.recMusicList = this.recommendMusic
      })
    },
    init () {
      if (!this.userInfo.nickName) {
        wx.reLaunch({
          url: 'pages/login/main'
        })
      }
      this.getTopMusic()
      this.getRecommendMusic()
    },
    goDetail (item, type) {
      store.state.currentSong = item
      wx.navigateTo({
        url: `../detail/main?from=${type}`
      })
    },
    goSearch () {
      wx.navigateTo({
        url: '../search/main'
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  min-height: 100vh;
  background: #f5f7f8;
  &-search {
    padding: 20rpx 0 0 45rpx;
    height: 60rpx;
    img {
      width: 48rpx;
      height: 48rpx;
    }
  }
  &-banner {
    margin-top: 5rpx;
    &-swiper {
      padding: 0 30rpx;
      img {
        border-radius: 20rpx;
        width: 100%;
        height: 100%;
      }
    }
  }
  &-music {
    padding: 0 30rpx 20rpx;
    &-recommend {
      &-info {
        display: inline-block;
        width: 33.3%;
        box-sizing: border-box;
        &:nth-child(3n-2) {
          padding-right: 10rpx;
        }
        &:nth-child(3n-1) {
          padding: 0 10rpx;
        }
        &:nth-child(3n) {
          padding-left: 10rpx;
        }
        .music-list {
          display: inline-block;
          width: 100%;
          font-size: 0;
          margin-bottom: 25rpx;
          image {
            width: 100%;
            height: 180rpx;
            border-radius: 10rpx;
          }
          p {
            margin-top: 10rpx;
            font-size: 26rpx;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }
    }
    &-songs {
      &-info {
        position: relative;
        display: flex;
        margin-bottom: 15rpx;
        img {
          width: 120rpx;
          height: 120rpx;
          border-radius: 20rpx;
          margin-right: 20rpx;
        }
        &-content {
          padding-top: 24rpx;
          font-size: 0;
          &-name {
            font-size: 30rpx;
          }
          &-singer {
            line-height: 40rpx;
            font-size: 24rpx;
            display: flex;
            color: #999;
            max-width: 400rpx;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
        &-play {
          position: absolute;
          top: 50%;
          right: 20rpx;
          transform: translate(0, -50%);
        }
      }
    }
    &-title {
      margin: 30rpx 0 20rpx;
      padding: 10rpx 0;
      font-size: 40rpx;
      color: #ffc773;
    }
  }
}
</style>
