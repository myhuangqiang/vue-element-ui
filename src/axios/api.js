import { fetchPost, fetchGet, fetchPut } from '@/axios/fetch'
import store from '@/store'

export default {

	login: (params) => fetchPost('/api/?r=user/login', params),
	
	logOut: (params) => fetchPost(`/api/?r=user/logout&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	exportCsv:  (controller, params) => fetchPost(`/api/?r=${controller}/query&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	query: (controller, params) => fetchPost(`/api/?r=${controller}/query&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	add: (controller, params) => fetchPost(`/api/?r=${controller}/add&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	update: (controller, params) => fetchPost(`/api/?r=${controller}/update&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	delete: (controller, params) => fetchPost(`/api/?r=${controller}/delete&access_token=${store.state.user.userInfos.datas.access_token}`, params),

	upload:  (params) => fetchPost(`/api/?r=tools/upload-file&access_token=${store.state.user.userInfos.datas.access_token}`, params),

}