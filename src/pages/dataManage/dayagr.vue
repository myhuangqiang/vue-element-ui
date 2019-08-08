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
            :isTotal="true"
            :isPagination='true'
            :isHandle='true'
            :loading="tableLoading"
            :tableData='tableData' 
            :tableCols='tableCols' 
            :totalCols='totalCols'
            :totalDatas="totalDatas"
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
    'day.gte': new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1)
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
                {type:'Select',label:'计划',prop:'_planid',width:'140px',placeholder:'请选择', options: [], change: () => ''},
                {type:'Select',label:'产品',prop:'_productid',width:'140px',placeholder:'请选择', options: [], change: () => ''},
                {type:'Input',label:'关键字ID',prop:'_keywordid',width:'150px',placeholder:'请输入关键字ID'},
                {type:'Date',label:'开始日期',prop:'day.gte', width:'160px',placeholder:'请选择开始日期'},
                {type:'Date',label:'结束日期',prop:'day.lte',width:'160px',placeholder:'请选择结束日期'},
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
                {label:'商户',prop:'_merchantid', formatter: (row) => this.formatterOfMerchant(row) },
                {label:'计划',prop:'_planid', formatter: (row) => this.formatterOfPlan(row) },
                {label:'产品',prop:'_productid', formatter: (row) => this.formatterOfProduct(row) },
                {label:'关键词ID',prop:'_keywordid'},
                {label:'订单数',prop:'totalcount'},
                {label:'付费数',prop:'totalpaidcount'},
                {label:'付费金额',prop:'totalpaidamount'},
                {label:'劫持订单数', prop: 'hijackcount'},
                {label:'劫持付费数',prop:'hijackpaidcount'},
                {label:'劫持付费金额',prop:'hijackpaidamount'},
            ],
            // 统计数据
            totalCols: [
                {label: '订单数：', prop: 'totalcount'},
                {label: '付费数：', prop: 'totalpaidcount'},
                {label: '付费金额：', prop: 'totalpaidamount'},
                {label: '劫持订单数：', prop: 'hijackcount'},
                {label: '劫持付费数：', prop: 'hijackpaidcount'},
                {label: '劫持付费金额：', prop: 'hijackpaidamount'},
            ],
            totalDatas:{},
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
            planList: state => state.global.planList,
            productList: state => state.global.productList
        })
    },
    async created() {
        let p1 = this.$store.dispatch('global/getMerchantList', {select: ['merchantid', 'merchantname']})
        let p2 = this.$store.dispatch('global/getPlanList', {select: ['planid', 'planname']})
        let p3 = this.$store.dispatch('global/getProductList',{select: ['productid', 'productname']})
        let res = await Promise.all([p1, p2, p3])
        this.searchForm[0].options = this.merchantList
        this.searchForm[1].options = this.planList
        this.searchForm[2].options = this.productList
        this.quertTableDatasCount()
        this.queryTableDatas()
    },
    mounted () {
    },
    methods: {
        quertTableDatasCount() {
            deleteNullProperties(this.searchData)
            return this.$api.query('orderdata-dayagr', {select: ['count(1) as count', 'sum(totalcount) as totalcount', 'sum(totalpaidcount) as totalpaidcount', 'sum(totalpaidamount) as totalpaidamount','sum(hijackcount) as hijackcount', 'sum(hijackpaidcount) as hijackpaidcount', 'sum(hijackpaidamount) as hijackpaidamount'], where: buildWhere(this.searchData)}).then(res => {
                this.pagination.total = parseInt(res.data[0].count)
                this.totalDatas = res.data[0]
                return res
            })
        },
        queryTableDatas(params = {}) {
            this.tableLoading = true
            deleteNullProperties(this.searchData)
            params.offset = (this.pagination.offset - 1) * this.pagination.limit
            params.limit = this.pagination.limit
            params.orderBy = 'id desc'
            params.where = buildWhere(this.searchData)
            return this.$api.query('orderdata-dayagr', params).then(res => {
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
        formatterOfPlan(row) {
            let filterPlan = this.planList.filter(function(product){
                return product.value == row._planid
            })
            if (filterPlan.length) {
                return filterPlan[0].label
            }
        },
        formatterOfProduct(row) {
            let filterProduct = this.productList.filter(function(product){
                return product.value == row._productid
            })
            if (filterProduct.length) {
                return filterProduct[0].label
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
                    const tHeader = ['日期', '商户', '计划', ' 产品', '关键词ID', '订单数', '付费数', '付费金额', '劫持订单数', '劫持付费数', '劫持付费金额']
                    const filterVal = ['day', '_merchantid', '_planid', '_productid', '_keywordid', 'totalcount', 'totalpaidcount', 'totalpaidamount', 'hijackcount', 'hijackpaidcount', 'hijackpaidamount']
                    list.forEach((item) => {
                        this.merchantList.forEach((el) => {
                            if (item._merchantid == el.value) {
                                item._merchantid = el.label
                            }
                        })
                        this.planList.forEach((el) => {
                            if (item._planid == el.value) {
                                item._planid = el.label
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