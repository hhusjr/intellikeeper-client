<template>
    <div>
        <div id="location-container"></div>
    </div>
</template>

<style scoped>
    #location-container {
        height: 400px;
    }
</style>

<script>
    import echarts from 'echarts'
    import urls from '@/api/urls'
    import api from '@/api/api'
    import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/fixed'

    export default {
        name: 'RemoteMonitor',
        'data'() {
            return {
                readers: [],
                tags: [],
                locationChart: null,
                deviceId: 0,
                refreshLocationInterval: null,
            }
        },
        methods: {
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
            this.locationChart = echarts.init(document.getElementById('location-container'))
            this.locationChart.showLoading()
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
                    await this.fetchTagInfo()
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
