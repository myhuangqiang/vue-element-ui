import { fetchPost, fetchGet, fetchPut } from '@/axios/fetch'
import store from '@/store'

// 环境的切换
let proxyUrl = ''
if (process.env.NODE_ENV == 'development') {
    proxyUrl = '/api';
}

export default {

	login: (params) => fetchPost(`${proxyUrl}/?r=user/login`, params),
	
	logOut: (params) => fetchPost(`${proxyUrl}/?r=user/logout&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	exportCsv:  (controller, params) => fetchPost(`${proxyUrl}/?r=${controller}/query&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	query: (controller, params) => fetchPost(`${proxyUrl}/?r=${controller}/query&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	add: (controller, params) => fetchPost(`${proxyUrl}/?r=${controller}/add&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	update: (controller, params) => fetchPost(`${proxyUrl}/?r=${controller}/update&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	delete: (controller, params) => fetchPost(`${proxyUrl}/?r=${controller}/delete&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	upload:  (params) => fetchPost(`${proxyUrl}/?r=tools/upload-file&access_token=${store.state.user.userInfos.datas.access_token}`, params),

}