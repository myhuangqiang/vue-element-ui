<template>
    <div class="dialog-container">
        <el-dialog
            :title="dialogDatas.title == 'isEdit' ? '编辑' : '新增'"
            :width="dialogDatas.width || '720px'"
            :visible.sync="visible"
            @close="$emit('updateShow', false)"
            :show="show">
            <!-- <span>this is a dialog.</span> -->
            <slot></slot>
            <span slot="footer" class="dialog-footer">
                <el-button @click="visible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data () {
            return {
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
            }
        },
        methods: {
            submitForm() {
                this.$emit('submitForm')
            }
        },
        watch: {
            show () {
                this.visible = this.show;
            }
        }
    };
</script>