<template>
    <div>
        <div class="toolbar">
            <el-row :gutter="10">
                <el-col :xs="10" :sm="6" :md="4" :lg="3" :xl="1">
                    <el-button @click="getTableData" class="fill-btn el-icon-refresh" type="primary">刷新</el-button>
                </el-col>
                <el-col :xs="10" :sm="6" :md="4" :lg="3" :xl="1">
                    <el-button @click="newTriggerDialog = true" class="fill-btn el-icon-add-location" type="success">新增触发器</el-button>
                </el-col>
            </el-row>
        </div>
        <el-table
                :data="tableData"
                stripe
                style="width: 100%">
            <el-table-column
                    label="编号"
                    prop="id"
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
                    label="触发器名"
                    prop="name"
                    sortable>
            </el-table-column>
            <el-table-column
                    label="回调地址"
                    sortable>
                <template slot-scope="scope">
                    <span>{{ scope.row.callbackProtocol }}://{{ scope.row.callbackUrl }}</span>
                    <el-tag size="mini">{{ methods[scope.row.callbackMethod] }}</el-tag>
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
                    width="150px"
                    sortable>
                <template slot-scope="scope">
                    <el-button size="mini" class="el-icon-edit" circle></el-button>
                    <el-button size="mini" type="danger" class="el-icon-delete" circle></el-button>
                    <el-button size="mini" type="success" v-if="scope.row.is_active" class="el-icon-guide" circle @click="showTestDialog(scope.row.id)"></el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog
                :visible.sync="newTriggerDialog"
                title="新增触发器"
                width="50%">
            <TriggerCustomize ref="triggerCustomize"></TriggerCustomize>
            <span class="dialog-footer" slot="footer">
                <el-button @click="newTriggerDialog = false">取 消</el-button>
                <el-button type="primary" @click="doAddBase">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="测试触发器"
                :visible.sync="testDialogVisible"
                width="30%">
            <span>测试触发器是否工作正常。请选择一个标签，测试该标签丢失后触发该触发器的情况。</span>
            <el-tree :data="classifiedTags" @node-click="handleNodeClick"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="testDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmNodeClick">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import api from '@/api/api'
    import urls from '@/api/urls'
    import qs from 'qs'
    import moment from 'moment'
    import TriggerCustomize from '@/components/TriggerCustomize'

    export default {
        name: 'BaseConfiguration',
        components: {
            'TriggerCustomize': TriggerCustomize
        },
        methods: {
            'changeStatus'(id, newStatus) {
                this.curEditingId = id
                api.put(urls.trigger + id + '/change-status/', qs.stringify({
                    new_status: newStatus
                })).then(() => {
                    this.getTableData()
                }).catch(() => {
                    this.$alert('操作失败，请重试', '操作失败')
                }).finally(() => {
                    this.curEditingId = -1
                })
            },
            'getTableData'() {
                this.tableData = []
                api.get(urls.trigger).then((response) => {
                    for (let item of response.data) {
                        this.tableData.push({
                            'id': item['id'],
                            'name': item['name'],
                            'created': moment(item['created']).format('YYYY-MM-DD HH:mm:ss'),
                            'is_active': item['is_active'],
                            'callbackUrl': item['callback_url'],
                            'callbackProtocol': item['callback_protocol'],
                            'callbackParams': JSON.parse(item['callback_params']),
                            'callbackHeaders': JSON.parse(item['callback_headers']),
                            'callbackMethod': item['callback_method']
                        })
                    }
                }).catch(() => {
                    this.$alert('表格数据加载失败，请重试！', '加载失败')
                })
            },

            'handleNodeClick'(data) {
                if ('tid' in data) {
                    this.chosenTagId = data.id
                }
            },

            'confirmNodeClick'() {
                this.testDialogVisible = false
                let chosenTagId = this.chosenTagId
                let chosenTriggerId = this.chosenTriggerId
                if (chosenTagId === -1 || chosenTriggerId === -1) {
                    this.$alert('请选择一个标签和触发器', '操作失败')
                    this.testDialogVisible = true
                    return
                }
                this.chosenTagId = -1
                this.chosenTriggerId = -1

                api.get(urls.trigger + chosenTriggerId + '/test-trigger/?tag=' + chosenTagId).then(() => {
                    this.$alert('请检查触发结果。', '操作成功！')
                }).catch(() => {
                    this.$alert('处理失败，请重试！', '处理失败')
                })
            },

            'showTestDialog'(id) {
                this.testDialogVisible = true
                this.chosenTriggerId = id
            },

            'resetForm'() {
                this.$refs['newBaseInfo'].resetForm()
            },

            'doAddBase'() {
                let data = this.$refs['triggerCustomize'].getData()

                api.post(urls.trigger, qs.stringify(data)).then(() => {
                    this.$alert('触发器添加成功', '操作成功')
                    this.newTriggerDialog = false
                    this.getTableData()
                }).catch(() => {
                    this.$alert('触发器添加失败', '操作失败')
                })
            }
        },
        'data'() {
            return {
                tableData: [],
                testDialogVisible: false,
                classifiedTags: [],
                chosenTagId: -1,
                chosenTriggerId: -1,
                methods: {
                    1: 'GET',
                    2: 'POST',
                    3: 'PUT'
                },
                newTriggerDialog: false,
                percentage: 0,
                curEditingId: -1
            }
        },
        created() {
            this.getTableData()

            api.get(urls.tag + 'classified/').then((response) => {
                let treeStructure = [{
                    label: '我的基站',
                    children: []
                }]
                for (let device_id in response.data['tags']) {
                    if (!Object.prototype.hasOwnProperty.call(response.data['tags'], device_id)) {
                        continue
                    }
                    let node = {
                        label: response.data.devices[device_id].name,
                        children: []
                    }
                    treeStructure[0].children.push(node)
                    for (let tag of response.data['tags'][device_id]) {
                        node.children.push({
                            label: tag.name,
                            tid: tag.tid,
                            id: tag.id
                        })
                    }
                }
                this.classifiedTags = treeStructure
            })
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