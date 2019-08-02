<template>
    <div class="preference_model">
        <el-dialog
            :title="dialogDatas.title == 'isEdit' ? '编辑' : '新增'"
            :width="dialogDatas.width || '720px'"
            :visible.sync="visible"
            @close="$emit('updateShow', false)"
            :show="show">
            <el-form  label-width="80px">
                <el-form-item label="参数名称">
                    <el-input type="input" v-model="params.key"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" v-model="params.remark"></el-input>
                </el-form-item>
                <el-form-item label="参数内容">
                    <el-tag
                        :key="tag"
                        v-for="tag in params.value"
                        closable
                        :disable-transitions="false"
                        @close="handleClose(tag)">
                        {{tag}}
                    </el-tag>
                    <el-input
                        class="input-new-tag"
                        v-if="inputVisible"
                        v-model="inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm"
                        @blur="handleInputConfirm"
                        >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="visible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </span>
        </el-dialog>
        
    </div>
</template>

<script>
export default {
    data() {
        return {
            inputVisible: false,
            inputValue: '',
            
            params: {
                key: '',
                remark: '',
                value: []
            },
            visible: this.show
        }
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        dialogDatas: {
            type: Object,
            required: true
        },
        editData: {
            type: Object,
            default: () => {}
        }
    },
    methods: {
        handleClose(tag) {
            this.params.value.splice(this.params.value.indexOf(tag), 1);
        },

        showInput() {
            this.inputVisible = true;
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },

        handleInputConfirm() {
            let inputValue = this.inputValue;
            if (inputValue && !this.params.value.includes(inputValue)) {
                this.params.value.push(inputValue);
            }
            this.inputVisible = false;
            this.inputValue = '';
        },
        submitForm() {
            this.$emit('submitForm',this.params)
        }
    },
    mounted() {
    },
    updated() {
    },
    watch: {
        show () {
            this.visible = this.show
            if (!this.visible) {
                this.inputVisible = false
                this.inputValue = ''
                this.params.key = ''
                this.params.remark = ''
                this.params.value = []
                delete this.params.preferenceid
            }
            if (this.dialogDatas.title == 'isEdit' && this.visible) {
                this.params = {
                    key: this.editData.key,
                    remark: this.editData.remark,
                    value: this.editData.value,
                    preferenceid: this.editData.preferenceid
                }
            }
        },
        deep: true
    }
}
</script>

<style lang="scss" scoped>
    .el-tag + .el-tag {
        margin-left: 10px;
    }
    .button-new-tag {
        margin-left: 10px;
        height: 32px;
        line-height: 30px;
        padding-top: 0;
        padding-bottom: 0;
    }
    .input-new-tag {
        width: 90px;
        margin-left: 10px;
        vertical-align: bottom;
    }
</style>



