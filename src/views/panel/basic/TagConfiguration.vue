<template>
    <div>
        <div class="toolbar">
            <el-row :gutter="15">
                <el-col :span="3">
                    <el-button @click="getTableData" class="fill-btn el-icon-refresh" type="primary">刷新</el-button>
                </el-col>
                <el-col :span="3">
                    <el-button @click="newTagDialog = true" class="fill-btn el-icon-plus" type="success">添加标签</el-button>
                </el-col>
            </el-row>
        </div>


        <el-row :gutter="24">

            <el-col :span="17">
                <el-table
                        :data="tableData"
                        stripe>
                    <el-table-column
                            label="标签编号"
                            prop="tid"
                            sortable
                            width="100px">
                    </el-table-column>
                    <el-table-column
                            label="标签名"
                            prop="name"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="标签分类"
                            prop="category"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="防盗模式"
                            prop="safemode"
                            sortable>
                        <template slot-scope="scope">
                            {{ scope.row.modeType }}
                        </template>
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
                            <el-button size="mini" class="el-icon-edit" circle @click="openChangeTagDialog(scope.row.id)"></el-button>
                            <el-button size="mini" type="danger" class="el-icon-delete" circle></el-button>
                            <el-button size="mini" type="success" class="el-icon-zoom-in" circle @click="findTag(scope.row.id)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>

            <el-col :span="7">
                <div class="custom-tree-container">
                    <div class="block">
                        <el-tree
                            :data="data"
                            node-key="id"
                            default-expand-all>
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                        <span >
                            <span v-bind:style="{ color: data.color }" class="el-icon-star-on"></span>
                            {{ node.label }}
                        </span>
                        <span>

                            <el-button
                                type="text"
                                size="mini"
                                icon="el-icon-circle-plus-outline"

                                @click="userAddCategory(data)">
                            <!-- @click="() => append(data)">-->
                            </el-button>
                            <el-button
                                type="text"
                                size="mini"
                                icon="el-icon-delete"
                                @click="() => remove(node, data)">
                            </el-button>
                        </span>
                    </span>
                        </el-tree>
                    </div>
                </div>
            </el-col>
        </el-row>

        <div class="TagControlPanel"></div>

        <!--添加分类弹框-->
        <el-dialog :visible.sync="TagSettingDialog" title="分类设置" width="25%">
            <el-form v-model="newTagSetting" label-position="left" label-width="100px" ref="newBaseInfo" status-icon>
                <el-form-item label="分类名称" prop="name">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="newTagSetting.name"></el-input>
                </el-form-item>

                <el-form-item label="选择颜色" prop="name">
                    <el-color-picker v-model="colorStyle"></el-color-picker>
                </el-form-item>

            </el-form>
            <el-container>
                <p>请输入正确的分类名称并选择颜色</p>
            </el-container>
            <span class="dialog-footer" slot="footer">
