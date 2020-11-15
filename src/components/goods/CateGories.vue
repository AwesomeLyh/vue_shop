<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item to="">商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialogOpen"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 树状表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="true"
      >
        <!-- TreeTable渲染数据模板 -->
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          >
          </i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
          >
            二级
          </el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">
            编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">
            删除
          </el-button>
        </template>
      </tree-table>

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
    <!-- 添加商品分类的dialog -->
    <el-dialog
      title="提示"
      width="50%"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedkeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false"> 取 消 </el-button>
        <el-button type="primary" @click="addCate">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 选中的父级分类id
      selectedkeys: [],
      //  指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 父级分类数据
      parentCateList: [],

      // 添加分类的表单数据
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类的表单数据验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 控制添加分类的dialog
      addCateDialogVisible: false,
      // 分页查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 列数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },

        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 商品分类的总列表
      cateList: [],
      // 总数据条数
      total: 0
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 提交新增分类
    async addCate () {
      this.$refs.addCateFormRef.validate(async valida => {
        if (!valida) return this.$message.error('数据不合法或未填写')
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('新增失败')
        this.$message.success('新增成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },

    // 添加分类关闭时重置表单
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedkeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },

    // 选择的父品类变化时触发
    parentCateChanged () {
      console.log(this.selectedkeys)
      if (this.selectedkeys.length > 0) {
        // 获取当前选择的父类的id
        this.addCateForm.cat_pid = this.selectedkeys[
          this.selectedkeys.length - 1
        ]
        // 获取当前的分类的等级
        this.addCateForm.cat_level = this.selectedkeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },

    // 获取父级分类
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) { return this.$message.error('获取父类分类失败') }
      this.$message.success('获取父类分类成功')
      this.parentCateList = res.data
    },

    // 打开添加分类的dialog
    addCateDialogOpen () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 页面pagesize变化
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 页面页码值变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 获取商品品类
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) { return this.$message.error('获取商品分类失败') }
      this.$message.success('获取商品分类成功')
      // 传递商品分类信息
      this.cateList = res.data.result
      console.log(this.cateList)
      // 传递总条数
      this.total = res.data.total
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>
