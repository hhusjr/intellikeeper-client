<script src="../../dist/js/chunk-vendors.3fba6946.js"></script>
<template>
    <div class="outerground">

        <!--background-image upload and scale setting-->


        <!--layout-设计图与树形图-->

        <div class="firstStyle">
            <el-row :gutter="6">
                <el-col :span="18">
                    <div id="location-container"></div>
                </el-col>

                <el-col :span="6">

                    <div class="toolbar">
                        <el-row :gutter="6">
                            <el-col :span="11">
                                <el-upload
                                        class="toolbar"
                                        action="https://jsonplaceholder.typicode.com/posts/"
                                        :show-file-list="false"
                                        :on-success="handleAvatarSuccess"
                                        :before-upload="beforeAvatarUpload">
                                    <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                    <el-button type="primary" size="large" class="fill-btn el-icon-upload2" v-on:click="upData">上传图片</el-button>
                                </el-upload>
                            </el-col>

                            <el-col :span="12">
                                <el-input id="numberscale" type="number" v-model="input" placeholder="请输入比例尺"></el-input>
                            </el-col>
                        </el-row>
                    </div>


                    <div class="custom-tree-container">
                        <div class="block">
                            <el-tree
                                    :data="data"
                                    node-key="id"
                                    default-expand-all>
                            <span class="custom-tree-node" slot-scope="{ node, data }">
                                <span>
                                    <span v-bind:style="{ color: data.color }" class="el-icon-star-on"></span>
                                    {{ node.label }}
                                </span>
                            </span>
                            </el-tree>
                        </div>
                    </div>

                </el-col>
            </el-row>
        </div>

        <el-row :gutter="20">
            <el-col :span="12">
                <div id="firstChart-container"></div>
            </el-col>

            <el-col :span="12">
                <div id="secondChart-container"></div>
            </el-col>
        </el-row>

    </div>
</template>

<script>
    import echarts from 'echarts'
    // Vue.prototype.$echarts = echarts
    import urls from '@/api/urls'
    import api from '@/api/api'
    import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/fixed'

    let id = 1000;

    export default {
        name: 'RemoteMonitor',
        'data'() {

            const data = [{
                id: 1,
                label: '分类管理',
                disabled: true,
                children: [{
                    id: 4,
                    label: '展馆A',
                    color: '#409EFF',
                    icon: "el-icon-circle-plus-outline",
                    children: [{
                        id: 9,
                        color: '#67C23A',
                        label: '分区A'
                    },{
                        id: 10,
                        color: '#F56C6C',
                        label: '分区B'
                    }]
                },{
                    id: 11,
                    color: '#409EFF',
                    label: '展馆B'
                }]
            }];

            return {
                readers: [],
                tags: [],
                locationChart: null,

                data: JSON.parse(JSON.stringify(data)),

                deviceId: 0,
                refreshLocationInterval: null,
                imageUrl: '',
                file:'',
                input: ''
            }
        },
        methods: {


            //第一张图数据
            drawLine() {
                // 基于准备好的dom，初始化echarts实例
                let myChart = echarts.init(document.getElementById('firstChart-container'))
                // 绘制图表
                myChart.setOption({
                    title: {
                        text: '    被盗统计',
                    },
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
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(220, 220, 220, 0.8)'
                        }
                    }]
                });
            },

            drawCircle() {
                // 基于准备好的dom，初始化echarts实例
                let myChart = echarts.init(document.getElementById('secondChart-container'))
                // 绘制图表
                myChart.setOption({
                    title: {
                        text: '    事件频率',
                    },
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
                        type: 'line'
                    }]
                });
            },

            handleAvatarSuccess(res, file) {
                let preview = document.querySelector('#location-container');
                this.imageUrl = URL.createObjectURL(file.raw);
                // preview.style.background-image = 'url(' + this.imageUrl + ')';
                //图片路径
            },

            beforeAvatarUpload(file) {
                this.file = file;
                console.log(this.file)
            },

            upData(){
                let formData = new FormData();
                formData.append('head', this.file);
                //第一个参数是键   第二个是值
                //然后在这里发送请求   如果还有其他参数 	继续append
            },

            'initLocationChart'() {
                let option = {
                    xAxis: {
                        show: false
                    },
                    yAxis: {
                        show: false
                    },
                    series: [{
                        symbolSize: 20,
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
                        data: this.tags,
                        type: 'scatter',
                        itemStyle: {
                            color: params => {
                                if (params.data.isOnline) {
                                    return 'green'
                                }
                                return 'red'
                            }
                        },
                        label: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        }
                    }]
                }
                this.locationChart.setOption(option)
            },
            async 'fetchTagInfo'() {
                let result = []
                let tags = (await api.get(urls.tag + 'info/?device=' + this.deviceId)).data
                for (let tag of tags) {
                    result.push({
                        name: tag['name'],
                        value: [tag['x'], tag['y']],
                        isOnline: tag['is_online']
                    })
                }
                this.tags = result
                this.$emit('fetchedTagsInfo', result)
            }
        },
        async 'mounted'() {

            this.drawLine()
            this.drawCircle()

            this.locationChart = echarts.init(document.getElementById('location-container'))
            // this.locationChart.showLoading()
            this.deviceId = localStorage.getItem('chosenDevice')

            // 获取读写器
            let response = await api.get(urls.reader + '?device=' + this.deviceId)
            this.$emit('fetchedReaders', response.data)
            for (let reader of response.data) {
                this.readers.push({
                    name: '主控读写器',
                    value: [reader.x, reader.y]
                })
            }
            // 获取标签信息
            try {
                await this.fetchTagInfo()
                this.locationChart.hideLoading()
            } catch (e) {
                console.log('Fetch tag failed')
            }
            this.refreshLocationInterval = setIntervalAsync(async () => {
                try {
                    // await this.fetchTagInfo()
                    this.locationChart.hideLoading()
                } catch (e) {
                    console.log('Fetch tag failed')
                }
            }, 3000)
        },
        watch: {
            tags: {
                'handler'() {
                    this.initLocationChart()

                }
            }
        },
        async 'destroyed'() {
            await clearIntervalAsync(this.refreshLocationInterval)
        }
    }
</script>

<style scoped>

    #location-container {
        height: 650px;
        border: #F2F2F2 solid 1px;
        border-radius: 5px;
        /*show background-image*/
        background-image: url(../assets/imgs/background-image.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
    }

    .firstStyle{
        background: #ffffff;
        border: #C8C8C8 solid 1px;
        padding: 8px;
    }

    #firstChart-container{
        height: 300px;
        background: #ffffff;
        padding-top: 25px;
        margin-left: 5px;
        border: #C8C8C8 solid 1px;
        border-radius: 5px;
        margin-top: 15px;
    }
    #secondChart-container{
        height: 300px;
        background: #ffffff;
        padding-top: 25px;
        margin-left: 5px;
        border: #C8C8C8 solid 1px;
        border-radius: 5px;
        margin-top: 15px;
    }

    .custom-tree-container{
        /*border: #818181 solid 2px;*/
        /*border-radius: 5px;*/
        width: 92%;
        margin-left: 5px;
    }

    .toolbar {
        padding: 5px;
        margin: 10px;
        display: inline;
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
</style>