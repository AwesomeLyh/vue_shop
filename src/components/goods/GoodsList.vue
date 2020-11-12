<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item to="">商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
        <el-input placeholder="请输入内容" v-model="input2" width="20">
          <template slot="append">
            <i class="el-icon-help"></i>
          </template>
        </el-input>
        <el-button type="primary" slot-scope="">
          操作按钮
        </el-button>
    </el-card>
  </div>
</template>

<script>
export default {};
</script>

<style lang="less" scoped></style>
