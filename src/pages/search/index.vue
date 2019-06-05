<template>
  <div class="search">
    <div class="safe-top" :style="safeHeight"></div>
    <div :style="safeHeight"></div>
    <div class="search-back" @click="goBack">
       <van-icon name="arrow-left" color="#000" size="50rpx"/>
    </div>
    <van-search :value="query"
      placeholder="请输入歌手或歌曲名"
      @change="onChange"
      :focus="true"/>
    <van-loading class="search-loading"
        v-if="isLoading"
        size="80rpx"/>
    <div class="search-list" v-for="(item, index) in list" :key="index" @click="goDetail(item, 'searchList')">
      <span class="search-list-num">{{index + 1}}</span>
      <div class="search-list-content">
        <p class="search-list-content-name">{{item.name}}</p>
        <p class="search-list-content-singer">{{item.singer}}</p>
      </div>
      <div class="search-list-play">
        <van-icon name="audio" color="#ffc773" size="24px"/>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store.js'

const db = wx.cloud.database()
export default {
  data () {
    return {
      list: [],
      isLoading: false
    }
  },
  computed: {
    safeHeight () {
      return wx.getStorageSync('safeHeight') ? wx.getStorageSync('safeHeight') : '20px'
    }
  },
  methods: {
    getData (query) {
      this.isLoading = true
      wx.cloud.callFunction({
        name: 'http',
        data: {
          url: `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?aggr=1&cr=1&flag_qc=0&p=1&n=20&w=${query}`
        }
      }).then(res => {
        this.isLoading = false
        let json = res.result.substring(9, res.result.length - 1)
        let obj = JSON.parse(json).data.song.list
        let arr = []
        obj.map((item, index) => {
          arr[index] = {}
          arr[index].name = item.albumname
          arr[index].id = item.albumid
          arr[index].songmid = item.songmid
          arr[index].singer = ''
          item.singer.map(v => {
            arr[index].singer = arr[index].singer + v.name + ' '
          })
          let temp = item.albumid.toString().slice(-2)
          if (temp[0] === '0') temp = temp[1]
          arr[index].cover = `http://imgcache.qq.com/music/photo/album_300/${temp}/300_albumpic_${item.albumid}_0.jpg`
          db.collection('favorite').doc(item.songmid).get().then(res => {
            arr[index].like = true
          }).catch(res => {
            arr[index].like = false
          })
        })
        this.list = arr
        store.state.searchList = this.list
      })
    },
    onChange (e) {
      this.getData(e.mp.detail)
    },
    goDetail (item, type) {
      store.state.currentSong = item
      wx.navigateTo({
        url: `../detail/main?from=${type}`
      })
    },
    goBack () {
      wx.navigateBack({
        delta: 1
      })
    },
    debounce (fn, delay) {
      let timer = null
      return function (e) {
        clearTimeout(timer)
        let context = this
        let args = arguments
        timer = setTimeout(() => {
          fn.apply(context, args)
        }, delay)
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.safe-top {
  background: #fff;
}
.search {
  &-back {
    padding: 20rpx 0 0 20rpx;
  }
  &-loading {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99;
  }
  &-list {
    position: relative;
    widows: 100vw;
    display: flex;
    background: #fff;
    padding-bottom: 15rpx;
    border-bottom: 1rpx solid 	rgba(204, 204, 204, .3);
    span {
      display: flex;
      align-items: center;
      font-size: 30rpx;
      color: #999;
      margin: 0 30rpx;
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
      right: 60rpx;
      transform: translate(0, -50%);
    }
  }
}
</style>
