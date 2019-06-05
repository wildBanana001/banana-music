import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    currentSong: {
      cover: '/static/images/music-albums.svg'
    },
    played: []
  },
  mutations: {},
  getters: {},
  actions: {}
})

export default store
