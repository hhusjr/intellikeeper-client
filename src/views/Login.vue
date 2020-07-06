<template>
    <div class="container">
        <el-card>
            <div class="clearfix" slot="header">
                <span class="el-icon-s-home">登陆到我的智能管家</span>
            </div>
            <el-form :model="login" :rules="rules" label-position="left" label-width="80px" ref="login" status-icon>
                <el-form-item label="手机号" prop="phone">
                    <el-input autocomplete="off" prefix-icon="el-icon-phone" size="large" type="text"
                              v-model="login.phone"></el-input>
                </el-form-item>
                <el-form-item label="验证码" prop="verifyCode">
                    <el-input autocomplete="off" prefix-icon="el-icon-key" size="large" type="digit"
                              v-model="login.verifyCode">
                        <el-button @click="sendVerifyCode" slot="append">{{ getVerifyCodeText }}</el-button>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="doLogin" type="primary">登陆/注册</el-button>
                    <el-button @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>
    import axios from 'axios'
    import urls from '@/api/urls'
    import { mapMutations } from 'vuex'
    let VERIFY_CODE_GAP = 20

    export default {
        name: 'Login',
        methods: {
            ...mapMutations(['changeLogin']),
            'gotoRegisterView'() {
                this.$router.push('/register')
            },
            'resetForm'() {
                this.$refs['login'].resetFields()
            },
            'sendVerifyCode'() {
                this.$refs['login'].validateField('phone', (error) => {
                    if (error) {
                        return
                    }
                    this.getVerifyCodeText = '发送中'
                    axios.post(urls.login.verify, {
                        mobile: '+86' + this.login.phone
                    }).then(() => {
                        this.getVerifyCodeText = '已发送'
                        let curCountDown = VERIFY_CODE_GAP
                        let countDown = window.setInterval(() => {
                            if (!curCountDown) {
                                this.getVerifyCodeText = '短信获取'
                                window.clearInterval(countDown)
                                return
                            }
                            this.getVerifyCodeText = curCountDown-- + '秒'
                        }, 1000)
                    }).catch()
                });
            },
            'doLogin'() {
                let vm = this;
                this.$refs['login'].validate((valid) => {
                    if (!valid) {
                        return;
                    }

                    axios.post(urls.login.token, {
                        mobile: '+86' + this.login.phone,
                        token: this.login.verifyCode
                    }).then((response) => {
                        vm.resetForm()

                        vm.changeLogin({
                            Authorization: response.data.token
                        })

                        vm.$router.push({
                            path: '/panel/monitor'
                        })
                    }).catch(() => {
                        vm.$alert('请检查手机号与验证码。', '登陆失败')
                    })
                })
            }
        },
        'beforeCreate'() {
            document.documentElement.className = 'login'
        },
        'data'(){
            let validatePhone = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('手机号码不能为空'))
                }
                if (!(/^1[3458][0-9]\d{4,8}$/.test(value))) {
                    return callback(new Error('请输入正确格式的手机号码'))
                }
                callback()
            }
            let validateVerifyCode = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('手机验证码不能为空'))
                }
                if (!(/^[0-9]{6}$/.test(value))) {
                    return callback(new Error('请输入六位数字验证码'))
                }
                callback()
            }
            return {
                getVerifyCodeText: '短信获取',
                login: {
                    phone: '',
                    verifyCode: ''
                },
                rules: {
                    phone: [
                        {validator: validatePhone, trigger: 'blur'}
                    ],
                    verifyCode: [
                        {validator: validateVerifyCode, trigger: 'blur'}
                    ]
                }
            }
        }
    }
</script>

<style>
    /*noinspection CssUnusedSymbol*/
    html.login {
        min-height: 100%;
    }

    html.login body {
        background-image: url("~@/assets/imgs/login-bg.jpg");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }
</style>

<style scoped>
    .container {
        display: flex;
        margin: 125px 0;
        justify-content: center;
    }

    .container el-card {
        width: 400px;
        background: #fff;
    }
</style>