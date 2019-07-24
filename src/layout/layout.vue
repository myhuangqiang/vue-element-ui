<template>
  	<div class="main">
    	<!--左侧菜单组件-->
		<div class="sidebar-container" :style="{width: sideBarOpened ? '210px' : '64px'}">
			<div class="logo_wrap" @click="toHome"></div>
			<el-scrollbar wrap-class="scrollbar-wrapper">
				<el-menu
					:default-active="activeIndex"
					class="el-menu-vertical-demo"
					@select="menuSelected"
					background-color="#304156"
					text-color="#fff"
					:collapse="isCollapse"
					router
					@open="handleOpen"
					@close="handleClose"
					mode="vertical"
					:collapse-transition="false"
					:unique-opened="true"
				>
					<!--加上router 才能实现跳转-->
					<NavMenu :navMenus="leftMenus.childs"></NavMenu>
				</el-menu>
			</el-scrollbar>
		</div>
      

      	<!-- 右侧展示区域 -->
      	<div class="main-container" :style="{marginLeft: sideBarOpened ? '210px' : '64px'}">
			<NavBar></NavBar>
			<VTags></VTags>
			<div class="container">
				<transition name="fade-transform" mode="out-in">
            		<router-view/>
				</transition>
			</div>
        </div>
  	</div>
</template>

<script>
import leftMenus from '@/resource/leftMenus.json'
import { NavMenu, NavBar, VTags } from './components'
import { mapState } from 'vuex'
import bus from './bus'
export default {
  	data() {
    	return {
      		leftMenus: leftMenus,
    	}
	},
	computed: {
		activeIndex(){
			return this.$route.path
		},
		...mapState({
            'sideBarOpened': state => state.app.sideBarOpened
		}),
		isCollapse() {
			return !this.sideBarOpened
		}
	},
	components: {
		NavMenu,
		NavBar,
		VTags
	},
  	methods: {
		toHome() {
			this.$router.push({path: '/'})
		},
    	menuSelected(index,indexPath) {
    	},
    	handleOpen() {},
    	handleClose() {},
  	},
  	created() {
		// 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
		bus.$on('tags', msg => {
			let arr = [];
			for(let i = 0, len = msg.length; i < len; i ++){
				msg[i].name && arr.push(msg[i].name);
			}
			this.tagsList = arr;             
		})
  	},
  	mounted() {
		const { body } = document
		window.onresize = () => {
			const rect = body.getBoundingClientRect()
			if (rect.width < 1200) {
				this.$store.dispatch('app/hideSideBar', false)
			} else {
				this.$store.dispatch('app/hideSideBar', true)
			}
		}
  	},
}
</script>

<style lang="scss" scoped>
	.main {
		height: 100%;
		width: 100%;
		position: relative;
		.sidebar-container {
			width: 210px;
			background-color: #304156;
			height: 100%;
			position: fixed;
			font-size: 0;
			top: 0;
			bottom: 0;
			left: 0;
			z-index: 1001;
			overflow: hidden;
			.logo_wrap {
				height: 50px;
				background: url('../assets/logo.png') no-repeat center #002140;
				background-size: 50%;
			}
			.el-scrollbar {
				height: 100%;
			}
			.scrollbar-wrapper {
				overflow-x: hidden !important;
			}
			.el-scrollbar__wrap {
				overflow: auto !important;
				overflow-x: hidden !important;
			}
		}
		.main-container {
			min-height: 100%;
			margin-left: 210px;
			position: relative;
			background: #fff;
			.container {
				padding: 20px 14px 0;
			}
		}
	}
	/* fade */
	// .fade-enter-active,
	// .fade-leave-active {
	// 	transition: opacity 0.28s;
	// }

	// .fade-enter,
	// .fade-leave-active {
	// 	opacity: 0;
	// }

	/* fade-transform */
	.fade-transform-leave-active,
	.fade-transform-enter-active {
		transition: all .3s;
	}

	.fade-transform-enter {
		opacity: 0;
		transform: translateX(-30px);
	}

	.fade-transform-leave-to {
		opacity: 0;
		transform: translateX(30px);
	}
</style>
