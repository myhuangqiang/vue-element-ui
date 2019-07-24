<template>
    <el-breadcrumb separator="/">
        <el-breadcrumb-item
            v-for="(item,index) in breadList"
            :key="index"
            :to="{ path: item.path }"
        >{{item.meta.title}}</el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script>
export default{
//    props:['currentPath']
    data(){
        return {
            breadList: [] // 路由集合
        }
    },
    methods: {
        isHome(route) {
            return route.name === "main";
        },
        getBreadcrumb() {
            let matched = this.$route.matched;
            //如果不是首页
            if (!this.isHome(matched[0])) {
                matched = [{ path: "/home", meta: { title: "首页" } }].concat(matched);
            }
            this.breadList = matched;
        }
    },
    created() {
        this.getBreadcrumb();
    },
    watch: {
        $route() {
            this.getBreadcrumb();
        }
    },
}
</script>

<style lang="scss">
    .el-breadcrumb {
        height: 50px;
        line-height: 50px !important;
    }
    .el-breadcrumb__inner.is-link {
        color: #fff !important;
    }
    .el-breadcrumb__item:last-child .el-breadcrumb__inner, .el-breadcrumb__item:last-child .el-breadcrumb__inner a, .el-breadcrumb__item:last-child .el-breadcrumb__inner a:hover, .el-breadcrumb__item:last-child .el-breadcrumb__inner:hover {
        color: #c7b7b7 !important;
    }
</style>
