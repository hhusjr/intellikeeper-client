<template>
    <el-main>
        <div class="panel">
            <div class="panel-header"><i class="el-icon-news"></i> 数据统计</div>
            <div class="panel-content">
                <el-row :gutter="20">
                    <el-col :span="6">
                        <div class="status">
                            <!-- TODO: 不在线的情况 -->
                            <p class="value">在线</p>
                            <p class="title">状态</p>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="status">
                            <!-- TODO: 实现报警记录功能 -->
                            <p class="value">1</p>
                            <p class="title">报警次数</p>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="status">
                            <p class="value">{{ numReaders }}</p>
                            <p class="title">主控节点数</p>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="status last">
                            <p class="value">{{ numTags }}</p>
                            <p class="title">TAG数</p>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>
        <div class="panel">
            <div class="panel-header"><i class="el-icon-camera"></i> 远程监控</div>
            <div>
                <el-row :gutter="0">
                    <el-col :span="8" class="color-tip" style="background-color: purple">阅读器</el-col>
                    <el-col :span="8" class="color-tip" style="background-color: green">在线标签</el-col>
                    <el-col :span="8" class="color-tip" style="background-color: red">离线标签</el-col>
                </el-row>
            </div>
            <div class="panel-content">
                <RemoteMonitor @fetchedReaders="upNumReaders" @fetchedTagsInfo="upNumTags"></RemoteMonitor>
            </div>
        </div>
    </el-main>
</template>

<style scoped>
    .panel {
        background: #fff;
        margin: 20px;
        border: solid 1px #d8d8d9;
        border-radius: 5px;
    }

    .panel .panel-header {
        border-bottom: solid 1px #d8d8d9;
        padding: 12px;
        color: #545c64;
    }

    .panel-content {
        padding: 12px;
    }

    .status {
        border-right: solid 1px #545c64;
    }

    .last {
        border: 0;
    }

    .status .title {
        color: #888;
        text-align: center;
        margin: 0;
    }

    .status .value {
        color: #ff0000;
        text-align: center;
        font-size: 36px;
        margin: 0;
        line-height: 50px;
    }

    .color-tip {
        color: white;
        padding: 5px;
        text-align: center;
        font-size: 14px;
    }
</style>

<script>
    import RemoteMonitor from '@/components/RemoteMonitor'

    export default {
        name: 'Dashboard',
        'data'() {
            return {
                numReaders: 0,
                numTags: 0
            }
        },
        methods: {
            'upNumReaders'(readers) {
                this.numReaders = readers.length
            },
            'upNumTags'(tags) {
                this.numTags = tags.length
            },
        },
        components: {
            'RemoteMonitor': RemoteMonitor
        }
    }
</script>
