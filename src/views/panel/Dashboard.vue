<template>
    <div>
        <el-row :gutter="24" style="margin: 0;">
            <el-col :span="8" style="padding: 0;">
                <div class="panel">
                    <div class="panel-header"><i class="el-icon-warning"></i> 事件中心</div>
                    <div class="panel-content" style="padding: 0; height: 324px; overflow-y: auto;">
                        <div class="panel-toolbar">
                            <el-button size="mini" class="fill-btn el-icon-refresh" type="success" @click="getEventTableData"> 刷新</el-button>
                        </div>
                        <el-table
                                :data="eventTableData"
                                stripe
                                style="width: 100%">
                            <el-table-column
                                    label="事件名称"
                                    prop="name"
                                    sortable>
                            </el-table-column>
                            <el-table-column
                                    label="事件名称"
                                    prop="created"
                                    sortable>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </el-col>

            <el-col :span="8" style="padding: 0;">
                <div class="panel">
                    <div class="panel-header"><i class="el-icon-collection"></i> 被盗统计</div>
                    <div class="panel-content">
                        <div id="firstChart-container"></div>
                    </div>
                </div>
            </el-col>

            <el-col :span="8" style="padding: 0;">
                <div class="panel">
                    <div class="panel-header"><i class="el-icon-s-finance"></i> 事件频率</div>
                    <div class="panel-content">
                        <div id="secondChart-container"></div>
                    </div>
                </div>
            </el-col>
        </el-row>
        <div class="panel">
            <div class="panel-header"><i class="el-icon-camera"></i> 远程监控</div>
            <div class="panel-toolbar">
                <el-row :gutter="15">
                    <el-col :span="3">
                        <el-button class="fill-btn el-icon-refresh" type="primary" @click="showUpdateMap = true"> 更新地图</el-button>
                    </el-col>
                </el-row>
            </div>
            <div class="panel-content">
                <div class="outerground">
                    <div class="firstStyle">
                        <el-row :gutter="24">
                            <el-col :span="18">
                                <div id="location-container"
                                v-bind:style="{
                                    backgroundImage: 'url(' + this.bgUrl + ')',
                                    height: calculatedHeight
                                }" ref="locationContainer"></div>
                            </el-col>

                            <el-col :span="6">
                                <!--显示轨迹与刷新-->
                                <div class="custom-tree-container">
                                    <div class="block">
                                        <ClassifiedTags v-on:nodeClick="handleNodeClick"></ClassifiedTags>
                                    </div>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </div>
        </div>

        <!--更新地图弹框-->
        <el-dialog :visible.sync="showUpdateMap" title="更新地图" width="32%">
            <div style="text-align: center;">
                <el-upload
                        drag
                        action="https://jsonplaceholder.typicode.com/posts/"
                        :http-request="uploadMap"
                >
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将地图图片拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">地图指房屋平面设计图、房屋结构图等。</div>
                </el-upload>
            </div>

            <span class="dialog-footer" slot="footer">
                <el-button @click="showUpdateMap = false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<style scoped>
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
    import ClassifiedTags from '@/components/ClassifiedTags'
    import echarts from 'echarts'
    import api from '@/api/api'
    import urls from '@/api/urls'
    import {clearIntervalAsync, setIntervalAsync} from 'set-interval-async/fixed'
    import moment from 'moment'

    export default {
        name: 'Dashboard',
        'data'() {
            return {
                numReaders: 0,
                numTags: 0,
                tags: [],

                eventTableData: [],

                locationChart: null,
                stolenStatisticsChart: null,
                eventFreqChart: null,

                deviceId: 0,
                refreshLocationInterval: null,
                imageUrl: '',
                file:'',
                inputScale: '',
                category: 0,
                showUpdateMap: false,

                bgUrl: '',
                bgW: 0,
                bgH: 0,

                calculatedHeight: '650px'
            }
        },

        methods: {
            'getEventTableData'() {
                this.eventTableData = []
                let deviceId = localStorage.getItem('chosenDevice')
                if (!deviceId) {
                    return
                }
                api.get(urls.event + 'top10/', {
                    params: {
                        device: deviceId,
                    }
                }).then((response) => {
                    for (let item of response.data) {
                        this.eventTableData.push({
                            'name': item['name'],
                            'created': moment(item['created']).format('YYYY-MM-DD HH:mm:ss'),
                        })
                    }
                }).catch(() => {
                    this.$alert('表格数据加载失败，请重试！', '加载失败')
                })
            },

            uploadMap(params) {
                const form = new FormData()
                form.append('map_picture', params.file)
                const deviceId = localStorage.getItem('chosenDevice')
                api.patch(urls.device + deviceId + '/', form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(() => {
                    this.refreshBg()
                    this.showUpdateMap = false
                })
            },

            resizeChart() {
                this.$nextTick(() => {
                    let width = this.$refs['locationContainer'].offsetWidth
                    this.calculatedHeight = (width * this.bgH / this.bgW) + 'px'
                    this.locationChart.resize({
                        height: this.calculatedHeight
                    })
                    this.eventFreqChart.resize()
                    this.stolenStatisticsChart.resize()
                })
            },

            refreshBg() {
                const deviceId = localStorage.getItem('chosenDevice')
                api.get(urls.device + deviceId + '/').then(res => {
                    this.bgUrl = res.data['map_picture']
                    this.bgH = res.data['map_picture_h']
                    this.bgW = res.data['map_picture_w']
                    this.resizeChart()
                })
            },

            async handleNodeClick(data) {
                if (data.type === 'category') {
                    this.category = data.id
                    await this.fetchTagInfo()
                    this.drawLocationChart()
                } else if (data.type === 'tag') {
                    await this.fetchTagInfo()
                    this.drawTrackGraph(data.id)
                } else if (data.type === 'base') {
                    this.category = 0
                    await this.fetchTagInfo()
                    this.drawLocationChart()
                }
            },

            //第一张图数据: 柱形图
            drawLine() {
                // 基于准备好的dom，初始化echarts实例
                this.stolenStatisticsChart = echarts.init(document.getElementById('firstChart-container'))
                // 绘制图表
                this.stolenStatisticsChart.setOption({
                    tooltip: {},
                    legend: {
                        data:['月份']
                    },
                    xAxis: {
                        type: 'category',

                        data: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        name: '月份',
                        type: 'bar',
                        color: '#37A2DA',
                        data: [5, 20, 36, 10, 10, 20,31,12,33,21,9,7],
                        //data: [],
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(220, 220, 220, 0.8)'
                        }
                    }]
                });
            },

            //第二张图数据: 折线图
            drawCircle() {
                // 基于准备好的dom，初始化echarts实例
                this.eventFreqChart = echarts.init(document.getElementById('secondChart-container'))
                // 绘制图表
                this.eventFreqChart.setOption({
                    tooltip: {},
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        areaStyle: {},
                        data: [8, 6, 7, 7, 12, 13, 10],
                        //data: [],
                        type: 'line'
                    }]
                });
            },

            //第三张图数据: 轨迹图
            async drawTrackGraph(id) {
                await this.fetchTagInfo()

                let tag = null
                for (let t of this.tags) {
                    if (t['id'] === id) {
                        tag = t
                    }
                }
                if (!tag) {
                    this.$alert('该标签不存在轨迹数据！')
                    return
                }

                let track = tag['track']

                let nodes = []
                let edges = []
                let cnt = 0
                for (let p of track) {
                    if (cnt) {
                        edges.push([
                            {
                                coord: [nodes[cnt - 1]['value'][0], nodes[cnt - 1]['value'][1]],
                            }, {
                                coord: [p[0], p[1]]
                            }
                        ])
                    }
                    nodes.push({
                        'value': [p[0], p[1]],
                        'created': p[2]
                    })
                    cnt++
                }

                let nodesInUse = []
                let edgesInUse = []

                let appliedCnt = 0

                let int = window.setInterval(() => {
                    if (appliedCnt >= nodes.length) {
                        window.clearInterval(int)
                    }
                    nodesInUse.push(nodes[appliedCnt])
                    if (appliedCnt) {
                        edgesInUse.push(edges[appliedCnt - 1])
                    }
                    appliedCnt++
                    // 绘制图表
                    this.locationChart.setOption({
                        grid: [
                            {x: 0, y: 0, width: '100%', height: '100%'}
                        ],
                        xAxis: [
                            {gridIndex: 0, min: -20, max: 20, show: false}
                        ],
                        yAxis: [
                            {gridIndex: 0, min: -20, max: 20, show: false}
                        ],
                        tooltip: {
                            formatter: tag['path'] + '/' + tag['name']
                        },
                        series: [
                            {
                                type: 'scatter',
                                data: nodesInUse,
                                markLine: {
                                    data: edgesInUse,
                                    lineStyle: {
                                        type: 'dashed',
                                        width: 3
                                    },
                                    symbolSize: 20,
                                    symbol: ['none', 'arrow']
                                },
                                label: {
                                    show: true,
                                    position: 'right',
                                    formatter: params => {
                                        return tag['name'] + '\n' + moment(params.data['created']).format('YYYY-MM-DD HH:mm:ss')
                                    }
                                }
                            }
                        ]
                    }, true);
                }, 900)
            },

            'drawLocationChart'() {
                let option = {
                    grid: [
                        {x: 0, y: 0, width: '100%', height: '100%'}
                    ],
                    xAxis: [
                        {gridIndex: 0, min: -20, max: 20, show: false}
                    ],
                    yAxis: [
                        {gridIndex: 0, min: -20, max: 20, show: false}
                    ],
                    tooltip: {
                        formatter: params => params.data.path + '/' + params.data.name
                    },
                    series: [{
                        symbolSize: 15,
                        data: this.tags,
                        type: 'scatter',
                        itemStyle: {
                            color: params => params.data.color
                        },
                        label: {
                            show: true,
                            position: 'right',
                            formatter: params => params.data.name + '\n' + params.data.path
                        }
                    }]
                }
                this.locationChart.setOption(option, true)
            },

            async 'fetchTagInfo'() {
                let result = []
                let tags = (await api.get(urls.tag + 'track/', {
                    params: {
                        'device': this.deviceId,
                        'category': this.category
                    }
                })).data
                for (let tag of tags) {
                    if (tag['track'].length === 0) {
                        continue
                    }
                    result.push({
                        name: tag['name'],
                        value: [tag['track'][tag['track'].length - 1][0], tag['track'][tag['track'].length - 1][1]],
                        isOnline: tag['is_online'],
                        color: tag['color'],
                        path: tag['path'],
                        id: tag['id'],
                        track: tag['track']
                    })
                }
                this.tags = result
            }
        },
        async 'mounted'() {
            this.drawLine()
            this.drawCircle()
            this.refreshBg()

            window.onresize = () => {
                this.resizeChart()
            }

            this.locationChart = echarts.init(document.getElementById('location-container'))
            this.locationChart.showLoading()
            this.deviceId = localStorage.getItem('chosenDevice')

            this.getEventTableData()
            // 获取标签信息
            try {
                await this.fetchTagInfo()
                this.drawLocationChart()
                this.locationChart.hideLoading()
            } catch (e) {
                console.log('Fetch tag failed')
            }
            this.refreshLocationInterval = setIntervalAsync(async () => {
                try {
                    await this.fetchTagInfo()
                    this.drawLocationChart()
                    this.locationChart.hideLoading()
                } catch (e) {
                    console.log('Fetch tag failed')
                }
            }, 20000)
        },

        async 'destroyed'() {
            await clearIntervalAsync(this.refreshLocationInterval)
        },

        components: {ClassifiedTags}
    }
</script>

<style scoped>

    #location-container {
        height: 650px;
        border: #F2F2F2 solid 1px;
        border-radius: 5px;
        background: #d8d8d9 no-repeat;
        background-size: 100% auto;
    }

    .firstStyle{
        background: #ffffff;
        border: #C8C8C8 solid 1px;
        padding: 8px;
    }

    #firstChart-container{
        height: 300px;
    }

    #secondChart-container{
        height: 300px;
    }

    .custom-tree-container{
        /*border: #818181 solid 2px;*/
        /*border-radius: 5px;*/
        width: 92%;
        margin-left: 5px;
    }

    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        /*font: 16px/1.5 'Microsoft YaHei',arial,tahoma,\5b8b\4f53,sans-serif;*/
        /*color: #ff3666;*/
        padding-right: 15px;
        height: 20px;
    }

    .outerground{
        padding: 5px;
        /*border: 5px solid #ffffff;*/
        background: #F2F2F2;
        border-radius: 5px;
    }

    .expand-table {
        font-size: 0;
    }

    .expand-table label {
        width: 90px;
        color: #99a9bf;
    }

    .expand-table el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }
</style>
