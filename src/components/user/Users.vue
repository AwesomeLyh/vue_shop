<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="">用户管理</el-breadcrumb-item>
      <el-breadcrumb-item to="">用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getuserList"
          >
            <el-button
              v-model="queryInfo.query"
              slot="append"
              icon="el-icon-search"
              @click="getuserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
          <!-- 添加用户的dialog -->
          <el-dialog
            title="提示"
            width="50%"
            :visible.sync="addDialogVisible"
            @close="addDialogClosed"
          >
            <el-form
              label-width="70px"
              :model="addForm"
              :rules="addFormRules"
              ref="addFormref"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="addForm.password"></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
              </el-form-item>
              <el-form-item label="手机" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="addDialogVisible = false"> 取 消 </el-button>
              <el-button type="primary" @click="addUser"> 确 定 </el-button>
            </span>
          </el-dialog>
          <!-- 添加用户的dialog结束 -->
        </el-col>
      </el-row>
    </el-card>
    <template>
      <el-table :data="userList" stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserByid(scope.row.id)"
            >
            </el-button>
            <!-- 权限分配按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </template>
    <!-- 修改用户的dialog -->
    <el-dialog title="提示" width="50%" :visible.sync="editDialogVisible">
      <el-form
        label-width="70px"
        :model="editForm"
        :rules="editFormRules"
        ref="editFormref"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false"> 取 消 </el-button>
        <el-button type="primary" @click="editUserInfo"> 确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的dialog结束 -->

    <!-- 编辑权限的dialog -->
    <el-dialog
      title="角色分配"
      :visible.sync="setRoleDialogVisable"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>用户名：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <p>
          可分配的角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisable = false">
          取 消
        </el-button>
        <el-button type="primary" @click="saveRoleInfo">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 定义验证邮箱的验证规则
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 分页查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      // 控制分配角色dialog
      setRoleDialogVisable: false,
      // 需要分配角色的用户信息
      userInfo: {},
      // 可选择的角色信息
      roleList: [],
      // 已经选中的角色Id
      selectedRoleId: '',
      // 添加表单的数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改表单的数据
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 添加表单的校验规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑表单的校验规则id
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getuserList()
  },
  methods: {
    // 关闭角色分配重置用户信息和选择的角色ID
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
    // 提交角色分配
    async saveRoleInfo () {
      if (!this.selectedRoleId) return this.$message.error('请选择角色')
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) return this.$message.error('分配角色失败')
      this.$message.success('分配角色成功')
      this.getuserList()
      this.setRoleDialogVisable = false
    },
    // 展示分配角色的dialog
    async setRole (userinfo) {
      this.userInfo = userinfo
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) { return this.$message.error('获取角色列表失败') }
      this.$message.success('获取角色列表成功')
      this.roleList = res.data
      console.log(this.roleList)
      this.setRoleDialogVisable = true
    },
    // 显示编辑用户的对话框(并根据scope.row,id获取数据)
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) { return this.$message.error('获取用户信息失败') }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 提交编辑后的表单数据
    async editUserInfo () {
      const { data: res } = this.$http.put('users/' + this.editForm.id, {
        email: this.editForm.email,
        mobile: this.editForm.mobile
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败')
      }
      this.editDialogVisible = false
      this.getuserList()
      this.$message.success('更新成功')
    },
    // 删除user的方法
    async removeUserByid (id) {
      console.log(1)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getuserList()
    },

    // 添加新用户
    addUser () {
      this.$refs.addFormref.validate(async valid => {
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getuserList()
      })
    },
    // 关闭dialog重置表单
    addDialogClosed () {
      this.$refs.addFormref.resetFields()
    },
    // 获取用户列表
    async getuserList () {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 页面条目数改便
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getuserList()
    },
    // 页面页码值改变
    handleCurrentChange (newnum) {
      this.queryInfo.pagenum = newnum
      this.getuserList()
    },
    // 更改用户状态
    async userStateChange (userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('更新用户状态失败')
      }

      this.$message.success('更新用户状态成功')
    }
  }
}
</script>

<style lang="less" scoped></style>
