<template>
    <div id="preference">
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
        <preference-model :editData="editData" :show.sync="show" :dialogDatas="dialogDatas" @updateShow="dialogShow" @submitForm="submitForm"></preference-model>
    </div>
</template>

<script>
import SearchForm from '@/components/common/Form/searchForm'
import xyTable from '@/components/common/Table/xyTable'
import preferenceModel from './components/preferenceModel'
import xyEdit from '@/components/common/Form/addOrEditForm'

import { deleteNullProperties, buildWhere } from '@/utils/validate'

let searchData = {}

export default {
    components: {
        SearchForm,
        xyTable,
        preferenceModel,
        xyEdit
    },
    data() {
        return {
            show: false,
            // 查询条件
            searchData: Object.assign({}, searchData),
            // 查询组件 start
            searchForm:[
                {type:'Input',label:'参数名称',prop:'fieldkey.like',width:'180px',placeholder:'请输入参数名称'},
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
                {label:'参数名称',prop:'fieldkey'},
                {label:'参数列表',prop:'fieldvalue', formatter: (row) => {
                    if (!row.fieldvalue) {
                        return ''
                    }
                    return row.fieldvalue.join('，')
                }},
                {label:'备注',prop:'remark'},
                {label:'操作', width: '150px',type:'Button',btnList:[
                    {isShow: (index,row) => true, isDisabled: (index,row) => false, type:'primary',label:'编辑',handle:row=>this.edit(row)},
                    {type:'danger',label:'删除',handle:row=> this.del(row)}
                ]}
            ],
            // 操作表格按钮
            tableHandles:[
                {label:'新增',type:'primary',handle:row=>this.addDatas()}
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
                // width: '500px' // dialog 宽度
            },
            that: this,

            // 编辑的数据
            editData: {},

        }
    },
    methods: {
        quertTableDatasCount() {
            deleteNullProperties(this.searchData)
            return this.$api.query('preference', {select: ['count(1) as count'], where: buildWhere(this.searchData)}).then(res => {
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
            return this.$api.query('preference', params).then(res => {
                this.tableLoading = false
                this.tableData = res.data
                this.$store.commit('global/GET_KEY_LIST', res.data)
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
        },
        // 表格数据编辑按钮
        edit(row) {
            this.show = true
            this.dialogDatas.title = 'isEdit'
            this.editData = row
        },
        // 表格数据删除按钮
        del(row) {
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$api.delete('preference', {preferenceid: row.preferenceid}).then((res) => {
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
        async submitForm(params) {
            // 判断是添加还是编辑
            let res;
            if (this.dialogDatas.title == 'isEdit') {
                res = await this.$api.update('preference', params)
            } else {
                res = await this.$api.add('preference', params)
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
    },
    created() {
        
    },
    mounted() {
        this.quertTableDatasCount()
        this.queryTableDatas()
    }
}
</script>