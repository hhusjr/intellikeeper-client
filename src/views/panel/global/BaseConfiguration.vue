<template>
    <div class="content-body">

        <div class="toolbar">
            <el-row :gutter="15">
                <el-col :span="3">
                    <el-button @click="getTableData" class="fill-btn el-icon-refresh" type="primary">刷新</el-button>
                </el-col>
                <el-col :span="3">
                    <el-button @click="newBaseDialog = true" class="fill-btn el-icon-add-location" type="success">新增基站</el-button>
                </el-col>
            </el-row>
        </div>
        <el-table
                :data="tableData"
                stripe
                style="width: 100%">
            <el-table-column
                    label="基站编号"
                    prop="device_id"
                    sortable
                    width="100px">
            </el-table-column>
            <el-table-column
                    label="在线"
                    prop="is_online"
                    sortable
                    width="100px">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.is_online === -1">查询中</el-tag>
                    <el-tag type="success" v-if="scope.row.is_online">在线</el-tag>
                    <el-tag type="info" v-else>离线</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                    label="检测"
                    prop="is_active"
                    sortable
                    width="100px">
                <template slot-scope="scope">
                    <el-tag type="success" style="cursor: pointer;" v-if="scope.row.id !== curEditingId && scope.row.is_active" @click="changeStatus(scope.row.id, false)">已激活</el-tag>
                    <el-tag type="danger" style="cursor: pointer;" v-if="scope.row.id !== curEditingId && !scope.row.is_active" @click="changeStatus(scope.row.id, true)">未激活</el-tag>
                    <el-tag type="primary" v-if="scope.row.id === curEditingId">切换中</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                    label="基站名"
                    prop="name"
                    sortable>
            </el-table-column>
            <el-table-column
                    label="基站位置"
                    prop="location"
                    sortable>
            </el-table-column>
            <el-table-column
                    label="创建时间"
                    prop="created"
                    sortable>
            </el-table-column>
            <el-table-column
                    label="动作"
                    prop="actions"
                    width="90px"
                    sortable>
                <el-button size="mini" class="el-icon-edit" circle></el-button>
                <el-button size="mini" type="danger" class="el-icon-delete" circle></el-button>
            </el-table-column>
        </el-table>

        <el-dialog
                :visible.sync="newBaseDialog"
                title="新增基站"
                width="30%">
            <el-form v-model="newBaseData" label-position="left" label-width="100px" ref="newBaseInfo" status-icon>
                <el-form-item label="基站编号" prop="uid">
                    <el-input autocomplete="off" size="large" type="digit"
                              v-model="newBaseData.deviceId"></el-input>
                </el-form-item>
                <el-form-item label="基站名称" prop="name">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="newBaseData.name"></el-input>
                </el-form-item>
                <el-form-item label="基站位置" prop="location">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="newBaseData.location"></el-input>
                </el-form-item>
            </el-form>
            <span class="dialog-footer" slot="footer">
                <el-button @click="newBaseDialog = false">取 消</el-button>
                <el-button type="primary" @click="doAddBase">确 定</el-button>
            </span>
        </el-dialog>


        <el-dialog
                :visible.sync="verifyingConnectionDialog"
                title="创建中..."
                width="220px">
            <el-progress type="circle" :percentage="percentage" status="warning"></el-progress>
        </el-dialog>
    </div>
</template>

<script>
    import api from '@/api/api'
    import urls from '@/api/urls'
    import qs from 'qs'
    import moment from 'moment'

    export default {
        name: 'BaseConfiguration',
        methods: {
            'changeStatus'(id, newStatus) {
                this.curEditingId = id
                api.put(urls.device + id + '/change-status/', qs.stringify({
                    new_status: newStatus
                })).then((response) => {
                    if (!response.data.success) {
                        this.$alert('未能切换设备状态，请检查设备是否已经配网成功并开启。', '操作失败')
                        return
                    }
                    this.getTableData()
                }).catch(() => {
                    this.$alert('操作失败，请重试', '操作失败')
                }).finally(() => {
                    this.curEditingId = -1
                })
            },
            'getTableData'() {
                this.tableData = []
                api.get(urls.device).then((response) => {
                    for (let item of response.data) {
                        this.tableData.push({
                            'id': item['id'],
                            'device_id': item['device_id'],
                            'name': item['name'],
                            'created': moment(item['created']).format('YYYY-MM-DD HH:mm:ss'),
                            'location': item['location'],
                            'is_active': item['is_active'],
                            'is_online': item['is_online']
                        })
                    }
                }).catch(() => {
                    this.$alert('表格数据加载失败，请重试！', '加载失败')
                })
            },

            'resetForm'() {
                this.$refs['newBaseInfo'].resetForm()
            },

            'doAddBase'() {
                this.newBaseDialog = false
                this.verifyingConnectionDialog = true
                this.percentage = 0
                let counter = window.setInterval(() => {
                    this.percentage++
                }, 100);

                api.post(urls.device, qs.stringify({
                    device_id: this.newBaseData.deviceId,
                    name: this.newBaseData.name,
                    location: this.newBaseData.location
                })).then(() => {
                    this.verifyingConnectionDialog = false
                    this.getTableData()
                    window.clearInterval(counter)
                }).catch((response) => {
                    this.$alert(response['device_id'][0])
                    window.clearInterval(counter)
                    this.verifyingConnectionDialog = false
                    this.newBaseDialog = true
                })
            }
        },
        'data'() {
            return {
                tableData: [],
                newBaseDialog: false,
                newBaseData: {
                    deviceId: '',
                    name: '',
                    location: ''
                },
                verifyingConnectionDialog: false,
                percentage: 0,
                curEditingId: -1
            }
        },
        created() {
            this.getTableData()
        }
    }
</script>
