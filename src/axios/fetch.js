
import { Message,Loading  } from 'element-ui';

import axios from 'axios'
// import qs from 'qs'

import store from '@/store'


// const baseURL = 'http://47.107.120.102:8080'

let loadingInstance;

axios.defaults.timeout = 10000; //响应时间
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// axios.defaults.baseURL = baseURL; //配置接口地址

//POST传参序列化(添加请求拦截器)
axios.interceptors.request.use((config) => {

    //在发送请求之前做某件事
    // if (config.method === 'post') {
    //     config.data = qs.stringify(config.data);
    // }
    // loadingInstance = Loading.service(options);
    return config;
}, (error) => {
    // loadingInstance.close()
    return Promise.reject(error)
})

//返回状态判断(添加响应拦截器)
axios.interceptors.response.use((response) => {
    //对响应数据做些事
    if (response.data.code !== 0 && response.data.code !== -100) {
        Message({
            message: response.data.message, 
            duration: 2000,
            type: 'error'
        })
    } else if (response.data.code == -100) {
        store.commit('user/LOGOUT')
        return false
    }
    // loadingInstance.close()
    return response
}, (error) => {
    // 错误码处理
    Message({
        message: '请求失败', 
        duration: 2000 
    })
    // Indicator.close()
    // loadingInstance.close()
    return Promise.reject(error)
})

//返回一个Promise(发送post请求)
export function fetchPost(url, params) {
    return new Promise((resolve, reject) => {
        axios.post(url, params)
        .then(response => {
            resolve(response.data)
        }, err => {
            reject(err);
        })
        .catch((error) => {
            reject(error)
        })
    })
}
// 返回一个Promise(发送get请求)
export function fetchGet(url, param) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
        params: param
        })
        .then(response => {
            resolve(response.data)
        }, err => {
            reject(err)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

//返回一个Promise(发送put请求)
export function fetchPut(url, params) {
    return new Promise((resolve, reject) => {
        axios.put(url, params)
        .then(response => {
            resolve(response.data)
        }, err => {
            reject(err);
        })
        .catch((error) => {
            reject(error)
        })
    })
}


