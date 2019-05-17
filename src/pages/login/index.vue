<template>
  <div class="login">
    <img :src="bgImg">
    <button @getuserinfo="onGetUserinfo" open-type="getUserInfo">welcome</button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      bgImg: '/static/images/login.JPG'
    }
  },
  methods: {
    onGetUserinfo(e) {
      let userInfo = e.mp.detail.userInfo
      wx.cloud.callFunction({
        name: 'login',
        complete: res => {
          userInfo.openid = res.result.openid
          wx.setStorageSync('userinfo', userInfo)
          wx.switchTab({
            url: '/pages/index/main'
          })
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
    height: 100%;
  }
  button {
    width: 60%;
    padding: 10rpx 0;
    position: absolute;
    top: 70%;
    left: 50%;
    transform: translate(-50%, 0%);
    background: #ffc773;
  }
}
</style>