<!--                <el-button @click="TagSettingDialog = false">取 消</el-button>-->
                <el-button type="primary" @click="append">确 定</el-button>
            </span>
        </el-dialog>

        <!--添加标签弹框-->
        <el-dialog :visible.sync="newTagDialog" title="新增标签" width="32%">
            <el-form v-model="newTagData" label-position="left" label-width="100px" ref="newBaseInfo" status-icon>
                <el-form-item label="标签名称" prop="name">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="newTagData.name"></el-input>
                </el-form-item>
                <p>请确保所选基站处于开启状态，开启新标签，并将新标签靠近基站。</p>
                <el-form-item label="防盗模式" prop="name">
                    <el-radio-group v-model="newTagData.modeType">
                        <el-radio-button label="普通模式"></el-radio-button>
                        <el-radio-button label="请勿移动"></el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <p style="color: #909399">普通模式: 标签激活状态下，物品位移较大,信号丢失会被纳入被盗范围</p>
                <p style="color: #F56C6C">请勿移动: 移动物品、暴力破坏物品、物品掉落等均会被纳入被盗范围</p>
            </el-form>

            <span class="dialog-footer" slot="footer">
                <el-button @click="newTagDialog = false">取 消</el-button>
                <el-button type="primary" @click="doAddTag">确 定</el-button>
            </span>
        </el-dialog>

        <!--编辑标签弹框-->
        <el-dialog :visible.sync="changeTagDialog" title="编辑标签" width="32%">
            <el-form v-model="changingTagData" label-position="left" label-width="100px" status-icon>
                <el-form-item label="标签名称" prop="name">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="changingTagData.name"></el-input>
                </el-form-item>
                <el-form-item label="防盗模式" prop="name">
                    <el-radio-group v-model="changingTagData.modeType">
                        <el-radio-button label="普通模式"></el-radio-button>
                        <el-radio-button label="请勿移动"></el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <p style="color: #909399">普通模式: 标签激活状态下，物品位移较大,信号丢失会被纳入被盗范围</p>
                <p style="color: #F56C6C">请勿移动: 移动物品、暴力破坏物品、物品掉落等均会被纳入被盗范围</p>
            </el-form>

            <span class="dialog-footer" slot="footer">
                <el-button @click="changeTagDialog = false">取 消</el-button>
                <el-button type="primary" @click="doChangeTag">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import api from '@/api/api'
    import urls from '@/api/urls'
    import qs from 'qs'
    import moment from 'moment'

    let id = 1000;

    export default {
        name: 'BaseConfiguration',
        methods: {

            open() {
                this.$message('这是一条消息提示');
            },

            userAddCategory(data) {
                this.TagSettingDialog = true
                this.targetData = data
            },

            // 树形图部分
            append() {
                let data = this.targetData

                // 这里最开始弹框的数据为空 导致每次获取名称都会晚
                this.TagSettingDialog = false

                let name = this.newTagSetting.name
                let colorStyle = this.colorStyle
                if(name === '')name = '标签名称为空!'

                const newChild = { id: id++, label: name, children: [], color: colorStyle };
                if (!data.children) {
                    this.$set(data, 'children', []);
                }

                data.children.push(newChild);

                // this.TagSettingDialog = false
            },

            remove(node, data) {
                const parent = node.parent;
                const children = parent.data.children || parent.data;
                const index = children.findIndex(d => d.id === data.id);
                children.splice(index, 1);
            },
            //树形图部分



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
                    // this.$alert('操作失败，请重试', '操作失败')
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
                    // this.$alert('表格数据加载失败，请重试！', '加载失败')
                })
            },
            'doAddTag'() {
                this.newTagDialog = false
                this.percentage = 0
                this.tableData.push({
                    'id': 0,
                    'tid': 0,
                    'name': this.newTagData.name,
                    'modeType': this.newTagData.modeType,
                    'is_active': 1,
                    'created': '09-01 21:22',
                    'is_online': 1
                })
                /*
                api.post(urls.tag, qs.stringify({
                    name: this.newTagData.name,
                    device: localStorage.getItem('chosenDevice')
                })).then(() => {
                    this.getTableData()
                }).catch((response) => {
                    this.$alert(response.tid[0])
                    this.newTagDialog = true
                })

                 */
            },

            'getIndexById'(id) {
                for (let index in this.tableData) {
                    if (this.tableData[index].id == id) {
                        return index
                    }
                }
            },

            'openChangeTagDialog'(id) {
                let index = this.getIndexById(id)
                let tag = this.tableData[index]
                this.changingTagData['id'] = tag.id
                this.changingTagData['name'] = tag.name
                this.changingTagData['modeType'] = tag.modeType
                this.changeTagDialog = true
            },

            'doChangeTag'() {
                this.changeTagDialog = false
                let index = this.getIndexById(this.changingTagData['id'])
                this.$set(this.tableData, index, {
                    'name': this.changingTagData['name'],
                    'modeType': this.changingTagData['modeType'],
                    'tid': 0,
                    'is_active': 1,
                    'created': '09-01 21:22',
                    'is_online': 1
                })
            }
        },
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
                        label: '分区A',
                        children: [{
                            id: 12,
                            color: '#000000',
                            label: '标签A'
                        }]
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
                tableData: [],
                newTagDialog: false,
                TagSettingDialog: false,
                changeTagDialog: false,
                newTagData: {
                    name: '',
                    modeType: ''
                },
                changingTagData: {
                    id: -1,
                    name: '',
                    modeType: ''
                },
                percentage: 0,
                curEditingId: -1,
                data: JSON.parse(JSON.stringify(data)),
                newTagSetting: {
                    name: ''
                },
                targetData: null,
                colorStyle: '#000000',
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
    .custom-tree-container {
        padding: 14px;
    }
</style>