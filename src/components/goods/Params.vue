<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item to="">参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 警告区域 -->
      <el-alert
        show-icon
        title="注意：只允许有三级分类设置参数"
        type="warning"
        :closable="false"
      >
      </el-alert>
      <!-- 商品选择分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品选择的级联选择框-->
          <el-cascader
            v-model="selectedkeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            style="margin-top: 15px"
          >
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >
            添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >
            添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  style="margin-right: 10px;"
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  style="width:10%"
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的dialog -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加参数的对话框 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //添加表单校验规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      //修改表单校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },

      //添加表单的数据
      addForm: {},

      //修改表单的验证规则
      editForm: {},

      //添加参数dialog
      addDialogVisible: false,

      //修改参数Dialog
      editDialogVisible: false,

      // 动态属性列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      //当前激活的tab页名
      activeName: "only",
      //商品分类
      cateList: [],
      //级联配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: true
      },
      //级联选择的分类id
      selectedkeys: []
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    //判断是否为三级分类，来禁用启用按钮
    isBtnDisabled() {
      if (this.selectedkeys.length !== 3) return true;
      return false;
    },
    //获取当前选中的三级分类的id
    getCateId() {
      if (this.selectedkeys.length === 3) return this.selectedkeys[2];
      return null;
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  },
  methods: {
    //发送更新请求
    async updateData(row) {
      //发送请求
      const { data: res } = await this.$http.put(
        `categories/${this.getCateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败！");
      }
      this.$message.success("修改参数项成功");
    },

    //处理tag输入框提交w
    async handleInputConfirm(row) {
      console.log(typeof row.inputValue);

      //处理是否输入内容
      if (row.inputValue.trim().length == 0) {
        row.inputVisible = false;
        row.inputValue = "";
        return;
      }

      //获取数据
      var newItem = row.inputValue.trim();
      row.attr_vals.push(newItem);
      row.inputValue = "";
      row.inputVisible = false;
      
      this.updateData(row);
    },

    //tag文本输入框展示
    showInput(role) {
      role.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    // 处理关闭函数
    handleClose(id, row) {
      row.attr_vals.splice(id, 1);
      this.updateData(row);
    },

    //显示编辑dialog并且获取数据
    async showEditDialog(id) {
      console.log(id);
      const { data: res } = await this.$http.get(
        `categories/${this.getCateId}/attributes/${id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("获取参数信息失败");
      this.$message.success("获取参数信息成功");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },

    //提交参数修改
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        console.log(this.editForm);
        if (!valid) return this.$message.error("数据内容不合法");
        const { data: res } = await this.$http.put(
          `categories/${this.getCateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败");
        }
        this.$message.success("修改参数成功");
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },

    //提交参数添加
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error("数据内容不合法");
        const { data: res } = await this.$http.post(
          `categories/${this.getCateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) return this.$message.error("添加参数失败");
        this.$message.success("添加参数成功");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },

    //编辑dialog关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    //添加dialog关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    //删除参数
    async removeParams(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.error("删除失败");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.getCateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      this.$message.success("删除成功");
      this.getParamsData();
    },

    //处理tab点击
    handleTabClick() {
      console.log(this.activeName);
      this.getParamsData();
    },

    //级联选择框变化的处理函数
    handleChange() {
      this.getParamsData();
    },

    //获取数据
    async getParamsData() {
      //判断是否选中三级分类 若不是则清空选择栏
      if (this.selectedkeys.length !== 3) {
        this.selectedkeys = [];
        return this.$message.error("所选分类不是三级分类");
      }
      //请求数据
      const { data: res } = await this.$http.get(
        `categories/${this.getCateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("获取参数列表失败");
      this.$message.success("获取参数分类成功");
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 控制文本框显示
        item.inputVisible = false;
        //文本框内容
        item.inputValue = "";
      });

      if (this.activeName === "only") {
        this.onlyTableData = res.data;
      } else {
        this.manyTableData = res.data;
      }
    },

    //获取分类
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) return this.$message.error("获取分类失败");
      this.$message.success("获取分类成功");
      this.cateList = res.data;
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}
</style>
