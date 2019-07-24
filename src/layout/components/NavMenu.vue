<template>
  <div class="navMenu">
    <label v-for="(navMenu, index) in navMenus" :key="index">
      <el-menu-item v-if="navMenu.childs==null&&navMenu.entity"
                    :key="navMenu.entity.id" :index="navMenu.entity.value" :route="navMenu.entity.value">
        <i :class="navMenu.entity.icon"></i>
        <span slot="title" class="item_title">{{navMenu.entity.alias}}</span>
      </el-menu-item>

      <el-submenu v-if="navMenu.childs&&navMenu.entity"
                  :key="navMenu.entity.id" :index="navMenu.entity.alias">
        <template slot="title">
          <i :class="navMenu.entity.icon"></i>
          <span class="item_title"> {{navMenu.entity.alias}}</span>
        </template>
        <NavMenu :navMenus="navMenu.childs"></NavMenu>
      </el-submenu>
    </label>

  </div>
</template>

<script>
  export default {
    name: 'NavMenu',
    props: ['navMenus'],
    data() {
      return {}
    },
    mounted(){
        // console.log(this.navMenus)
    },
    methods: {}
  }
</script>


<style>
    .el-menu {
        width: 100%;
        overflow: hidden;
    }
    .el-submenu [class^=el-icon-] {
        margin-right: 16px !important;
    }
    .el-menu--collapse .el-submenu__icon-arrow, .el-menu--collapse .el-submenu__icon-arrow {
        display: none !important;
    }
    .el-submenu .el-menu-item {
        background-color: #1f2d3d!important;
    }
</style>
