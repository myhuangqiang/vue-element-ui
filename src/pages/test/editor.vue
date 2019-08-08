<template>
    <div style="border: none;">
        <quill-editor ref="myTextEditor" v-model="content" :options="editorOption"></quill-editor>
        <el-button class="editor-btn" type="primary" @click="submit">提交</el-button>
    </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
export default {
    data: function(){
        return {
            content: '',
            editorOption: {
                placeholder: 'Hello World'
            }
        }
    },
    components: {
        quillEditor
    },
    methods: {
        onEditorChange({ editor, html, text }) {
            this.content = html;
        },
        submit(){
            console.log(this.content);
            this.$message.success('提交成功！');
        }
    }
}
</script>

<style lang="scss" scoped>
    .quill-editor {
        min-height: 500px;
        /deep/ .ql-container {
            height: 500px !important;
        }
    }
    .editor-btn {
        margin-top: 10px;
    }
</style>
