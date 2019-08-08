<!-- 搜索表单 -->
<template>
    <el-form ref='editForm' :inline="true" :size="size" :label-width="labelWidth" :model="editData" :rules="editRules">
        <el-form-item v-for='item in editCfg' :label="item.label" :prop='item.prop' :key="item.label"  >
            <!-- 输入框 -->
            <el-input v-if="item.type==='input'" :show-password="item.password" v-model="editData[item.prop]" 
                @change="item.change && item.change(editData[item.prop])"
                :disabled="item.disabled && item.disabled(editData)"
                :style="{width: item.width || '200px'}"></el-input>
            <!-- 文本域 -->
            <el-input v-if="item.type==='textarea'" type="textarea" 
                :disabled="item.disabled && item.disabled(editData)"
                @change="item.change && item.change(editData[item.prop])"
                 v-model="editData[item.prop]"  :style="{width:item.width || '200px'}"></el-input>
            <!-- 下拉框 -->
            <el-select v-if="item.type==='select'" v-model="editData[item.prop]"  
                @change="item.change && item.change(editData[item.prop])"
                :style="{width:item.width || '200px'}"
                :disabled="item.disabled && item.disabled(editData)">
                <el-option v-for="op in item.options" :label="op.label" :value="op.value" :key="op.value">
                    <div v-if="item.slot">
                        <span style="float: left; margin-right: 20px;">{{ op.label }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">{{ op.value }}</span>
                    </div>
                </el-option>
            </el-select>
            <!-- 单选 -->
            <el-radio-group v-if="item.type==='radio'" v-model="editData[item.prop]"
                @change="item.change && item.change(editData[item.prop])"
                :disabled="item.disabled && item.disabled(editData)">
                <el-radio v-for="ra in item.radios" :label="ra.value" :key="ra.value">{{ra.label}}</el-radio>
            </el-radio-group>
            <!-- 单选按钮 -->
            <el-radio-group v-if="item.type==='radioButton'" v-model="editData[item.prop]" 
                    @change="item.change && item.change(editData[item.prop])"
                    :disabled="item.disabled && item.disabled(editData)">
                <el-radio-button v-for="ra in item.radios" :label="ra.value" :key="ra.value">{{ra.label}}</el-radio-button>
            </el-radio-group>
            <!-- 复选框 -->
            <el-checkbox-group v-if="item.type==='checkbox'" v-model="editData[item.prop]" 
                @change="item.change && item.change(editData[item.prop])"
                :disabled="item.disabled && item.disabled(editData)">
                <el-checkbox v-for="ch in item.checkboxs" :label="ch.value" :key='ch.value'>{{ch.label}}</el-checkbox>
            </el-checkbox-group>
            <!-- 日期 -->
            <el-date-picker v-if="item.type==='date'" v-model="editData[item.prop]" 
                @change="item.change && item.change(editData[item.prop])"
                :disabled="item.disabled && item.disabled(editData)"></el-date-picker>
            <!-- 时间 -->
            <el-time-select v-if="item.type==='time'" v-model="editData[item.prop]" type=''
                @change="item.change && item.change(editData[item.prop])"
                :disabled="item.disabled && item.disabled(editData)"></el-time-select>
            <!-- 日期时间 -->
            <el-date-picker v-if="item.type==='dateTime'" type='datetime' v-model="editData[item.prop]" 
                @change="item.change && item.change(editData[item.prop])"
                :disabled="item.disable && item.disable(editData[item.prop])"></el-date-picker>
            <!-- 滑块 -->
            <!-- <el-slider v-if="item.type==='Slider'" v-model="editData[item.prop]"></el-slider> -->
            <!-- 开关 -->
            <el-switch v-if="item.type==='switch'" v-model="editData[item.prop]" 
                @change="item.change && item.change(editData[item.prop])"
                :disabled="item.disabled && item.disabled(editData)"></el-switch>
            <!-- 文件上传 -->
            <el-upload
                :style="{width: item.width || '200px'}"
                v-if="item.type === 'upload'"
                class="upload-demo"
                ref="upload"
                :action="upLoadUrl"
                :on-remove="handleRemove"
                :on-change="addFile"
                :auto-upload="false"
                :http-request="handleHttpRquest"
                :file-list="fileList">
                <el-button slot="trigger" size="small" type="primary">上传文件</el-button>
                <div slot="tip" class="el-upload__tip">只能上传txt文件，且不超过5M</div>
            </el-upload>
        </el-form-item>
    </el-form>
</template>

<script>
export default {
    props:{
        labelWidth:{
            type:String,
            default:'100px'
        },
        size:{
            type:String,
            default:'medium'
        },
        editCfg:{
            type:Array,
            default:()=>[]
        },
        editData:{
            type:Object,
            default:()=>{}
        },
        editRules:{
            type: Object,
            default: {}
        },
    },
    data () {
        return {
            that:this,

            fileList: [],
            upLoadUrl: '123',

            fileUrl: '', // 文件上传成功后的访问路径
        };
    },
    computed: {
        
    },
    methods:{
        async submitUpload() {
            if (this.fileList.length == 0) {
                this.$message.error('请上传文件')
                return false;
            } 
            return await this.handleHttpRquest()
        },
        addFile(file,fileList) {
            this.fileList = []
            this.fileList.push(file)
            //限制上传文件为5M
            var sizeIsSatisfy = file.size < 5*1024*1024 ? true:false;
            if(sizeIsSatisfy){
                return true;
            }else{
                this.$message.error('文件大小不能超过5M')
                return false;
            }
        },
        handleRemove(file, fileList) {
            this.fileList = []
        },
        handleHttpRquest() {
            var formdata = new FormData()
            formdata.append('upFile', this.fileList[0].raw)
            return this.$api.upload(formdata).then(res => {
                if (res.code == 0) {
                    this.fileUrl = res.data.saveIn
                    this.$message({
                        type: 'success',
                        message: '上传成功!'
                    })
                }
                this.fileList = []

                return res
            })
        }
    },
    mounted() {
        if (this.editData.material) {
            this.fileList = [{name: this.editData.material, url: this.editData.material}]
        } else {
            this.fileList = []
        }

        console.log(this.editRules)
    },


}

</script>
<style>

</style>