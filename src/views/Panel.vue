<template>
    <div id="main">
        <el-container class="container">
            <el-aside class="panel-bg" width="200px">
                <div class="intro">
                    <img src="../assets/imgs/logo.png" alt="IntelliKeeper" class="logo">
                </div>
                <el-menu :default-openeds="['1', '2', '3']"
                     active-text-color="#d76d3f"
                     background-color="#ffffff"
                     router
                     text-color="#484848">
                    <el-submenu index="1">
                        <template slot="title"><i class="el-icon-collection"></i>控制台</template>
                        <el-menu-item @click="changeTitle('仪表盘')" index="/panel/" class="el-icon-share"> 仪表盘</el-menu-item>
                        <!--<el-menu-item @click="changeTitle('轨迹追踪')" index="/panel/track" class="el-icon-camera"> 轨迹追踪</el-menu-item>-->
                        <el-menu-item @click="changeTitle('事件记录')" index="/panel/WarningRecord" class="el-icon-files"> 事件记录</el-menu-item>
                    </el-submenu>

                    <el-submenu index="2">
                        <template slot="title"><i class="el-icon-guide"></i>全局配置</template>
                        <el-menu-item @click="changeTitle('基站配置')" class="el-icon-s-home" index="/panel/base-configuration"> 基站配置</el-menu-item>
                        <el-menu-item @click="changeTitle('事件绑定')" class="el-icon-aim" index="/panel/callback-configuration"> 事件绑定</el-menu-item>
                        <el-menu-item @click="changeTitle('触发器管理')" class="el-icon-attract" index="/panel/trigger-configuration"> 触发器管理</el-menu-item>
                    </el-submenu>

                    <el-submenu index="3">
                        <template slot="title"><i class="el-icon-setting"></i>基本配置</template>
                        <el-menu-item @click="changeTitle('标签管理')" class="el-icon-collection-tag" index="/panel/tag-configuration"> 标签管理
                        </el-menu-item>
                        <el-menu-item @click="changeTitle('阅读器管理')" class="el-icon-menu" index="/panel/reader-configuration"> 阅读器管理</el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>

            <el-container class="main">
                <el-header class="header">
                    <div style="float: left">
                        <el-page-header>
                            <template slot="content">
                                <span class="title">{{ title }}</span>
                            </template>
                        </el-page-header>
                    </div>
                    <div style="float: right">
                        <el-select v-model="device" style="width: 150px;" @change="choseDevice(device)" placeholder="选择基站设备">
                            <el-option
                                    v-for="item in devices"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id">
                            </el-option>
                        </el-select>

                        <el-dropdown class="user-dropdown">
                            <span class="el-dropdown-link">
                                <i class="el-icon-user-solid"></i>
                                我
                                <i class="el-icon-arrow-down el-icon--right"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item>
                                    <i class="el-icon-close"></i> 注销登录
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </el-header>

                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
    import api from '@/api/api'
    import urls from '@/api/urls'

    export default {
        name: 'Panel',
        'data'() {
            return {
                isCollapsed: false,
                title: '仪表盘',
                devices: [],
                device: ''
            }
        },
        beforeCreate() {
            document.body.className = 'panel-bg'
        },
        'mounted'() {
            api.get(urls.device).then((response) => {
                let devices = []
                for (let device of response.data) {
                    devices.push({
                        name: device.name,
                        id: device.id,
                        location: device.location
                    })
                }

                let device = this.$route.query.device
                if (!device) {
                    let initChoice = localStorage.getItem('chosenDevice') ? localStorage.getItem('chosenDevice') : devices[0].id
                    this.choseDevice(initChoice)
                    return
                }
                this.devices = devices
                this.device = parseInt(device)
            })
        },
        methods: {
            changeCollapse() {
                this.isCollapsed = !this.isCollapsed
            },
            changeTitle(title) {
                this.title = title
            },
            choseDevice(device) {
                localStorage.setItem('chosenDevice', device)
                this.$router.replace({
                    path: this.$route.path,
                    query: {
                        device: device
                    }
                })
                window.location.reload()
            },
            goBack() {
                this.$router.back()
            }
        }
    }
</script>

<style>
    .panel-bg {
        background-color: #ffffff;
    }
</style>

<style scoped>
    /*noinspection CssUnusedSymbol*/
    #main {
        height: 100%;
    }

    .user-dropdown {
        color: #ffffff;
        margin: 0 25px;
        cursor: pointer;
    }

    .el-main {
        padding: 0;
        background: #f1f1f1;
        height: 100%;
    }

    .container {
        height: 100%;
    }

    .logo {
        width: 180px;
        height: 60px;
    }

    .main {
        background: #ffffff;
        min-height: 100%;
    }

    .intro {
        height: 60px;
        text-align: center;
        background-image: linear-gradient(to right bottom, #e8962e, #df6838) !important;
    }

    .main .header {
        padding: 10px;
        margin: 0;
        background-image: linear-gradient(to right bottom, #da8342, #e45131) !important;
        color: #fff;
        height: auto !important;
        box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    }

    .main .header:after {
        clear: both;
    }

    .el-page-header {
        padding: 8px 0;
        color: #fff !important;
    }

    .el-page-header__content {
        color: #fff !important;
    }

    .title {
        color: #fff;
    }
</style>