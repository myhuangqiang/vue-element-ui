
import api from '@/axios/api'
const state = {
    preferenceList: [],  // 查询参数列表
    keyList: [], // 导航（参数）列表

    merchantList: [], // 商户列表
    planList: [], // 计划列表
    productList: [], // 产品列表
}
  
  
const mutations = {
    GET_PREFERENCE_LIST: (state, data) => {
        state.preferenceList = data
    },
    GET_KEY_LIST: (state, data) => {
        state.keyList = data
    },
    GET_MERCHANT_LIST: (state, data) => {
        state.merchantList = data
    },
    GET_PLAN_LIST: (state, data) => {
        state.planList = data
    },
    GET_PRODUCT_LIST: (state, data) => {
        state.productList = data
    },
}
  
  
const actions = {
    getPreferenceList({commit}) {
        return api.query('preference').then(res => {
            if (res.code == 0) {
                commit('GET_PREFERENCE_LIST', res.data)
            }
            return res
        })
    },
    getMerchantList({commit}, playload) {
        return api.query('merchant', playload).then(res => {
            if (res.code == 0 && res.data) {
                let merchantList = []
                res.data.forEach((item) => {
                    merchantList.push({label: item.merchantname, value: item.merchantid})
                })
                commit('GET_MERCHANT_LIST', merchantList)
            }
            return res
        })
    },
    getPlanList({commit}, playload) {
        return api.query('plan', playload).then(res => {
            if (res.code == 0 && res.data) {
                let planList = []
                res.data.forEach((item) => {
                    planList.push({label: item.planname, value: item.planid})
                })
                commit('GET_PLAN_LIST', planList)
            }
            return res
        })
    },
    getProductList({commit}, playload) {
        return api.query('product', playload).then(res => {
            if (res.code == 0 && res.data) {
                let productList = []
                res.data.forEach((item) => {
                    productList.push({label: item.productname, value: item.productid})
                })
                commit('GET_PRODUCT_LIST', productList)
            }
            return res
        })
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}