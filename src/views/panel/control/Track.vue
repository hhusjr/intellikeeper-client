<template>
    <div class="content-body">
        <el-row :gutter="20">
        <el-col :span="8">
            <el-table
                :data="tableData"
                stripe
                style="width: 100%">
                <el-table-column
                        label="已激活"
                        prop="is_active"
                        sortable
                        width="100px">
                    <template slot-scope="scope">
                        <h1>watch me watch me watch me!!!</h1>
                        <el-tag type="success" style="cursor: pointer;" v-if="scope.row.is_active">已激活</el-tag>
                        <el-tag type="danger" style="cursor: pointer;" v-else>未激活</el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                        label="在线"
                        prop="is_online"
                        sortable
                        width="100px">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.is_online === -1">查询中</el-tag>
                        <el-tag type="success" v-if="scope.row.is_online === 1">在线</el-tag>
                        <el-tag type="info" v-if="scope.row.is_online === 0">离线</el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                        label="标签名"
                        prop="name"
                        sortable>
                </el-table-column>
                <el-table-column
                        label="轨迹"
                        sortable>
                    <template slot-scope="scope">
                        <el-button size="mini" round class="el-icon-video-camera" @click="chosenTagId = scope.row.id"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>


        <el-col :span="16" style="padding: 20px;">
            <div id="track-container"></div>
        </el-col>
        </el-row>


        <!--自己测试的部分-->
<!--        <el-card class="box-card">-->
<!--            <div v-for="o in 4" :key="o" class="text item">-->
<!--                {{'列表内容 ' + o }}-->
<!--            </div>-->
<!--        </el-card>-->
    </div>
</template>

<script>
    import api from '@/api/api'
    import urls from '@/api/urls'
    import moment from 'moment'
    import echarts from 'echarts'

    export default {
        name: 'Track',
        'data'() {
            return {
                tableData: [],
                chosenTagId: -1,
                track: null,
                readers: [],
                deviceId: -1
            }
        },
        async 'created'() {
            // this.getTableData()
            this.deviceId = localStorage.getItem('chosenDevice')
            // 获取读写器
            try {
                let response = await api.get(urls.reader + '?device=' + this.deviceId)
                for (let reader of response.data) {
                    this.readers.push({
                        name: '主控读写器',
                        value: [reader.x, reader.y]
                    })
                }
            } catch (e) {
                console.log('get reader failed')
            }
        },
        'mounted'() {
            this.track = echarts.init(document.getElementById('track-container'))
        },
        watch: {
            async 'chosenTagId'() {
                if (this.chosenTagId === -1) {
                    return
                }
                this.track.showLoading()
                let option
                try {
                    let response = await api.get(urls.tag + this.chosenTagId + '/track/')
                    let cnt = response.data.length
                    option = {
                        xAxis: {
                            show: false
                        },
                        yAxis: {
                            show: false
                        },
                        tooltip: {
                            trigger: 'item',
                            'formatter'(params) {
                                if (!('recordTime' in params.data)) {
                                    return '阅读器'
                                }
                                return moment(params.data.recordTime * 1000).calendar()
                            }
                        },
                        series: [{
                            symbolSize: 15,
                            data: this.readers,
                            type: 'effectScatter',
                            showEffectOn: 'render',
                            rippleEffect: {
                                brushType: 'stroke'
                            },
                            itemStyle: {
                                color: 'purple',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        }, {
                            symbolSize: 15,
                            data: [],
                            type: 'scatter',
                            itemStyle: {
                                color: (params) => {
                                    return 'rgb(255,0,0,' + params.data.alpha + ')'
                                }
                            }
                        }]
                    }
                    this.track.setOption(option)

                    this.track.hideLoading()

                    let delay = () => {
                        return new Promise((resolve) => setTimeout(resolve, 100))
                    }
                    let idx = 0
                    for (let p of response.data) {
                        idx++;
                        option.series[1].data.push({
                            name: '路径节点',
                            value: [p['x'], p['y']],
                            recordTime: p['record_time'],
                            alpha: idx / cnt
                        })
                        this.track.setOption(option)
                        await delay()
                    }
                } catch (e) {
                    console.log('load track failed')
                    this.track.hideLoading()
                }
                this.chosenTagId = -1
            }
        },
        methods: {
            'getTableData'() {
                this.tableData = []
                let deviceId = localStorage.getItem('chosenDevice')
                api.get(urls.tag, {
                    params: {
                        device: deviceId
                    }
                }).then((response) => {
                    let tid_idx_mapping = {}

                    let cnt = 0;
                    for (let item of response.data) {
                        this.tableData.push({
                            'id': item['id'],
                            'tid': item['tid'],
                            'name': item['name'],
                            'is_active': item['is_active'],
                            'created': moment(item['created']).format('YYYY-MM-DD HH:mm:ss'),
                            'is_online': -1
                        })
                        tid_idx_mapping[item['tid']] = cnt++;
                    }

                    api.get(urls.tag + 'info/?device=' + deviceId).then((response) => {
                        for (let tag of response.data) {
                            let idx = tid_idx_mapping[tag['tid']]
                            this.tableData[idx]['is_online'] = tag['is_online'];
                            this.$set(this.tableData, idx, this.tableData[idx])
                        }
                    })
                }).catch(() => {
                    //this.$alert('表格数据加载失败，请重试！', '加载失败')
                })
            },
        }
    }
</script>

<style scoped>
#track-container {height: 400px;}

.box-card{width: 480px;}

</style>