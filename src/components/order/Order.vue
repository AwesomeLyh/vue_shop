<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="">订单管理</el-breadcrumb-item>
      <el-breadcrumb-item to="">订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8" :offset="0">
          <el-input
            v-model="queryInfo.query"
            placeholder="请输入内容"
            size="normal"
            clearable
          >
            <el-button
              type="primary"
              size="default"
              @click="queryOrderList"
              icon="el-icon-search"
              slot="append"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag
              type="success"
              size="normal"
              effect="dark"
              v-if="scope.row.id === '1'"
              >已付款
            </el-tag>
            <el-tag type="danger" size="normal" effect="dark" v-else
              >未付款
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
          <template slot-scope="scope">
            {{ scope.row.is_send }}
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_date">
          <template slot-scope="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="create_date">
          <template>
            <el-button
              type="mini"
              size="primary"
              icon="el-icon-edit"
              @click="showBox"
            ></el-button>
            <el-button
              type="mini"
              size="success"
              icon="el-icon-location"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址dialog -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%">
      <el-form
        :model="addressForm"
        ref="addressFormRef"
        :rules="addressFormRules"
        label-width="80px"
        width="50%"
      >
        <el-form-item label="市区/县" prop="city">
          <el-cascader
            :options="cityData"
            v-model="addressForm.city"
            :props="{
              expandTrigger: 'hover',
              multiple: true,
              checkStrictly: true
            }"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="location">
          <el-input v-model="addressForm.location"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="addressVisible = false">取消</el-button>
        <el-button type="primary" @click="addressVisible = false">
          确定
        </el-button>
      </span>
    </el-dialog>
    <!-- 查询快递dialog -->
    <el-dialog
      title="物流查询"
      :visible.sync="showProgressBoxVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(action, index) in progressInfo"
          :key="index"
          :timestamp="action.ftime"
          placement="top"
        >
          {{ action.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'

export default {
  data () {
    return {
      // 城市数据
      cityData,

      // 修改地址表单
      addressForm: {},

      // 修改地址表单校验
      addressFormRules: {
        city: [{ required: true, message: '请选择城市', trigger: 'blur' }],
        location: [{ required: true, message: '请输入地址', trigger: 'blur' }]
      },

      // 控制修改地址dialog
      addressVisible: false,

      // 控制快递查询
      showProgressBoxVisible: false,

      // 分页查询参数
      queryInfo: {
        queryInfo: '',
        pagesize: 10,
        pagenum: 1
      },
      // 数据总条数
      total: 0,

      // 订单列表
      orderList: [],

      // 物流信息查询
      progressInfo: []
    }
  },
  created () {
    this.queryOrderList()
  },
  computed: {},
  methods: {
    // 控制修改地址
    showBox () {
      this.addressVisible = true
    },
    // 控制快递查询
    showProgressBox () {
      const data = [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context:
            '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context:
            '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]

      this.progressInfo = data
      this.showProgressBoxVisible = true
    },

    // 页面显示条数变化
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.queryOrderList()
    },
    // 页面页数变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.queryOrderList()
    },
    // 查询的方法
    async queryOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取订单失败')
      this.$message.success('获取订单成功')
      this.total = res.data.total
      this.orderList = res.data.goods
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
