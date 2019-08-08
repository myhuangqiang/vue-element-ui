<!--表格组件 -->
<template>
<section class="ces-table-page">
  <!-- 表格操作按钮 -->
    <section class="ces-handle" v-if='isHandle'>
      <el-button 
        v-for='(item,index) in tableHandles' 
        :key="index" 
        :size="item.size || 'mini'" 
        :type="item.type" 
        :icon='item.icon' 
        @click="item.handle()">
          {{item.label}}
      </el-button>
    </section>
    <!-- 数据表格 -->
    <section class="ces-table">
      <el-table 
        :data='tableData' 
        :size='size' 
        height="100%" 
        :cell-style="{textAlign: 'center'}"
        :header-cell-style="{textAlign: 'center', color: '#333', background: '#F5F7FA'}"
        :border='isBorder'
        @select='select' 
        @select-all='selectAll'
        @row-click="handleRowClick"
        :defaultSelections="defaultSelections"
        v-loading='loading' 
        ref="cesTable">
          <el-table-column v-if="isSelection" type="selection" align="center" ></el-table-column>
          <el-table-column v-if="isIndex" type="index" :label="indexLabel" align="center" width="50"></el-table-column>
          <!-- 数据栏 -->
          <el-table-column 
            v-for="item in tableCols" 
            :key="item.id"
            :prop="item.prop" 
            :label="item.label" 
            :width="item.width"
            :align="item.align" 
            :render-header="item.require?renderHeader:null"
            >
              <template slot-scope="scope">
                <!-- html -->
                <span v-if="item.type==='Html'" v-html="item.html(scope.row)"></span>
                <!-- 按钮 -->
                <span v-if="item.type==='Button'">
                  <span v-for="(btn, index) in item.btnList" :key="index" style="margin-right: 8px;">
                    <el-button 
                      v-if="!btn.isShow || (btn.isShow && btn.isShow(scope.$index, scope.row))"
                      :disabled="btn.isDisabled && btn.isDisabled(scope.$index, scope.row)"
                      :type="btn.type" 
                      :size="btn.size || 'mini'" 
                      :icon="btn.icon" 
                      @click.stop="btn.handle(scope.row, scope.$index)">{{btn.label}}</el-button>
                  </span>
                  </span>
                <!-- 输入框 :disabled="btn.isDisabled && btn.isDisabled(scope.row)"-->
                <el-input v-if="item.type==='Input'" v-model="scope.row[item.prop]" :size="size" 
                  :disabled="item.isDisabled && item.isDisabled(scope.row)"
                  @click.stop.native="item.focus && item.focus(scope.row)"></el-input>
                <!-- 下拉框 -->
                <el-select v-if="item.type==='Select'" v-model="scope.row[item.prop]" :size="size" :props="item.props"
                  :disabled="item.isDisabled && item.isDisabled(scope.row)" 
                  @change='item.change && item.change(scope.row)'>
                    <el-option v-for="op in item.options" :label="op[item.props.label]" :value="op[item.props.value]" :key="op[item.props.value]"></el-option>
                </el-select>
                <!-- 单选 -->
                <el-radio-group v-if="item.type==='Radio'" v-model="scope.row[item.prop]"
                  :disabled="btn.isDisabled && btn.isDisabled(scope.row)"
                  @change='item.change && item.change(scope.row)'>
                    <el-radio v-for="(ra,index) in item.radios" :key="index" :label="ra.value">{{ra.label}}</el-radio>
                </el-radio-group>
                <!-- 复选框 -->
                <el-checkbox-group v-if="item.type==='Checkbox'" v-model="scope.row[item.prop]" 
                  :disabled="btn.isDisabled && btn.isDisabled(scope.row)"
                  @change='item.change && item.change(scope.row)'>
                    <el-checkbox v-for="(ra,index) in item.checkboxs" :key="index" :label="ra.value">{{ra.label}}</el-checkbox>
                </el-checkbox-group>
                <!-- 评价 -->
                <el-rate v-if="item.type==='Rate'" v-model="scope.row[item.prop]"
                  :disabled="btn.isDisabled && btn.isDisabled(scope.row)"
                  @change='item.change && item.change(scope.row)'></el-rate>
                <!-- 开关 -->
                <el-switch v-if="item.type==='Switch'" v-model="scope.row[item.prop]"
                  :disabled="btn.isDisabled && btn.isDisabled(scope.row)"
                  @change='item.change && item.change(scope.row)'></el-switch>
                <!-- 图像 -->
                <img v-if="item.type==='Image'" :src="scope.row[item.prop]" @click="item.handle && item.handle(scope.row)"/>
                <!-- 滑块 -->
                <el-slider v-if="item.type==='Slider'" v-model="scope.row[item.prop]" 
                :disabled="btn.isDisabled && btn.isDisabled(scope.row)"
                  @change='item.change && item.change(scope.row)'></el-slider>
                <!-- 默认 -->
                <span 
                  v-if="!item.type" 
                  :style="item.itemStyle && item.itemStyle(scope.row)" 
                  :class="item.itemClass && item.item.itemClass(scope.row)"
                >
                  <a @click="downLoad((item.formatter && item.formatter(scope.row)) || scope.row[item.prop])" :download="downloadUrl" :href="(item.formatter && item.formatter(scope.row)) || scope.row[item.prop]" style="color: #0863F5;" v-if="item.down">{{(item.formatter && item.formatter(scope.row)) || scope.row[item.prop]}}</a>
                  <span v-else>{{(item.formatter && item.formatter(scope.row)) || scope.row[item.prop]}}</span>
                </span>
              </template>
            </el-table-column>
      </el-table>
    </section>

    <!-- 分割 统计数据 -->
    <div class="source total_wrap" v-if="isTotal">
      <span v-for="(item, index) in totalCols" :key="index">
        <span class="label">{{item.label}}</span>
        <span class="value">{{formatStr(totalDatas[item.prop])}}</span>
        <el-divider direction="vertical"></el-divider>
      </span>
    </div>


    <!-- 分页 -->
    <section class="ces-pagination"  v-if='isPagination'>
      <el-pagination style='display: flex;justify-content: center;height: 100%;align-items: center;'
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total,sizes ,prev, pager, next,jumper"
        :page-sizes="[10, 15, 20, 25]"
        :page-size="pagination.limit"
        :current-page="pagination.offset"
        :total="pagination.total"
      ></el-pagination>
    </section>
