import api from '@/axios/api'
import router from '@/router'
const state = {
    islogin: localStorage.islogin ? JSON.parse(localStorage.islogin) : false,
    userInfos: localStorage.userInfos ? JSON.parse(localStorage.userInfos) : null
}
  
  
const mutations = {
    LOGIN:(state,res) => {
        //传入登录状态islogin
        let islogin = true
        localStorage.islogin = JSON.stringify(islogin)
        localStorage.userInfos = JSON.stringify(res)
        state.islogin = islogin
        state.userInfos = res
    },
    LOGOUT: (state) => {
        let islogin = false
        localStorage.islogin = JSON.stringify(islogin)
        state.islogin = islogin
        // localStorage.removeItem('userInfos')
        // state.userInfos = null

        router.push({path:'/login'})
    }
}
  

const actions = {
    logOutAction({ commit }, palyload) {
        return api.logOut(palyload)
            .then(res => {
                if (res.code == 0) {
                    commit('LOGOUT')
                }
                return res
            })
    }
}
  
export default {
    namespaced: true,
    state,
    mutations,
    actions
}