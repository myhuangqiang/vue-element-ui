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


let editformData =  {}
let searchData = {}

export default {
    components: {
        SearchForm,
        xyTable,
        xyModal,
        xyEdit
    },
    data() {

        return {
            show: false,
            // 查询条件
            searchData: Object.assign({}, searchData),
            // 查询组件 start
            searchForm:[
                {type:'Input',label:'产品名称',prop:'productname.like',width:'150px',placeholder:'请输入产品名称'},
                {type:'Input',label:'渠道',prop:'channelvar.like',width:'150px',placeholder:'请输入渠道'},
                {type:'Input',label:'子渠道',prop:'subchannelvar.like',width:'150px',placeholder:'请选择', change: () => '' },
                {type:'Select',label:'状态',prop:'status',width:'150px',placeholder:'请选择', options: [{label:'正常',value:'1'},{label:'停用',value:'2'}], change: () => ''},
            ],
            searchHandle:[
                {label:'查询',type:'primary',handle:()=>this.searchHandleForm()},
                {label:'重置',type:'primary',handle:()=>this.resetForm()},
                {label:'导出excel',type:'primary',isLoading: false,handle:(item)=>this.exportExcel(item)}
            ],
            // 查询组件 end

            // 表格数据
            tableLoading: false,
            tableData:[],
            // 表格header
            tableCols:[
                {label:'产品ID',prop:'productid'},
                {label:'产品名称',prop:'productname'},
                {label:'渠道',prop:'channelvar'},
                {label:'子渠道', prop: 'subchannelvar'},
                {label:'网关',prop:'gateway'},
                {label:'备注',prop:'remark'},
                {label:'状态',prop:'status', formatter: (row) => this.formatterStatus(row)},
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

            // 需要新增编辑的组件
            editForm: [
                {label:'产品ID',prop:'productid', type:'input', disabled: () => {return true}},
                {label:'产品名称',prop:'productname', type:'input'},
                {label:'渠道',prop:'channelvar', type:'input'},
                {label:'子渠道',prop:'subchannelvar', type:'input'},
                {label:'网关',prop:'gateway', type:'input'},
                {label:'备注',prop:'remark', type:'textarea'},
                {label:'状态',prop:'status', type:'select', options: [{label: '正常', value: 1}, {label: '停用', value: 2}]},
            ],
            // 编辑表单的数据
            editData: Object.assign({}, {}, editformData ),
            // 表单验证
            editRules: {
                productname: [{requied: true, message: '请输入产品名称', trigger: 'blur'}]
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
            return this.$api.query('product', {select: ['count(1) as count'], where: buildWhere(this.searchData)}).then(res => {
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
            return this.$api.query('product', params).then(res => {
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
            // 添加不需要商户id
            // this.editForm.shift()
        },
        // 表格数据编辑按钮
        edit(row) {
            this.show = true
            let editRow = JSON.parse(JSON.stringify(row))
            this.dialogDatas.title = 'isEdit'
            this.editData = editRow
        },
        formatterStatus(row) {
            if (row.status == 1) {
                return '正常'
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
                this.$api.delete('product', {productid: row.productid}).then((res) => {
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
                res = await this.$api.update('product', this.editData)
            } else {
                res = await this.$api.add('product', this.editData)
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
        // 导出文件（请求去除翻页）
        exportTableDatas(params = {}) {
            params.where = buildWhere(this.searchData)
            return this.$api.exportCsv('product', params)
        },
        // 导出数据成excel
        exportExcel(item) {
            item.isLoading = true
            let list = []
            this.exportTableDatas().then(res => {
                if (res.code == 0) {
                    list = res.data
                } else {
                    item.isLoading = false
                }
            }).then(() => {
                import('@/vendor/Export2Excel').then(excel => {
                    const tHeader = ['产品ID', '产品名称', '渠道', '子渠道', '网关', '备注', '状态']
                    const filterVal = ['productid', 'productname', 'channelvar', 'subchannelvar', 'gateway', 'remark', 'status']
    
                    const data = this.formatJson(filterVal, list)
                    excel.export_json_to_excel({
                        header: tHeader,
                        data,
                        filename: '产品'
                    })
                })
                item.isLoading = false
            })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => {
                if (j === 'timestamp') {
                return parseTime(v[j])
                } else {
                return v[j]
                }
            }))
        },
    }
}
</script>