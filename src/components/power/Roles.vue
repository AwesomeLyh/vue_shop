<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="">权限管理</el-breadcrumb-item>
      <el-breadcrumb-item to="">角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="roleList" border stripe width="100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
              :key="item1.id"
            >
              <!-- 角色的一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :class="[index2 === 0 ? 'bdtop' : '', 'vcenter']"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色权限"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <!-- 操作按钮 -->
          <template slot-scope="scope">
            <!-- 编辑权限按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoles(scope.row.id)"
            >
              编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini">
              删除
            </el-button>
            <!-- 权限分配按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 编辑权限的dialog -->
    <el-dialog
      title="权限分配"
      :visible.sync="setRightDialogVisable"
      width="50%"
      @close="setCloseRightDialog"
    >
      <!-- 树状图控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisable = false"> 取 消 </el-button>
        <el-button type="primary" @click="allotRights">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //分配权限时选中的权限id
      roleId: "",
      //角色列表数据
      roleList: [],
      //权限数据
      rightsList: [],
      //控制显示权限分配dialog
      setRightDialogVisable: false,
      //树形控件的绑定数据
      treeProps: {
        label: "authName",
        children: "children"
      },
      //默认选中的节点Id
      defKeys: [104]
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    //确认发起请求修改角色权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) return this.$message.error("修改权限失败");
      this.$message.success("修改成功");
      this.getRoleList();
      this.setRightDialogVisable = false;
    },
    //关闭权限dialog时清空默认选中值
    setCloseRightDialog() {
      this.defKeys = [];
    },
    //递归所有三级权限id
    getLeafKeys(node, arr) {
      //定义出口 不存在child则时三级权限
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    //展示分配权限
    async showSetRightDialog(role) {
      //获取当前行的角色id
      this.roleId = role.id;

      //获取数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) return this.$message.error("获取权限失败");
      this.rightsList = res.data;
      this.$message.success("获取权限数据成功");
      //获取三级权限id
      this.getLeafKeys(role, this.defKeys);
      //显示dialog
      this.setRightDialogVisable = true;
    },
    //编辑权限
    async editRoles(id) {
      // const { data: res } = await this.$http.post(
      //   `roles/${id}/rights`
      // )
    },
    //获取角色的方法
    async getRoleList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) return this.$message.error("获取角色失败");
      this.roleList = res.data;
      console.log(res);
      this.$message.success("获取角色成功");
    },
    //删除角色权限的方法
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除权限失败");
      this.getRoleList();
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
