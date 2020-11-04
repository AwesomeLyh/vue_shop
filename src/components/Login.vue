<template>
  <div class="login_contanier">
    <!-- 登录盒子 -->
    <div class="login_box">
      <!-- 头像部分 -->
      <div class="avatar_box">
        <img src="../assets/1.png" alt="" />
      </div>
      <!-- 主体表单部分 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <el-form-item>
          <h1 style="text-align: center">登 录</h1>
        </el-form-item>
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
            @keyup.enter.native="login"
          ></el-input>
        </el-form-item>
        <!-- 按钮部分 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      //登录表单数据的验证
      loginFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在3到10位", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在6到15位", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    //重置表单数据
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate(async (val) => {
        if (!val) return this.$message.error("用户名或密码不合法");
        const { data: result } = await this.$http.post("login", this.loginForm);
        if (result.meta.status !== 200)
          return this.$message.error("login failed");
        this.$message.success("login success");
        //登录成功保存Token
        window.sessionStorage.setItem("token", result.data.token);
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_contanier {
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  width: 450px;
  height: 350px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
