<template>
    <div id="login">
        <div class="ms-login">
            <div class="ms-title">后台管理系统</div>
            <form class="el-form ms-content">
                <div class="el-form-item is-required el-form-item--small">
                    <div>
                        <div class="el-input-group el-input-group--prepend">
                            <div class="el-input-group__prepend">
                                <el-button><i class="el-icon-user"></i></el-button>
                            </div>
                            <el-input type="text" v-model="userName" autocomplete="off" placeholder="请输入用户名"></el-input>
                        </div>
                    </div>
                </div>
                <div class="el-form-item is-required el-form-item--small">
                    <div>
                        <div class="el-input-group el-input-group--prepend">
                            <div class="el-input-group__prepend">
                                <el-button><i class="el-icon-lock"></i></el-button>
                            </div>
                            <el-input type="password" v-model="psw" show-password autocomplete="off" placeholder="请输入登录密码"></el-input>
                        </div>
                    </div>
                </div>
                <div class="login-btn">
                    <el-button :loading="loginLoading" type="primary" @click="Login">
                        <span>登录</span>
                    </el-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            loginLoading: false,
            userName: '',
            psw: ''
        }
    },
    methods: {
        Login() {
            if (!this.userName || !this.psw) {
                this.$message.error('用户名或密码不能为空！') 
                return false
            }
            this.loginLoading = true
            this.$api.login({username: this.userName, passwordmd5: this.$md5(this.psw)}).then(res => {
                this.loginLoading = false
                if (res.code == 0) {
                    this.$store.commit('user/LOGIN',{datas: res.data, userName: this.userName})
                    this.$router.push({path:'/'}) 
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    #login {
        height: 100%;
        background: url('../assets/login-bg.jpg') no-repeat center;
        background-size: cover;
        .ms-login {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 350px;
            margin: -190px 0 0 -175px;
            border-radius: 5px;
            background: hsla(0,0%,100%,.3);
            overflow: hidden;
            .ms-title {
                width: 100%;
                line-height: 50px;
                text-align: center;
                font-size: 20px;
                color: #fff;
                border-bottom: 1px solid #ddd;
            }
            .ms-content {
                padding: 30px 30px;
            }
            .login-btn button {
                width: 100%;
            }
        }
    }
</style>
