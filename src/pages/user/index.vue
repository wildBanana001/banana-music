<template>
  <div class="user">
    <img class="user-bg" :src="userInfo.avatarUrl">
    <div class="user-top">
      <img class="user-top-avatar" :src="userInfo.avatarUrl">
      <div>{{userInfo.nickName}}</div>
    </div>
    <van-tabs :active="active" @change="onChange" color="#ffc773">
      <van-tab title="喜欢">
        <div class="user-list" v-for="(item, index) in likeList" :key="index" @click="goDetail(item, 'favorite')">
          <span class="user-list-num">{{index + 1}}</span>
          <div class="user-list-content">
            <p class="user-list-content-name">{{item.name}}</p>
            <p class="user-list-content-singer">{{item.singer}}</p>
          </div>
          <div class="user-list-play">
            <van-icon name="audio" color="#ffc773" size="24px"/>
          </div>
        </div>
      </van-tab>
      <van-tab title="最近">
        <div class="user-list" v-for="(item, index) in played" :key="index" @click="goDetail(item, 'played')">
          <span class="user-list-num">{{index + 1}}</span>
          <div class="user-list-content">
            <p class="user-list-content-name">{{item.name}}</p>
            <p class="user-list-content-singer">{{item.singer}}</p>
          </div>
          <div class="user-list-play">
            <van-icon name="audio" color="#ffc773" size="24px"/>
          </div>
        </div>
      </van-tab>
    </van-tabs>
    <vplay/>
  </div>
</template>

<script>
import vplay from '@/components/player'
import store from '@/store.js'

const db = wx.cloud.database()
export default {
  components: {
    vplay
  },
  data () {
    return {
      userInfo: wx.getStorageSync('userinfo') || {},
      active: 0,
      likeList: [],
      played: []
    }
  },
  created () {
    this.getLike()
    this.getPlayed()
  },
  onShow () {
    this.getLike()
    this.getPlayed()
  },
  methods: {
    goDetail (item, type) {
      store.state.currentSong = item
      wx.navigateTo({
        url: `../detail/main?from=${type}`
      })
    },
    getLike () {
      db.collection('favorite').where({
        _openid: this.userInfo.openid
      }).get().then(res => {
        res.data.map((item, index) => {
          this.likeList[index] = item.song
        })
      })
    },
    getPlayed () {
      this.played = store.state.played
    }
  },
}
</script>

<style lang="scss" scoped>
.user {
  width: 100%;
  min-height: 100vh;
  background: #f5f7f8;
  &-top {
    position: relative;
    z-index: 2;
    width: 100vw;
    height: 460rpx;
    text-align: center;
    padding: 40rpx 40rpx 0;
    box-sizing: border-box;
    color: #ffc773;
    &-avatar {
      margin-top: 70rpx;
      width:200rpx;
      height:200rpx;
      border-radius: 50%;
    }
  }
  &-bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100vw;
    height: 500rpx;
    filter: blur(10px);
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
