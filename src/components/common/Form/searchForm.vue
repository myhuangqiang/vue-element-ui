<!-- 搜索表单 -->
<template>
<div class="ces-search">
    <el-form :size="size" ref="refForm" inline :label-width="labelWidth">
        <el-form-item v-for='item in searchForm' :label="item.label" :key='item.prop'>
            <!-- 输入框 -->
            <el-input clearable v-if="item.type==='Input'" v-model="searchData[item.prop]" :size="size" :placeholder="item.placeholder" :style="{width: item.width}"></el-input>
            <!-- 下拉框 -->
            <el-select clearable v-if="item.type==='Select'" :placeholder="item.placeholder" v-model="searchData[item.prop]" :style="{width: item.width}" :size="size" @change="item.change(searchData[item.prop])">
                <el-option v-for="op in item.options" :label="op.label" :value="op.value" :key="op.value">
                    <div v-if="item.slot">
                        <span style="float: left">{{ op.label }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">{{ op.value }}</span>
                    </div>
                </el-option>
            </el-select>
            <!-- 单选 -->
            <el-radio-group v-if="item.type==='Radio'" v-model="searchData[item.prop]">
                <el-radio v-for="ra in item.radios" :label="ra.value" :key="ra.value">{{ra.label}}</el-radio>
            </el-radio-group>
            <!-- 单选按钮 -->
            <el-radio-group v-if="item.type==='RadioButton'" v-model="searchData[item.prop]" @change="item.change && item.change(searchData[item.prop])">
                <el-radio-button v-for="ra in item.radios" :label="ra.value" :key="ra.value">{{ra.label}}</el-radio-button>
            </el-radio-group>
            <!-- 复选框 -->
            <el-checkbox-group v-if="item.type==='Checkbox'" :style="{width: item.width}" v-model="searchData[item.prop]" >
                <el-checkbox v-for="ch in item.checkboxs" :label="ch.value" :key="ch.value">{{ch.label}}</el-checkbox>
            </el-checkbox-group>
            <!-- 日期 -->
            <el-date-picker v-if="item.type==='Date'" :style="{width: item.width}" :default-time="item.defaultTime" value-format="yyyy-MM-dd" :placeholder="item.placeholder" v-model="searchData[item.prop]"></el-date-picker>
            <!-- 时间 -->
            <el-time-select v-if="item.type==='Time'" :style="{width: item.width}" v-model="searchData[item.prop]" type=''></el-time-select>
            <!-- 日期时间 -->
            <el-date-picker v-if="item.type==='DateTime'" :style="{width: item.width}" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" type='datetime' :default-time="item.defaultTime" :placeholder="item.placeholder" v-model="searchData[item.prop]" :disabled="item.disable && item.disable(searchData[item.prop])"></el-date-picker>
            <!-- 滑块 -->
            <!-- <el-slider v-if="item.type==='Slider'" v-model="searchData[item.prop]"></el-slider> -->
            <!-- 开关 -->
            <el-switch v-if="item.type==='Switch'" v-model="searchData[item.prop]" ></el-switch>
        </el-form-item>
        <div style="display: inline-block" v-if='isHandle'>
            <el-form-item v-for='item in searchHandle' :key="item.label">
                <el-button :type="item.type" :loading="item.isLoading" :size="item.size || size" @click='item.handle(item)'>{{item.label}}</el-button>
            </el-form-item>
        </div>
        
    </el-form>
    <!-- <el-form inline v-if='isHandle'>
        <el-form-item v-for='item in searchHandle' :key="item.label">
            <el-button :type="item.type" :size="item.size || size" @click='item.handle()'>{{item.label}}</el-button>
        </el-form-item>
    </el-form> -->
</div>
</template>

<script>
export default {
    props:{
        isHandle:{
            type:Boolean,
            default:true
        },
        labelWidth:{
            type:String,
            default:'100px'
        },
        size:{
            type:String,
            default:'medium'
        },
        searchForm:{
            type:Array,
            default:[]
        },
        searchHandle:{
            type:Array,
            default:()=>[]
        },
        searchData:{
            type:Object,
            default:{}
        }
    },
    data () {
        return {
        };
    },
    methods: {
 
    }

}

</script>
<style>

</style>