</section>
</template>

<script>
import {formatStr} from '@/utils'
export default {
  props:{
    // 表格型号：mini,medium,small
    size:{ type: String, default: 'medium' },
    isBorder:{ type: Boolean, default: false },
    loading:{ type: Boolean, default: false },
    // 表格操作
    isHandle:{ type: Boolean, default: false },
    tableHandles:{ type: Array, default:()=>[] },
    // 表格数据
    tableData:{ type: Array, default:()=>[] },
    // 表格列配置
    tableCols:{ type: Array, default:()=>[] },
    // 是否显示表格复选框
    isSelection:{ type: Boolean, default: false },
    defaultSelections:{ type: [Array,Object], default:()=>null },
    // 是否显示表格索引
    isIndex:{ type: Boolean, default: false },
    indexLabel: { type: String, default:'序号' },
    // 是否显示统计
    isTotal: { type: Boolean, default: false },
    // 统计数据
    totalCols:{ type: Array, default:()=>[] },
    totalDatas: { type: Object, default:()=>{} },
    // 是否显示分页
    isPagination:{ type: Boolean, default: true },
    // 分页数据
    pagination:{ type: Object, default:()=>({limit:10,offset:1,total:0}) },
    
  },
  data(){
    return {
      formatStr: formatStr,

      downloadUrl: ''
    }
  },
  watch:{
    'defaultSelections'(val) {
      this.$nextTick(function(){
        if(Array.isArray(val)){
          val.forEach(row=>{
            this.$refs.cesTable.toggleRowSelection(row)
          })
        }else{
          this.$refs.cesTable.toggleRowSelection(val)
        }
      })      
    }
  },
  methods:{
    // 表格勾选
    select(rows,row){
      this.$emit('select',rows,row);
    },
    // 全选
    selectAll(rows){
      this.$emit('select',rows)
    },
    // 点击行选中
    handleRowClick(row, col, event) {
      this.$emit('select',row)
      this.$refs.cesTable.toggleRowSelection(row)
    },
    
    handleCurrentChange(val){
      this.pagination.offset = val
      this.$emit('refresh');
    },
    handleSizeChange(val) {
      this.pagination.limit = val
      this.$emit('refresh');
    },

    // 文件下载
    downLoad(link) {
      this.downloadUrl = link.split('/')[2]
    },
    
    // tableRowClassName({rowIndex}) {
    //     if (rowIndex % 2 === 0) {
    //         return "stripe-row";
    //     }
    //     return "";
    // }
    renderHeader(h,obj) {
      return h('span',{class:'ces-table-require'},obj.column.label)
    },
  },
}
</script>
<style lang="scss">
.ces-handle {
  margin-bottom: 10px;
}
.ces-pagination {
  padding: 18px 0;
}
.ces-table-require::before{
  content:'*';
  color:red;
}
// .ces-table {
//   height: 500px;
// }
.el-table th>.cell {
  font-weight: bold;
  font-size: 14px;
}
.el-table td>.cell {
  font-size: 14px;
}
.el-table__body-wrapper {
  height: auto !important;
}

.total_wrap {
  padding: 24px;
  font-size: 14px;
  border-bottom: 1px solid #eaeefb;
  line-height: 1.5;
  background: #f5f7fa;
  .label {
    font-weight: bold;
  }
  .value {
    font-size: 22px;
  }
}

</style>