<template>
    <div class="content-body">
        <div class="toolbar">
            <el-row :gutter="15">
                <el-col :span="3">
                    <el-button @click="getTableData" class="fill-btn el-icon-refresh" type="primary">刷新</el-button>
                </el-col>
            </el-row>
        </div>

        <el-row :gutter="24">

            <el-col :span="24">
                <el-table
                        :data="tableData"
                        stripe>
                    <el-table-column
                            label="阅读器编号"
                            prop="rid"
                            sortable
                            width="250px">
                    </el-table-column>
                    <el-table-column
                            label="阅读器名"
                            prop="name"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="位置标注"
                            prop="location"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="方位"
                            prop="axis"
                            sortable>
                        <template slot-scope="scope">
                            ({{ scope.row.x | twoFixed }}, {{ scope.row.y | twoFixed }})
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="操作"
                            prop="action"
                            sortable>
                        <template slot-scope="scope">
                            <el-button circle class="el-icon-edit"
                                       size="mini" @click="showChangePositionDialog(scope.row)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <el-dialog :visible.sync="showChangePosition" @opened="refreshChart" title="编辑阅读器" width="60%">
            <el-form label-position="left" label-width="100px" ref="newBaseInfo" status-icon v-model="curEditing">
                <el-form-item label="阅读器名称" prop="name">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="curEditing.name"></el-input>
                </el-form-item>
                <el-form-item label="阅读器位置" prop="location">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="curEditing.location"></el-input>
                </el-form-item>
            </el-form>

            <el-alert style="margin-bottom: 15px;">下图中可拖移阅读器方位。</el-alert>
            <div id="reader-pos-chart-container" ref="locationContainer" v-bind:style="{
                backgroundImage: 'url(' + this.bgUrl + ')',
                height: calculatedHeight
            }">加载中...</div>
            <span class="dialog-footer" slot="footer">
                <el-button type="primary" @click="doChange">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<style scoped>
    #reader-pos-chart-container {
        height: 650px;
        border: #F2F2F2 solid 1px;
        border-radius: 5px;
        background: #d8d8d9 no-repeat;
        background-size: 100% auto;
    }
</style>

<script>

    import api from '@/api/api'
    import urls from '@/api/urls'
    import echarts from 'echarts'
    import * as qs from 'qs'

    export default {
        name: 'ReaderConfiguration',
        filters: {
            twoFixed: function (data) {
                return data.toFixed(2)
            }
        },
        methods: {
            'showChangePositionDialog'(row) {
                this.showChangePosition = true
                this.curEditing = JSON.parse(JSON.stringify(row))
            },

            'doChange'() {
                let deviceId = localStorage.getItem('chosenDevice')
                const loading = this.$loading({
                    lock: true,
                    text: '修改中...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                })
                api.patch(urls.reader + this.curEditing.id + '/?device=' + deviceId, qs.stringify({
                    x: this.curEditing.x,
                    y: this.curEditing.y,
                    name: this.curEditing.name,
                    location: this.curEditing.location
                })).then(() => {
                    this.$alert('修改成功')
                    this.getTableData()
                }).catch(() => {
                    this.$alert('修改失败')
                }).finally(() => {
                    this.showChangePosition = false
                    loading.close()
                })
            },

            'refreshChart'() {
                const deviceId = localStorage.getItem('chosenDevice')
                api.get(urls.device + deviceId + '/').then(res => {
                    this.bgUrl = res.data['map_picture']
                    let bgH = res.data['map_picture_h']
                    let bgW = res.data['map_picture_w']

                    this.$nextTick(() => {
                        this.showPositionChart = echarts.init(document.getElementById('reader-pos-chart-container'))
                        // 绘制图表
                        this.showPositionChart.setOption({
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
                                formatter: params => params.data.location
                            },
                            series: [{
                                symbolSize: 15,
                                smooth: true,
                                data: [
                                    {
                                        value: [this.curEditing['x'], this.curEditing['y']],
                                        location: this.curEditing['location'],
                                        name: this.curEditing['name']
                                    }
                                ],
                                type: 'scatter',
                                animation: false,
                                label: {
                                    show: true,
                                    position: 'right',
                                    formatter: params => params.data.name
                                }
                            }]
                        }, true)

                        let width = this.$refs['locationContainer'].offsetWidth
                        this.calculatedHeight = (width * bgH / bgW) + 'px'
                        this.showPositionChart.resize({
                            height: this.calculatedHeight
                        })

                        let me = this
                        this.showPositionChart.setOption({
                            graphic: [
                                {
                                    type: 'circle',
                                    shape: {
                                        r: 7.5
                                    },
                                    invisible: true,
                                    position: this.showPositionChart.convertToPixel('grid', [this.curEditing.x, this.curEditing.y]),
                                    draggable: true,
                                    z: 100,

                                    ondrag() {
                                        let res = me.showPositionChart.convertFromPixel('grid', this.position)
                                        me.curEditing.x = res[0]
                                        me.curEditing.y = res[1]

                                        me.showPositionChart.setOption({
                                            series: [{
                                                data: [
                                                    {
                                                        value: [me.curEditing['x'], me.curEditing['y']],
                                                        location: me.curEditing['location'],
                                                        name: me.curEditing['name']
                                                    }
                                                ]
                                            }]
                                        })
                                    }
                                }
                            ]
                        })
                    })
                })
            },

            'getTableData'() {
                this.tableData = []
                let deviceId = localStorage.getItem('chosenDevice')
                api.get(urls.reader, {
                    params: {
                        device: deviceId,
                        category: this.category
                    }
                }).then((response) => {
                    for (let reader of response.data) {
                        this.tableData.push({
                            id: reader.id,
                            rid: reader.rid,
                            name: reader.name,
                            x: reader.x,
                            y: reader.y,
                            location: reader.location
                        })
                    }
                })
            }
        },
        'data'() {
            return {
                percentage: 0,
                curEditing: {
                    name: '',
                    location: '',
                    x: 0,
                    y: 0,
                    id: -1
                },
                showChangePosition: false,
                showPositionChart: null,
                calculatedHeight: 650,
                bgUrl: '',

                tableData: [{
                    'tid': '000001',
                    'name': '阅读器A',
                    'created': '2020-09-01',
                    'is_online': 1
                }, {
                    'tid': '000002',
                    'name': '阅读器B',
                    'created': '2020-09-02',
                    'is_online': 1
                }, {
                    'tid': '000003',
                    'name': '阅读器C',
                    'created': '2020-09-03',
                    'is_online': 0
                }, {
                    'tid': '000004',
                    'name': '阅读器D',
                    'created': '2020-09-04',
                    'is_online': 1
                }]
            }
        },

        created() {
            this.getTableData()
        }
    }
</script>
