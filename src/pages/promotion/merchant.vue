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
            size='mini'
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

let editformData =  {}
let searchData = {}

export default {
    components: {
        SearchForm,
        xyTable,
        xyModal,
        xyEdit
    },
    computed: {
        ...mapState({
            'preferenceList': state => state.global.preferenceList,
        })
    },
    data() {

        return {
            show: false,
            // 查询条件
            searchData: Object.assign({}, searchData),
            // 查询组件 start
            searchForm:[
                {type:'Input',label:'商户名称',prop:'merchantname.like',width:'180px',placeholder:'请输入商户名称'},
                {type:'Input',label:'主体',prop:'mainbody.like',width:'180px',placeholder:'请输入主体'},
                {type:'Select',label:'平台',prop:'platform',width:'180px',placeholder:'请选择平台', options: [], change: () => '' },
                {type:'Select',label:'托管云',prop:'cloudon',width:'180px',placeholder:'请选择托管云', options: [], change: () => '' },
                {type:'Select',label:'状态',prop:'status',width:'180px',placeholder:'请选择状态', options: [{label:'正常',value:'1'},{label:'停用',value:'2'}], change: () => ''},
            ],
            searchHandle:[
                {label:'查询',type:'primary',handle:()=>this.searchHandleForm()},
                {label:'重置',type:'primary',handle:()=>this.resetForm()},
                {label:'导出excel',type:'primary',isLoading: false,handle:(item)=>this.exportExcel(item)}
            ],
            // 查询组件 end

            tableLoading: false,
            // 表格数据
            tableData:[],
            // 表格header
            tableCols:[
                {label:'商户ID',prop:'merchantid'},
                {label:'商户名称',prop:'merchantname'},
                {label:'主体',prop:'mainbody'},
                {label:'返点',prop:'rebate'},
                {label:'平台',prop:'platform'},
                {label:'托管云',prop:'cloudon'},
                {label:'域名',prop:'domain', width: '120px'},
                {label:'协议',prop:'schema'},
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
                {label:'商户ID',prop:'merchantid', type:'input', disabled: () => {return true}},
                {label:'商户名称',prop:'merchantname', type:'input'},
                {label:'主体',prop:'mainbody', type:'input'},
                {label:'返点',prop:'rebate', type:'input'},
                {label:'平台',prop:'platform', type:'select', options: []},
                {label:'托管云',prop:'cloudon', type:'select', options: []},
                {label:'域名',prop:'domain', type:'input'},
                {label:'协议',prop:'schema', type:'input'},
                {label:'备注',prop:'remark', type:'textarea'},
                {label:'状态',prop:'status', type:'select', options: [{label: '正常', value: 1}, {label: '停用', value: 2}]},
                {label:'联系方式1',prop:'contact1', type:'input'},
                {label:'联系方式2',prop:'contact2', type:'input'},
                {label:'账号',prop:'admin', type:'input'},
                {label:'密码',prop:'adminpwd', type:'input'},
            ],
            // 编辑表单的数据
            editData: Object.assign({}, {}, editformData ),
            // 表单验证
            editRules: {
                merchantname: [{requied: true, message: '请输入商户名称', trigger: 'blur'}]
            },
        }
    },
    created() {
        // 获取平台以及托管云列表
        this.$store.dispatch('global/getPreferenceList').then(() => {
            let platformInPreferenceList = this.preferenceList.filter((item) => {
                return item.key == 'platform'
            })
            let cloudonInPreferenceList = this.preferenceList.filter((item) => {
                return item.key == 'cloudon'
            })
            this.getSelectDatas(this.searchForm, platformInPreferenceList, 'platform')
            this.getSelectDatas(this.editForm, platformInPreferenceList, 'platform')
            this.getSelectDatas(this.searchForm, cloudonInPreferenceList, 'cloudon')
            this.getSelectDatas(this.editForm, cloudonInPreferenceList, 'cloudon')
        })
    },
    mounted () {
        this.quertTableDatasCount()
        this.queryTableDatas()
    },
    methods: {
        quertTableDatasCount() {
            // 遍历this.searchData ,如果值为空，则删除对应的键值对
            deleteNullProperties(this.searchData)
            return this.$api.query('merchant', {aggregation: 'count', where: buildWhere(this.searchData)}).then(res => {
                this.pagination.total = parseInt(res.data.count)
                return res
            })
        },
        queryTableDatas(params = {}) {
            this.tableLoading = true
            deleteNullProperties(this.searchData)
            params.offset = (this.pagination.offset - 1) * this.pagination.limit
            params.limit = this.pagination.limit
            // params.orderBy = 'addtime'
            params.where = buildWhere(this.searchData)
            return this.$api.query('merchant', params).then(res => {
                this.tableLoading = false
                this.tableData = res.data
                return res
            })
        },
        
        // 新增或编辑的弹出dialog
        dialogShow() {
            this.show = false
        },
        // 遍历select中的数据
        getSelectDatas(data,list,prop) {
            data.forEach((item) => {
                if (item.prop == prop) {
                    let platformList = list[0].value
                    platformList.forEach((el) => {
                        item.options.push({label: el,value: el})
                    })
                    return false
                }
            })
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
                this.$api.delete('merchant', {merchantid: row.merchantid}).then((res) => {
                    if (res.code == 0) {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                        this.quertTableDatasCount().then((res) => {
                            if (this.pagination.total==(this.pagination.offset-1)*this.pagination.limit&& this.pagination.total!=0) {
                                this.pagination.offset -= 1
                            }
                            this.queryTableDatas()
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
                res = await this.$api.update('merchant', this.editData)
                
            } else {
                res = await this.$api.add('merchant', this.editData)
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
            return this.$api.exportCsv('merchant', params)
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
                    const tHeader = ['商户ID', '商户名称', '主体', '返点', '平台', '托管云', '域名', '协议', '状态']
                    const filterVal = ['merchantid', 'merchantname', 'mainbody', 'rebate', 'platform', 'cloudon', 'domain', 'schema', 'status']
    
                    const data = this.formatJson(filterVal, list)
                    excel.export_json_to_excel({
                        header: tHeader,
                        data,
                        filename: '商户'
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