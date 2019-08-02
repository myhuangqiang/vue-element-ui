<template>
    <div class="nav_bar">
        <div id="hamburger-container" class="hamburger-container" style="padding: 0px 15px;" @click="toggleClick">
            <!-- <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="64" height="64" style="color: #fff" class="hamburger" :class="{'is-active': sideBarOpened}">
                <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"></path>
            </svg> -->
            <i class="el-icon-s-unfold" :class="{'is-active': sideBarOpened}" style="font-size: 26px;"></i>
        </div>
        <breadcrumbNav class="breadcrumb"></breadcrumbNav>
        <div class="popover">
            <!-- 主题色 -->
            <div style="margin-right: 16px;">
                <TopTheme></TopTheme>
            </div>
            <!-- 全屏显示 -->
            <div class="btn-fullscreen" @click="fullscreenFn">
                <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
                    <i class="el-icon-rank fullscreen"></i>
                </el-tooltip>
            </div>
            <el-dropdown>
                <span class="el-dropdown-link">
                    <img width="24" height="24"  src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png" alt="">
                    <span>{{userInfos.userName}}</span>
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item icon="el-icon-plus">个人设置</el-dropdown-item>
                    <el-dropdown-item icon="el-icon-circle-plus" @click.native="quit">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
import breadcrumbNav from './breadcrumb' //面包屑
import TopTheme from './top-theme'
import { mapState } from 'vuex'
export default{
    data(){
        return {
            isActive: true,

            fullscreen: false
        }
    },
    computed: {
        ...mapState({
            'sideBarOpened': state => state.app.sideBarOpened,
            'userInfos': state => state.user.userInfos
        })
    },
    methods:{
        quit() {
            // 退出登录
            this.$store.dispatch('user/logOutAction', {userid: this.userInfos.datas.userid})
        },
        fullscreenFn() {
            let element = document.documentElement;
            if (this.fullscreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    // IE11
                    element.msRequestFullscreen();
                }
            }
            this.fullscreen = !this.fullscreen;
        },
        toggleClick() {
            this.$store.dispatch('app/toggleSideBar')
        },
    },
    created() {
    },
    components:{
        breadcrumbNav,
        TopTheme
    }
}
</script>

<style lang="scss" scoped>
    .nav_bar {
        height: 50px;
        box-shadow: 0 1px 4px rgba(0,21,41,.08);
        position: relative;
        background: #002140;
        color: #fff;

        // position: fixed;
        // width: calc(100% - 210px);
        // height: 50px;
        // z-index: 200;
        // left: 210px;
        // top: 0;
        .hamburger-container {
            line-height: 60px;
            height: 100%;
            float: left;
            cursor: pointer;
            &:hover {
                background: rgba(0,0,0,.025)
            }
            .is-active {
                -webkit-transform: rotate(180deg);
                transform: rotate(180deg)
            }
        }
        .breadcrumb {
            float: left;
        }
        .popover {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            .btn-fullscreen i.fullscreen {
                font-size: 20px;
                cursor: pointer;
            }
            .el-dropdown-link {
                img {
                    width: 24px;
                    height: 24px;
                    margin: 13px 10px;
                    vertical-align: middle;
                }
                span {
                    vertical-align: middle;
                    font-size: 14px;
                    color: #fff;
                }
                i {
                    color: #fff;
                }
            }
        }
    }
</style>


