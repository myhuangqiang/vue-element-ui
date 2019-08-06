<template>
    <div>
        <search-form 
            size='medium'
            labelWidth = '70px' 
            :searchData = "searchData"
            :searchForm = "searchForm"
            :searchHandle="searchHandle"
            ref="searchFormWrap"
        >
        </search-form>

        <xy-table 
            size='medium'
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

let searchData = {
    'day.gte': new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
}

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
                {type:'Select',label:'商户',prop:'_merchantid',width:'140px',placeholder:'请选择', options: [], change: () => ''},
                {type:'Date', defaultTime: '00:00:00', label:'开始日期',prop:'day.gte',width:'200px',placeholder:'开始日期时间'},
                {type:'Date',label:'结束日期',prop:'day.lte',width:'200px',placeholder:'结束日期时间'},
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
                // {label:'日期',prop:'daytime', width: '160px'},
                {label:'商户',prop:'_merchantid', formatter: (row) => this.formatterOfMerchant(row) },
                // {label:'计划',prop:'_planid', formatter: (row) => this.formatterOfPlan(row) },
                // {label:'产品',prop:'_productid', formatter: (row) => this.formatterOfProduct(row) },
                // {label:'关键词ID',prop:'_keywordid'},
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
        })
    },
    async created() {
        let p1 = this.$store.dispatch('global/getMerchantList', {select: ['merchantid', 'merchantname']})
        let p2 = this.$store.dispatch('global/getPlanList', {select: ['planid', 'planname']})
        let p3 = this.$store.dispatch('global/getProductList',{select: ['productid', 'productname']})
        let res = await Promise.all([p1, p2, p3])
        this.searchForm[0].options = this.merchantList
        this.quertTableDatasCount()
        this.queryTableDatas()
    },
    mounted () {
    },
    methods: {
        quertTableDatasCount() {
            deleteNullProperties(this.searchData)
            return this.$api.query('orderdata-merchantagr', {select: ['count(1) as count']}).then(res => {
                this.pagination.total = parseInt(res.data.length)
                return res
            })
        },
        queryTableDatas(params = {}) {
            this.tableLoading = true
            deleteNullProperties(this.searchData)
            params.offset = (this.pagination.offset - 1) * this.pagination.limit
            params.limit = this.pagination.limit
            params.where = buildWhere(this.searchData)
            params.select = ["_merchantid", "sum(totalcount) as totalcount","sum(totalpaidcount) as totalpaidcount","sum(totalpaidamount) as totalpaidamount","sum(hijackcount) as hijackcount","sum(hijackpaidcount) as hijackpaidcount","sum(hijackpaidamount) as hijackpaidamount"]
            return this.$api.query('orderdata-merchantagr', params).then(res => {
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
        // 点击查询按钮
        searchHandleForm() {
            if (this.searchData['day.gte'] && this.searchData['day.lte']) {
                if (new Date(this.searchData['day.lte']).getTime() < new Date(this.searchData['day.gte']).getTime()) {
                    this.$message.error('开始日期时间不能大于结束日期时间')
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
            params.select = ["_merchantid", "sum(totalcount) as totalcount","sum(totalpaidcount) as totalpaidcount","sum(totalpaidamount) as totalpaidamount","sum(hijackcount) as hijackcount","sum(hijackpaidcount) as hijackpaidcount","sum(hijackpaidamount) as hijackpaidamount"]
            return this.$api.exportCsv('orderdata-merchantagr', params)
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
                    const tHeader = ['商户', '订单数', '付费数', '付费金额', '劫持订单数', '劫持付费数', '劫持付费金额']
                    const filterVal = ['_merchantid', 'totalcount', 'totalpaidcount', 'totalpaidamount', 'hijackcount', 'hijackpaidcount', 'hijackpaidamount']
                    list.forEach((item) => {
                        this.merchantList.forEach((el) => {
                            if (item._merchantid == el.value) {
                                item._merchantid = el.label
                            }
                        })
                    })
                    const data = this.formatJson(filterVal, list)
                    excel.export_json_to_excel({
                        header: tHeader,
                        data,
                        filename: '商户汇总'
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