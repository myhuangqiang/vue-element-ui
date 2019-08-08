<template>
    <div>
        <search-form 
            size='medium'
            labelWidth = '80px' 
            :searchData = "searchData"
            :searchForm = "searchForm"
            :searchHandle="searchHandle"
            ref="searchFormWrap"
        >
        </search-form>

        <xy-table 
            :isSelection='false'
            :isPagination='true'
            :isHandle='true'
            :loading="tableLoading"
            :tableData='tableData' 
            :tableCols='tableCols' 
            :tableHandles='tableHandles'
            :pagination='pagination'
            @refresh="refresh"
        >
        </xy-table>


        <!-- 弹窗 -->
        <xy-modal :show.sync="show" :dialogDatas="dialogDatas" @updateShow="dialogShow" @submitForm="submitForm">
            <xy-edit ref='xyEdit' :that='that' 
                :editCfg='editForm' 
                :editData='editData' 
                :editRules='editRules' >
            </xy-edit>
        </xy-modal>
    </div>
</template>

<script>
import SearchForm from '@/components/common/Form/searchForm'
import xyTable from '@/components/common/Table/xyTable'
import xyModal from '@/components/common/Modal/xyModal'
import xyEdit from '@/components/common/Form/addOrEditForm'

import { deleteNullProperties, buildWhere } from '@/utils/validate'

import { mapState } from 'vuex'

let editformData =  {
    passwordmd5: ''
}
let searchData = {}

export default {
    components: {
        SearchForm,
        xyTable,
        xyModal,
        xyEdit
    },
    computed: {
        // ...mapState({
        //     'preferenceList': state => state.global.preferenceList,
        // })
    },
    data() {

        return {
            show: false,
            // 查询条件
            searchData: Object.assign({}, searchData),
            // 查询组件 start
            searchForm:[
                {type:'Input',label:'姓名',prop:'username.like',width:'180px',placeholder:'请输入姓名'},
                {type:'Input',label:'真实姓名',prop:'realname.like',width:'180px',placeholder:'请输入真实姓名'},
                {type:'Input',label:'手机号',prop:'mobile.like',width:'180px',placeholder:'请输入手机号'},
                {type:'Input',label:'邮箱',prop:'email.like',width:'180px',placeholder:'请输入邮箱'},
                {type:'Select',label:'状态',prop:'status',width:'180px',placeholder:'请选择状态', options: [{label: '启用', value: 0}, {label: '停用', value: 1}], change: () => ''},
            ],
            searchHandle:[
                {label:'查询',type:'primary',handle:()=>this.searchHandleForm()},
                {label:'重置',type:'primary',handle:()=>this.resetForm()},
            ],
            // 查询组件 end
            
            tableLoading: false,
            // 表格数据
            tableData:[],
            // 表格header
            tableCols:[
                {label:'姓名ID',prop:'userid'},
                {label:'姓名',prop:'username'},
                {label:'真实姓名',prop:'realname'},
                {label:'手机号',prop:'mobile'},
                {label:'邮箱',prop:'email'},
                {label:'状态',prop:'status', formatter: (row) => this.formatterStatus(row)},
            ],
            // 操作表格按钮
            tableHandles:[
                // {label:'新增',type:'primary',handle:row=>this.addDatas()}
            ],
            // 翻页
            pagination:{
                limit: 10,
                offset: 1,
                total: 0
            },

            // 新增编辑数据弹窗
            dialogDatas: {
                title: '新增', // 新增或编辑
            },
            that: this,

            // 需要新增编辑的组件
            editForm: [
                // {label:'姓名ID',prop:'userid', type:'input', disabled: () => {return true}},
                {label:'姓名',prop:'username', type:'input'},
                {label:'密码',prop:'passwordmd5', type:'input', password: true, disabled: () => {
                    if (this.dialogDatas.title == 'isEdit') {
                        return true
                    }
                }},
                {label:'真实姓名',prop:'realname', type:'input'},
                {label:'手机号',prop:'mobile', type:'input'},
                {label:'邮箱',prop:'email', type:'input'},
                {label:'状态',prop:'status', type:'select', options: [{label: '启用', value: 0}, {label: '停用', value: 1}]},
            ],
            // 编辑表单的数据
            editData: Object.assign({}, {}, editformData ),
            // 表单验证
            editRules: {
                username: [{requied: true, message: '请输入姓名', trigger: 'blur'}]
            },

        }
    },
    mounted () {
        this.quertTableDatasCount()
        this.queryTableDatas()
    },
    methods: {
        quertTableDatasCount() {
            deleteNullProperties(this.searchData)
            return this.$api.query('user', {select: ['count(1) as count'], where: buildWhere(this.searchData)}).then(res => {
                this.pagination.total = parseInt(res.data[0].count)
                return res
            })
        },
        queryTableDatas(params = {}) {
            this.tableLoading = true
            deleteNullProperties(this.searchData)
            params.offset = (this.pagination.offset - 1) * this.pagination.limit
            params.limit = this.pagination.limit
            params.where = buildWhere(this.searchData)
            return this.$api.query('user', params).then(res => {
                this.tableLoading = false
                this.tableData = res.data
                return res
            })
        },
        // 新增或编辑的弹出dialog
        dialogShow() {
            this.show = false
        },
        // 新增表格数据
        addDatas() {
            this.show = true
            this.dialogDatas.title = '新增'
            this.editData = Object.assign({}, {}, editformData )
        },
        // 表格数据编辑按钮
        edit(row) {
            this.show = true
            let editRow = JSON.parse(JSON.stringify(row))
            this.dialogDatas.title = 'isEdit'
            this.editData = editRow

            // 用户密码
            // this.editData = this.passwordmd5
        },
        formatterStatus(row) {
            if (row.status == 0) {
                return '启用'
            } else {
                return '停用'
            }
        },
        // 表格数据删除按钮
        del(row) {
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$api.delete('user', {userid: row.userid}).then((res) => {
                    if (res.code == 0) {
                        this.quertTableDatasCount().then(() => {
                            if (this.pagination.total==(this.pagination.offset-1)*this.pagination.limit&& this.pagination.total!=0) {
                                this.pagination.offset -= 1
                            }
                            this.queryTableDatas()
                        })
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                    }
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            });
        },
        // 点击查询按钮
        searchHandleForm() {
            // 遍历this.searchData ,如果值为空，则删除对应的键值对
            this.quertTableDatasCount().then((res) => {
                this.pagination.offset = 1
                this.queryTableDatas()
            })
        },
        // 表格翻页
        refresh() {
            this.queryTableDatas()
        },
        // 重置查询数据
        resetForm() {
            this.searchData = Object.assign({},searchData)
        },
        // 编辑或添加提交
        async submitForm() {
            // 判断是添加还是编辑
            let res;
            if (this.dialogDatas.title == 'isEdit') {
                res = await this.$api.update('user', this.editData)
            } else {
                this.editData.passwordmd5 = this.$md5(this.editData.passwordmd5)
                res = await this.$api.add('user', this.editData)
                this.quertTableDatasCount()
            }
            if (res.code == 0) {
                this.queryTableDatas()
                this.$message({
                    message: '提交成功',
                    type: 'success'
                })
                this.show = false
            }
        },
    }
}
</script>