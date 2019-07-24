

const state = {
  sideBarOpened: sessionStorage.sideBarOpened ? JSON.parse(sessionStorage.sideBarOpened) : true
}


const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sideBarOpened = !state.sideBarOpened
    if (state.sideBarOpened) {
      sessionStorage.sideBarOpened = true
    } else {
      sessionStorage.sideBarOpened = false
    }
  },
  HIDE_OR_SHOW_SIDEBAR: (state,data) => {
    state.sideBarOpened = data
  }
}


const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  hideSideBar({ commit }, data) {
    commit('HIDE_OR_SHOW_SIDEBAR', data)
  }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
  }