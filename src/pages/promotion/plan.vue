<template>
    <div>
        <search-form 
            size='medium'
            labelWidth = '100px' 
            :searchData = "searchData"
            :searchForm = "searchForm"
            :searchHandle="searchHandle"
            ref="searchFormWrap"
        >
        </search-form>

        <xy-table 
            :isSelection='false'
            :isPagination='true'
            :loading="tableLoading"
            :isHandle='true'
            :tableData='tableData' 
            :tableCols='tableCols' 
            :tableHandles='tableHandles'
            :pagination='pagination'
            @refresh="refresh"
        >
        </xy-table>


        <!-- 弹窗 -->
        <xy-modal ref="modal" :show.sync="show" :dialogDatas="dialogDatas" @updateShow="dialogShow" @submitForm="submitForm">
            <xy-edit v-if="show" ref='xyEdit' :that='that' 
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

import { deleteNullProperties, buildWhere, randomChar } from '@/utils/validate'
import { createUniqueString }  from '@/utils'

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
    data() {
        return {
            show: false,
            // 查询条件
            searchData: Object.assign({}, searchData),
            // 查询组件 start
            searchForm:[
                {type:'Input',label:'计划名称',prop:'planname.like',width:'150px',placeholder:'请输入计划名称'},
                {label:'商户名称',prop:'_merchantid', type:'Select',width:'150px', options: [], change: () => ''},
                {label:'产品名称',prop:'_productid', type:'Select',width:'150px', options: [], change: () => ''},
            ],
            searchHandle:[
                {label:'查询',type:'primary',handle:()=>this.searchHandleForm()},
                {label:'重置',type:'primary',handle:()=>this.resetForm()},
                {label:'导出excel',type:'primary',isLoading: false,handle:(item)=>this.exportExcel(item)}
            ],
            // 查询组件 end

            // table loading
            tableLoading: false,
            // 表格数据
            tableData:[],
            // 表格header
            tableCols:[
                {label:'计划ID',prop:'planid'},
                {label:'计划名称',prop:'planname'},
                {label:'商户名称',prop:'_merchantid', formatter: (row) => this.formatterOfMerchant(row) },
                {label:'产品名称',prop:'_productid', formatter: (row) => this.formatterOfProduct(row)},
                {label:'额外参数',prop:'extraparam'},
                {label: '是否劫持', prop: 'hijack', formatter: (row) => {
                    if (row.hijack == 1) {
                        return '是'
                    } else {
                        return '否'
                    }
                }},
                {label:'劫持关键词',prop:'hjkeyword', width: '100px'},
                {label:'导入文件', prop:'material', down: true, formatter: (row) => {
                    // if (row.material) {
                    //     return '/' + row.material
                    // }
                }},
                {label:'导出动作',prop:'outputaction', formatter: (row) =>  this.formatterOfOutputaction(row)},
                {label:'导出文件',prop:'output', down: true},
                {label:'备注',prop:'remark'},
                {label:'操作', width: '220px',type:'Button',btnList:[
                    {type:'primary',label:'编辑',isShow: (index,row) => true, isDisabled: (index,row) => false,handle:row=>this.edit(row)},
                    {type:'danger',label:'删除',handle:row=> this.del(row)},
                    {type:'primary',label:'生成',handle:(row,index)=> this.produceDownloadFile(row, index)}
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
                width: '800px' // dialog 宽度
            },
            that: this,

            // 需要新增编辑的组件
            editForm: [
                {label:'计划ID',prop:'planid', type:'input', disabled: () => {return true}},
                {label:'计划名称',prop:'planname', type:'input'},
                {label:'商户名称',prop:'_merchantid', type:'select', options: []},
                {label:'产品名称',prop:'_productid', type:'select', options: []},
                {label:'额外参数',prop:'extraparam', type:'input'},
                {label:'是否劫持',prop:'hijack', type:'select', options: [{label: '否', value: 0}, {label: '是', value: 1}]},
                {label:'劫持目标',prop:'hjtarget', type:'input'},
                {label:'劫持关键词',prop:'hjkeyword', type:'input'},
                {label:'计划关键字', prop: 'material', type:'upload'},
                {label:'导出动作', prop: 'outputaction', type:'select', slot: true, options: []},
                {label:'备注',prop:'remark', type:'textarea'},
            ],
            // 编辑表单的数据
            editData: Object.assign({}, {}, editformData),
            // 表单验证
            editRules: {
                planname: [{requied: true, message: '计划名称', trigger: 'blur'}]
            },

        }
    },
    computed: {
        ...mapState({
            merchantList: state => state.global.merchantList,
            productList: state => state.global.productList,
            preferenceList: state => state.global.preferenceList
        })
    },
    async created() {
        let p1 = this.$store.dispatch('global/getMerchantList', {select: ['merchantid', 'merchantname']})
        let p2 = this.$store.dispatch('global/getProductList', {select: ['productid', 'productname']})
        let p3 = this.$store.dispatch('global/getPreferenceList', {where: ['IN', 'fieldkey', ["outputaction"]]}).then(() => {
            let planactionInPreferenceList = this.preferenceList.filter((item) => {
                return item.fieldkey == 'outputaction'
            })
            this.getSelectDatas(this.editForm, planactionInPreferenceList, 'outputaction')
        })
        let res = await Promise.all([p1, p2, p3])
        this.searchForm[1].options = this.merchantList
        this.searchForm[2].options = this.productList
        this.quertTableDatasCount()
        this.queryTableDatas()
        
    },
    mounted () {
    },
    methods: {
        quertTableDatasCount() {
            deleteNullProperties(this.searchData)
            return this.$api.query('plan', {select: ['count(1) as count'], where: buildWhere(this.searchData)}).then(res => {
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
            return this.$api.query('plan', params).then(res => {
                this.tableLoading = false
                this.tableData = res.data
                return res
            })
        },
        formatterOfMerchant(row) {
            let filterMerchant = this.merchantList.filter(function(product){
                return product.value == row._merchantid
            })
            if (filterMerchant.length) {
                return filterMerchant[0].label
            }
        },
        formatterOfProduct(row) {
            let filterProduct= this.productList.filter(function(product){
                return product.value == row._productid
            })
            if (filterProduct.length) {
                return filterProduct[0].label
            }
        },
        formatterOfOutputaction(row) {
            let filteroutputaction= this.editForm[9].options.filter(function(product){
                return product.value == row.outputaction
            })
            if (filteroutputaction.length) {
                return filteroutputaction[0].label
            }
        },
        // 新增或编辑的弹出dialog
        dialogShow() {
            this.show = false
        },
        // 新增表格数据
        addDatas() {
            this.show = true
            this.dialogDatas.title = '新增'
            this.editForm[2].options = this.merchantList
            this.editForm[3].options = this.productList
            this.editData = Object.assign({}, {}, editformData)
        },
        // 表格数据编辑按钮
        edit(row) {
            this.show = true
            let editRow = JSON.parse(JSON.stringify(row))
            this.dialogDatas.title = 'isEdit'
            this.editForm[2].options = this.merchantList
            this.editForm[3].options = this.productList
            this.editData = editRow
        },
         // 遍历select中的数据
        getSelectDatas(data,list,prop) {
            data.forEach((item) => {
                if (item.prop == prop) {
                    let platformList = list[0].fieldvalue
                    platformList.forEach((el) => {
                        try {
                            let newItem = JSON.parse(el)
                            Object.keys(newItem).forEach((keyItem) => {
                                item.options.push({label: keyItem,value: newItem[keyItem]})
                            }) 
                        }catch(error) {
                            item.options.push({label: el,value: el})
                        }
                    })
                    return false
                }
            })
        },
        // 表格数据删除按钮
        del(row) {
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$api.delete('plan', {planid: row.planid}).then((res) => {
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
        // 生成一个计划
        produceDownloadFile(row, index) {
            // 先将导入文件随机生成一个文件名，不能重名
            let material = row.material
            // let fileFormat = material.substr(material.lastIndexOf("."))
            // let exportFile = `downs/${createUniqueString()}${fileFormat}`
            let exportFile = `downs/${createUniqueString()}.csv`
            let planId = row.planid
            // 创建一个离线任务,传action、exportFile
            this.$api.add('offline-task', {action: row.outputaction, taskname: createUniqueString(), output: exportFile, remark: '自动生成', params: {"planid": row.planid}}).then(res => {
                if (res.code == 0) {
                    // 成功之后将此条计划的output 赋值为exportFile
                    this.tableData[index].output = exportFile
                    this.$message({
                        message: '生成成功！',
                        type: 'success'
                    })
                    this.$api.update('plan', {planid: row.planid, output: exportFile})
                }
            })

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
        addPlan() {
            this.$api.add('plan', this.editData).then((res) => {
                this.quertTableDatasCount()
                if (res.code == 0) {
                    this.queryTableDatas()
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    })
                    this.show = false
                }
            })
        },
        editPlan() {
            this.$api.update('plan', this.editData).then(res => {
                if (res.code == 0) {
                    this.queryTableDatas()
                    this.$message({
                        message: '编辑成功',
                        type: 'success'
                    })
                    this.show = false
                }
            })
        },
        // 编辑或添加提交
        async submitForm() {
            // 判断是添加还是编辑
            let res;
            if (this.dialogDatas.title == 'isEdit') {
                if (this.$refs.xyEdit.fileList.length && this.$refs.xyEdit.fileList[0].raw) {
                    this.$refs.xyEdit.submitUpload().then((res) => {
                        if (res.code == 0) {
                            this.editData.material  = res.data.saveIn
                            this.editPlan()
                        }
                    })
                } else {
                    this.editPlan()
                }
            } else {
                if (this.$refs.xyEdit.fileList.length) {
                    this.$refs.xyEdit.submitUpload().then((res) => {
                        if (res.code == 0) {
                            this.editData.material  = res.data.saveIn
                        }
                        this.addPlan()
                    })
                } else {
                    this.addPlan()
                }
            }
        },
        // 导出文件（请求去除翻页）
        exportTableDatas(params = {}) {
            params.where = buildWhere(this.searchData)
            return this.$api.exportCsv('plan', params)
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
                    const tHeader = ['计划ID', '计划名称','商户名称', '产品名称', '额外参数', '是否劫持', '劫持关键词', '导入文件', '导出动作', '导出文件', '备注']
                    const filterVal = ['planid', 'planname', '_merchantid', '_productid', 'extraparam', 'hijack', 'hjkeyword', 'material', 'outputaction', 'output', 'remark']
                    list.forEach((item) => {
                        this.merchantList.forEach((el) => {
                            if (item._merchantid == el.value) {
                                item._merchantid = el.label
                            }
                        })
                        this.productList.forEach((el) => {
                            if (item._productid == el.value) {
                                item._productid = el.label
                            }
                        })
                    })
    
                    const data = this.formatJson(filterVal, list)
                    excel.export_json_to_excel({
                        header: tHeader,
                        data,
                        filename: '计划'
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