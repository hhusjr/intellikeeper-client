<template>
    <div class="content-body">
        <div class="toolbar">
            <el-row :gutter="15">
                <el-col :span="3">
                    <el-button @click="getTableData" class="fill-btn el-icon-refresh" type="primary">刷新</el-button>
                </el-col>
            </el-row>
        </div>
        <el-row :gutter="20">
            <el-col :span="24">
                <el-table
                        :data="tableData"
                        stripe
                        style="width: 100%">
                    <el-table-column
                            label="事件名称"
                            prop="name"
                            sortable
                            width="200px">
                    </el-table-column>
                    <el-table-column
                            label="发生时间"
                            prop="created"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="原因"
                            prop="causedBy"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="标签路径"
                            width="250px"
                            sortable>
                        <template slot-scope="scope">
                            {{ scope.row.tag.path }}/{{ scope.row.tag.name }}
                        </template>
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

    export default {
        name: 'WarningRecord',

        methods: {
            'getTableData'() {
                this.tableData = []
                let deviceId = localStorage.getItem('chosenDevice')
                api.get(urls.event, {
                    params: {
                        device: deviceId,
                    }
                }).then((response) => {
                    for (let item of response.data) {
                        this.tableData.push({
                            'id': item['id'],
                            'name': item['name'],
                            'tag': item['tag'],
                            'causedBy': item['caused_by'],
                            'created': moment(item['created']).format('YYYY-MM-DD HH:mm:ss'),
                        })
                    }
                }).catch(() => {
                    this.$alert('表格数据加载失败，请重试！', '加载失败')
                })
            },
        },

        created() {
            this.getTableData()
        }
    }
</script>
