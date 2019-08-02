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
            :pagination='pagination'
            @refresh="refresh"
        >
        </xy-table>

    </div>
</template>

<script>
import SearchForm from '@/components/common/Form/searchForm'
import xyTable from '@/components/common/Table/xyTable'

import { deleteNullProperties, buildWhere } from '@/utils/validate'

import { mapState } from 'vuex'

let searchData = {}

export default {
    components: {
        SearchForm,
        xyTable
    },
    data() {
        return {
            show: false,
            // 查询条件
            searchData: Object.assign({}, searchData),
            // 查询组件 start
            searchForm:[
                {type:'Select',label:'商户',prop:'merchantid',width:'180px',placeholder:'请选择', options: [], change: () => ''},
                {type:'Select',label:'计划',prop:'planid',width:'180px',placeholder:'请选择', options: [], change: () => ''},
                {type:'Input',label:'关键字ID',prop:'keywordid',width:'180px',placeholder:'请输入关键字'},
                {type:'Date',label:'开始日期',prop:'day.gte',width:'180px',placeholder:'请选择开始日期'},
                {type:'Date',label:'结束日期',prop:'day.lte',width:'180px',placeholder:'请选择结束日期'},
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
                {label:'日期',prop:'day'},
                {label:'商户',prop:'merchantid', formatter: (row) => this.formatterOfMerchant(row) },
                {label:'计划',prop:'planid', formatter: (row) => this.formatterOfPlan(row) },
                {label:'关键词ID',prop:'keywordid'},
                {label:'订单数',prop:'totalcount'},
                {label:'付费数',prop:'totalpaidcount'},
                {label:'付费金额',prop:'totalpaidamount'},
                {label:'劫持订单数', prop: 'hijackcount'},
                {label:'劫持付费数',prop:'hijackpaidcount'},
                {label:'劫持付费金额',prop:'hijackpaidamount'},
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
        }
    },
    computed: {
        ...mapState({
            merchantList: state => state.global.merchantList,
            planList: state => state.global.planList
        })
    },
    async created() {
        await this.$store.dispatch('global/getMerchantList', {select: ['merchantid', 'merchantname']})
        this.searchForm[0].options = this.merchantList
        await this.$store.dispatch('global/getPlanList', {select: ['planid', 'planname']})
        this.searchForm[1].options = this.planList
        this.quertTableDatasCount()
        this.queryTableDatas()
    },
    mounted () {
    },
    methods: {
        quertTableDatasCount() {
            deleteNullProperties(this.searchData)
            return this.$api.query('orderdata-dayagr', {aggregation: 'count', where: buildWhere(this.searchData)}).then(res => {
                this.pagination.total = parseInt(res.data.count)
                return res
            })
        },
        queryTableDatas(params = {}) {
            this.tableLoading = true
            deleteNullProperties(this.searchData)
            params.offset = (this.pagination.offset - 1) * this.pagination.limit
            params.limit = this.pagination.limit
            params.orderBy = 'day desc'
            params.where = buildWhere(this.searchData)
            return this.$api.query('orderdata-dayagr', params).then(res => {
                this.tableLoading = false
                this.tableData = res.data
                return res
            })
        },
        formatterOfMerchant(row) {
            let filterMerchant = this.merchantList.filter(function(product){
                return product.value == row.merchantid
            })
            if (filterMerchant.length) {
                return filterMerchant[0].label
            }
        },
        formatterOfPlan(row) {
            let filterPlan = this.planList.filter(function(product){
                return product.value == row.planid
            })
            if (filterPlan.length) {
                return filterPlan[0].label
            }
        },
        // 点击查询按钮
        searchHandleForm() {
            if (this.searchData['day.gte'] && this.searchData['day.lte']) {
                if (new Date(this.searchData['day.lte']).getTime() < new Date(this.searchData['day.gte']).getTime()) {
                    this.$message.error('开始日期不能大于结束日期')
                    return false;
                }
            }
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
        // 导出文件（请求去除翻页）
        exportTableDatas(params = {}) {
            params.where = buildWhere(this.searchData)
            return this.$api.exportCsv('orderdata-dayagr', params)
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
                    const tHeader = ['日期', '商户', '计划', '关键词ID', '订单数', '付费数', '付费金额', '劫持订单数', '劫持付费数', '劫持付费金额']
                    const filterVal = ['day', 'merchantid', 'planid', 'keywordid', 'totalcount', 'totalpaidcount', 'totalpaidamount', 'hijackcount', 'hijackpaidcount', 'hijackpaidamount']
                    list.forEach((item) => {
                        this.merchantList.forEach((el) => {
                            if (item.merchantid == el.value) {
                                item.merchantid = el.label
                            }
                        })
                        this.planList.forEach((el) => {
                            if (item.planid == el.value) {
                                item.planid = el.label
                            }
                        })
                    })
                    const data = this.formatJson(filterVal, list)
                    excel.export_json_to_excel({
                        header: tHeader,
                        data,
                        filename: '每日汇总'
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