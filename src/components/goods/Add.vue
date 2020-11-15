<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item to="">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item to="">新增商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closeable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        finish-status="success"
        :active="activeIndex - 0"
        align-center
        style="marg;margin-bottom:20px"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 列表表单  -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="200px"
        label-position="top"
      >
        <!-- tab列表 -->
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeLeaveHandler"
          @tab-click="tabCilckHandler"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_number">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item-->
            <el-form-item
              v-for="item in manyTableData"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              action="http://localhost:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :file-list="fileList"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button size="middle" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器内容 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button
              type="primary"
              size="default"
              @click="addGoods"
              class="btn_add"
            >
              添加商品
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 预览图片地址
      previewPath: '',

      // 控制预览显示
      previewVisible: false,

      // 上传图片的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 商品分类列表
      cateList: [],

      // 动态属性列表数据
      manyTableData: [],

      // 静态属性列表数据
      onlyTableData: [],

      // 上传的文件
      fileList: [],

      // 下拉菜单配置的实例
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 添加商品的表单数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选中的三级分类id
        goods_cat: [],
        // 上传的图片列表
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 商品分类参数
        attrs: []
      },

      // 添加商品的表单数据校验
      addFormRules: {
        goods_name: [
          { required: true, message: '输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '输入商品数量', trigger: 'blur' }
        ]
      },

      // 当前激活的步骤编号
      activeIndex: 0
    }
  },
  computed: {
    // 获取当前选中的三级分类的id
    getCateId () {
      console.log(this.addForm.goods_cat[2])
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 提交新增商品
    addGoods () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要内容')
        // 接口参数需要字符串 --转换数组
        this.addForm.goods_cat = this.addForm.goods_cat.join(',')

        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newinfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addForm.attrs.push(newinfo)
        })

        // 处理静态参数
        this.onlyTableData.forEach(item => {
          const newinfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newinfo)
        })
        console.log(this.addForm)
        const { data: res } = await this.$http.post('goods', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    },

    // 上传的图片预览
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },

    // 移除上传的图片
    handleRemove (file) {
      // 获取临时路径
      const filePath = file.response.data.tmp_path
      // 从数组获取下标
      const i = this.addForm.pics.findIndex(item => item.pic === filePath)
      // 删除对应项
      this.addForm.pics.splice(i, 1)
    },

    // 上传成功
    handleSuccess (res) {
      // 获取相应的图品地址
      const picinfo = { pic: res.data.tmp_path }
      // 添加到addForm中
      this.addForm.pics.push(picinfo)
    },

    // 点击切换Tab时的事件处理
    async tabCilckHandler () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.getCateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) { return this.$message.error('获取分类参数失败') }
        this.$message.success('获取参数成功')
        this.manyTableData = res.data
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.getCateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) { return this.$message.error('获取分类参数失败') }
        this.$message.success('获取参数成功')
        this.onlyTableData = res.data
        console.log(res.data)
      }
    },
    //   处理下拉菜单事件
    handleChange () {
      // 判断是否选中三级分类 若不是则清空选择栏
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return this.$message.error('所选分类不是三级分类')
      }
    },

    // 切换tab栏之前的操作
    beforeLeaveHandler (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.error('未选择商品分类')
        return false
      }
    },

    // 获取商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) { return this.$message.error('获取商品分类失败') }
      this.$message.success('获取商品分类成功')
      this.cateList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btn_add {
  margin-top: 10px;
}
.quill-editor {
  min-height: 300px;
}
</style>
