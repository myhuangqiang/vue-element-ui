

const state = {
islogin: ''
}
  
  
const mutations = {
    LOGIN:(state,n) => {
        //传入登录状态islogin
        let islogin = JSON.parse(n)
        localStorage.setItem('islogin',JSON.stringify(islogin))
        console.log(islogin)
        state.islogin = islogin
    }
}
  

const actions = {

}
  
export default {
    namespaced: true,
    state,
    mutations,
    actions
}