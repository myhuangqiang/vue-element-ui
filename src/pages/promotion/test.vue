<template>
    <div>
        <search-form 
            size='medium'
            labelWidth = '60px' 
            :searchData = "searchData"
            :searchForm = "searchForm"
            :searchHandle="searchHandle"
            ref="searchFormWrap"
        >
        </search-form>

        <xy-table 
            size='mini'
            :isSelection='false'
            :isIndex='true'
            :isPagination='true'
            :isHandle='true'
            :tableData='tableData' 
            :tableCols='tableCols' 
            :tableHandles='tableHandles'
            :pagination='pagination'
            @refresh="refresh"
            @select="select"
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

let sexs=[{label:'男',value:'M'},{label:'女',value:'F'}]
let sexProps={label:'label',value:'value'}
let intersts=[{label:'羽毛球',value:'badminton'},{label:'篮球',value:'basketball'},{label:'足球',value:'football'},{label:'兵乓球',value:'pong'}]
let interstProps={label:'label',value:'value'}

let editformData =  {
    name: null,
    age: null,
    sex: null,
    interst: []
}
let searchData = {
    name:null,
    age:null,
    sex:null,
    date: '',
    interst: []
}

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
            searchData: Object.assign({}, {}, searchData ),
            // 查询组件 start
            searchForm:[
                {type:'Input',label:'姓名：',prop:'name',width:'180px',placeholder:'请输入姓名'},
                {type:'Input',label:'年龄',prop:'age',width:'180px',placeholder:'请输入年龄'},
                {type:'Date',label:'日期',prop:'date',width:'180px',placeholder:'请选择日期'},
                {type:'Select',label:'性别',prop:'sex',width:'120px',options:sexs,props:sexProps,change:row=>'',placeholder:'请选择性别'},
                {type:'Checkbox',label:'爱好',prop:'interst',checkboxs:intersts,props:interstProps}
            ],
            searchHandle:[
                {label:'查询',type:'primary',handle:()=>this.searchHandleForm()},
                {label:'重置',type:'primary',handle:()=>this.resetForm()},
                {label:'导出excel',type:'primary',isLoading: false,handle:(item)=>this.exportExcel(item)}
            ],
            // 查询组件 end

            // 表格数据
            tableData:[
                {name:'张三',age:'12',sex:'M',interst:['basketball','football']},
                {name:'筱华',age:'27',sex:'F',interst:['badminton']},
                {name:'张三',age:'12',sex:'M',interst:['basketball']},
                {name:'筱华',age:'27',sex:'F',interst:['football']},
                {name:'筱华',age:'27',sex:'F',interst:['badminton']},
                {name:'筱华',age:'27',sex:'F',interst:['pong','badminton']},
                {name:'筱华',age:'27',sex:'F',interst:['badminton']}
            ],
            // 表格header
            tableCols:[
                {label:'姓名',prop:'name'},
                {label:'年龄',prop:'age'},
                {label:'性别',prop:'sex',formatter: (row) => {
                        if (row.sex == 'M') {
                            return '男'
                        } else if (row.sex == 'F') {
                            return '女'
                        }
                    }
                },
                {label:'爱好',prop:'interst', isMultiple: true,formatter: (row) => {
                        let arr  = []
                        row.interst.forEach((item, index) => {
                            if (item == 'basketball') {
                                arr.push('篮球')
                            } else if (item == 'football') {
                                arr.push('足球')
                            } else if (item == 'badminton') {
                                arr.push('羽毛球')
                            } else if (item == 'pong') {
                                arr.push('兵乓球')
                            }
                        })
                        return arr
                    }
                },
                {label:'操作1',type:'Input', prop: 'sex',focus: () => console.log('focus'),isDisabled: (row) => this.disabledInput(row)},
                {label:'操作',type:'Button',btnList:[
                    {isShow: (index,row) => this.showEdit(index,row),isDisabled: (index,row) => this.disabledBtn(index,row), type:'primary',label:'编辑',handle:row=>this.edit(row)},
                    {type:'danger',label:'删除',handle:row=> this.del(row)}
                ]}
            ],
            // 操作表格按钮
            tableHandles:[
                {label:'新增',type:'primary',handle:row=>this.addDatas()}
            ],
            // 翻页
            pagination:{
                pageSize:5,
                pageNum:1,
                total:7
            },

            // 新增编辑数据弹窗
            dialogDatas: {
                title: '新增', // 新增或编辑
                width: '500px' // dialog 宽度
            },
            that: this,

            // 需要新增编辑的组件
            editForm: [
                {label: '姓名', prop: 'name', type: 'input', width: '280px', change: data=> console.log(data)},
                {label: '年龄', prop: 'age', type: 'input', width: '280px'},
                {label: '性别', prop: 'sex', type: 'radio', radios: sexs, width: '280px'},
                {label: '爱好', prop: 'interst', type: 'checkbox', checkboxs: intersts, width: '280px'},
            ],
            // 编辑表单的数据
            editData: Object.assign({}, {}, editformData ),
            // 表单验证
            editRules: {
                name: [{requied: true, message: '请输入姓名', trigger: 'blur'}]
            }
        }
    },
    mounted () {
    },
    methods: {
        // 表格中button条件限制（是否显示）
        showEdit(index,row) {
            return true
        },
        // 表格中button条件限制（禁用）
        disabledBtn(index,row) {
            if (index == 0) {
                return true
            }
        },
        // 表格中input条件限制（禁用）
        disabledInput(row) {
            if (row.name == "筱华") {
                return true
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
            this.editData = Object.assign({}, {}, editformData )
            console.log(this.editData)
        },
        // 表格数据编辑按钮
        edit(row) {
            this.show = true
            let editRow = JSON.parse(JSON.stringify(row))
            this.dialogDatas.title = '编辑'
            this.editData = editRow
        },
        // 表格数据删除按钮
        del(row) {
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            });
        },
        // 点击查询按钮
        searchHandleForm() {
            console.log(this.searchData)
        },
        // 表格翻页
        refresh() {
            console.log(this.pagination.pageSize, this.pagination.pageNum)
            console.log('翻页')
        },
        // 选择table的一行触发
        select(rows, row) {
            console.log(rows, row)
        },
        // 重置查询数据
        resetForm() {
            this.searchData = Object.assign({}, {}, searchData)
        },
        // 编辑或添加提交
        submitForm() {
            this.$message({
                message: '提交成功',
                type: 'success'
            })
            this.show = false
        },

        // 导出数据成excel
        exportExcel(item) {
            item.isLoading = true
            import('@/vendor/Export2Excel').then(excel => {
                const tHeader = ['姓名', '年龄', '性别', '爱好']
                const filterVal = ['name', 'age', 'sex', 'interst']
                
                const list = JSON.parse(JSON.stringify(this.tableData))
                list.forEach((item) => {
                    if (item.sex == 'M') {
                        item.sex = '男'
                    } else {
                        item.sex = '女'
                    }
                    let itemArr = []
                    item.interst.forEach((el) => {
                        if (el == 'basketball') {
                            itemArr.push('篮球')
                        } else if (el == 'football') {
                            itemArr.push('足球')
                        } else if (el == 'badminton') {
                            itemArr.push('羽毛球')
                        } else if (el == 'pong') {
                            itemArr.push('兵乓球')
                        }
                    })
                    item.interst = itemArr
                })
                const data = this.formatJson(filterVal, list)
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: 'table',
                    // autoWidth: this.autoWidth,
                    // bookType: this.bookType
                })
            })
            item.isLoading = false
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