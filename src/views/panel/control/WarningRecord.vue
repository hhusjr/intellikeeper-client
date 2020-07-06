<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="24">
                <el-table
                        :data="tableData"
                        stripe
                        style="width: 100%">
                    <el-table-column
                            label="事件名称"
                            prop="recordName"
                            sortable
                            width="200px">
                    </el-table-column>
                    <el-table-column
                            label="发生时间"
                            prop="recordTime"
                            sortable
                            width="200px">
                    </el-table-column>
                    <el-table-column
                            label="标签路径"
                            prop="tagPath"
                            width="250px"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="事件描述"
                            prop="recordDescription">
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
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
                tableData: [{
                    'recordName': '000001',
                    'recordTime': '09-01-22:00',
                    'tagPath': '展馆A-分区A-标签A',
                    'recordDescription': '信号丢失!'
                }, {
                    'recordName': '000002',
                    'recordTime': '09-01-22:11',
                    'tagPath': '展馆A-分区B-标签A',
                    'recordDescription': '标签移动!'
                }],

                chosenTagId: -1,
                track: null,
                readers: [],
                deviceId: -1
            }
        },
        async 'created'() {
            this.getTableData()
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
            // 'getTableData'() {
            //     this.tableData = []
            //     let deviceId = localStorage.getItem('chosenDevice')
            //     api.get(urls.tag, {
            //         params: {
            //             device: deviceId
            //         }
            //     }).then((response) => {
            //         let tid_idx_mapping = {}
            //
            //         let cnt = 0;
            //         for (let item of response.data) {
            //             this.tableData.push({
            //                 'recordName': item['recordName'],
            //                 'recordTime': moment(item['recordTime']).format('YYYY-MM-DD HH:mm:ss'),
            //                 'tagName': item['tagName'],
            //                 'recordDescription': item['recordDescription']
            //             })
            //             tid_idx_mapping[item['tid']] = cnt++;
            //         }
            //
            //         api.get(urls.tag + 'info/?device=' + deviceId).then((response) => {
            //             for (let tag of response.data) {
            //                 let idx = tid_idx_mapping[tag['tid']]
            //                 this.tableData[idx]['is_online'] = tag['is_online'];
            //                 this.$set(this.tableData, idx, this.tableData[idx])
            //             }
            //         })
            //     }).catch(() => {
            //         // this.$alert('表格数据加载失败，请重试！', '加载失败')
            //     })
            // },
        }
    }
</script>

<style scoped>
#track-container {height: 400px;}
</style>