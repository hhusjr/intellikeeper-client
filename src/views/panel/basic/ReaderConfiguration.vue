<template>
    <div>
<!--        <div class="toolbar">-->
<!--            <el-row :gutter="10">-->
<!--                <el-col :xs="10" :sm="6" :md="4" :lg="3" :xl="1">-->
<!--                    <el-button @click="getTableData" class="fill-btn el-icon-refresh" type="primary">刷新</el-button>-->
<!--                </el-col>-->
<!--                <el-col :xs="10" :sm="6" :md="4" :lg="3" :xl="1">-->
<!--                    <el-button @click="newTagDialog = true" class="fill-btn el-icon-plus" type="success">添加标签</el-button>-->
<!--                </el-col>-->
<!--            </el-row>-->
<!--        </div>-->


        <el-row :gutter="24">

            <el-col :span="24">
                <el-table
                        :data="tableData"
                        stripe>
                    <el-table-column
                            label="阅读器编号"
                            prop="tid"
                            sortable
                            width="250px">
                    </el-table-column>
                    <el-table-column
                            label="阅读器名"
                            prop="name"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="在线"
                            prop="is_online"
                            sortable
                            width="250px">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.is_online === -1">查询中</el-tag>
                            <el-tag type="success" v-if="scope.row.is_online === 1">在线</el-tag>
                            <el-tag type="info" v-if="scope.row.is_online === 0">离线</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="创建时间"
                            prop="created"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="动作"
                            prop="actions"
                            width="190px"
                            sortable>
                        <template slot-scope="scope">
                            <el-button size="mini" class="el-icon-edit" circle></el-button>
                            <el-button size="mini" type="danger" class="el-icon-delete" circle></el-button>
                            <el-button size="mini" type="success" class="el-icon-zoom-in" circle @click="findTag(scope.row.id)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>

<script>

    export default {
        name: 'BaseConfiguration',
        methods: {

        },
        'data'() {

            return {
                newTagDialog: false,
                TagSettingDialog: false,
                newTagData: {
                    name: ''
                },
                percentage: 0,
                curEditingId: -1,

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

<style scoped>
    .toolbar {
        padding: 5px;
        background: #d8d8d9;
    }
    .fill-btn {
        display: inline block;
        width: 100%;
    }
</style>