<template>
    <div>
        <div class="toolbar">
            <el-row :gutter="10">
                <el-col :xs="10" :sm="6" :md="4" :lg="3" :xl="1">
                    <el-button @click="getTableData" class="fill-btn el-icon-refresh" type="primary">刷新</el-button>
                </el-col>
                <el-col :xs="10" :sm="6" :md="4" :lg="3" :xl="1">
                    <el-button @click="newTagDialog = true" class="fill-btn el-icon-plus" type="success">添加标签</el-button>
                </el-col>
            </el-row>
        </div>
        <el-table
                :data="tableData"
                stripe
                style="width: 100%">
            <el-table-column
                    label="标签编号"
                    prop="tid"
                    sortable
                    width="100px">
            </el-table-column>
            <el-table-column
                    label="激活"
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
                    label="创建时间"
                    prop="created"
                    sortable>
            </el-table-column>
            <el-table-column
                    label="动作"
                    prop="actions"
                    width="150px"
                    sortable>
                <template slot-scope="scope">
                    <el-button size="mini" class="el-icon-edit" circle></el-button>
                    <el-button size="mini" type="danger" class="el-icon-delete" circle></el-button>
                    <el-button size="mini" type="success" class="el-icon-zoom-in" circle @click="findTag(scope.row.id)"></el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog
                :visible.sync="newTagDialog"
                title="新增标签"
                width="30%">
            <el-form v-model="newTagData" label-position="left" label-width="100px" ref="newBaseInfo" status-icon>
                <el-form-item label="标签名称" prop="name">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="newTagData.name"></el-input>
                </el-form-item>
            </el-form>
            <el-container>
                <p>请确保所选基站处于开启状态，然后开启新标签，并将新标签靠近基站。</p>
            </el-container>
            <span class="dialog-footer" slot="footer">
                <el-button @click="newTagDialog = false">取 消</el-button>
                <el-button type="primary" @click="doAddTag">确 定</el-button>
            </span>
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
            'findTag'(id) {
                this.$alert('所选标签将会发出"滴滴"响声。', '操作成功')
                api.get(urls.tag + id + '/find-tag/').then()
            },
            'changeStatus'(id, newStatus) {
                this.curEditingId = id
                api.put(urls.tag + id + '/change-status/', qs.stringify({
                    new_status: newStatus
                })).then((response) => {
                    if (!response.data.success) {
                        this.$alert('未能切换标签状态，请检查设备是否已经配网成功并开启。', '操作失败')
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
                    this.$alert('表格数据加载失败，请重试！', '加载失败')
                })
            },

            'doAddTag'() {
                this.newTagDialog = false
                this.percentage = 0

                api.post(urls.tag, qs.stringify({
                    name: this.newTagData.name,
                    device: localStorage.getItem('chosenDevice')
                })).then(() => {
                    this.getTableData()
                }).catch((response) => {
                    this.$alert(response.tid[0])
                    this.newTagDialog = true
                })
            }
        },
        'data'() {
            return {
                tableData: [],
                newTagDialog: false,
                newTagData: {
                    name: ''
                },
                percentage: 0,
                curEditingId: -1
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
        display: block;
        width: 100%;
    }
</style>