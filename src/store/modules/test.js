import api from '@/axios/api'

import * as types from '../types'



const state = {
    accountList: [],
    totalItem: 0,
   
}

const getters = {
    accountList: state => {
        for (let value of state.accountList) {
            if (value.gender == 1) {
                value.sex = '男'
            } else {
                value.sex = '女'
            }
        }
        return state.accountList
    }
}

const mutations = {
    [types.ACCOUNTLIST](state, datas) {
        state.accountList = datas.list
        state.totalItem = datas.total
        state.accountLoading = false
    },
}

const actions = {}



export default {
    state,
    getters,
    actions,
    mutations,
}