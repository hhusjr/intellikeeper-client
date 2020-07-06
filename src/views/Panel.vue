<template>
    <el-container class="container">
        <el-aside class="panel-bg" width="200px">
            <el-menu :default-openeds="['1', '2', '3']"
                 active-text-color="#ffd04b"
                 background-color="#545c64"
                 router
                 text-color="#fff">
                <el-menu-item>
                    <el-select v-model="device" @change="choseDevice(device)" placeholder="选择基站设备">
                        <el-option
                            v-for="item in devices"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                        </el-option>
                    </el-select>
                </el-menu-item>
                <el-submenu index="1">
                    <template slot="title"><i class="el-icon-collection"></i>控制台</template>
                    <el-menu-item @click="changeTitle('标签监控')" index="/panel/monitor" class="el-icon-location"> 标签监控</el-menu-item>
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
                <el-page-header :content="title" @back="goBack">
                </el-page-header>
            </el-header>

            <el-main>
                <div class="content-body">
                    <router-view></router-view>
                </div>
            </el-main>
        </el-container>
    </el-container>
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
        computed: {
            collapseIcon() {
                return this.isCollapsed ? 'el-icon-s-fold' : 'el-icon-s-unfold'
            },
            collapseWidth() {
                return this.isCollapsed ? '65px' : '200px'
            }
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
        background-color: #545c64;
    }
</style>

<style scoped>
    /*noinspection CssUnusedSymbol*/
    .el-main {
        padding: 0;
        background: #F2F2F2;
        min-height: 100%;
    }

    .container {
        min-height: 100%;
    }

    .main {
        background: #ffffff;
        min-height: 675px;
    }

    .main .header {
        padding: 16px;
        margin: 2px;
        border-bottom: #818181 solid 2px;
        height: 50px !important;
    }

    .content-body {
        margin: 13px;
        background: #ffffff;
    }
</style>