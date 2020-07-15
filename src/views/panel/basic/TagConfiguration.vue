<template>
    <div class="content-body">
        <div class="toolbar">
            <el-row :gutter="15">
                <el-col :span="3">
                    <el-button @click="getTableData" class="fill-btn el-icon-refresh" type="primary">刷新</el-button>
                </el-col>
                <el-col :span="3">
                    <el-button @click="category = 0" class="fill-btn el-icon-collection" type="success">显示所有
                    </el-button>
                </el-col>
            </el-row>
        </div>


        <el-row :gutter="24">

            <el-col :span="17">
                <el-table
                        :data="tableData"
                        stripe>
                    <el-table-column
                            label="#"
                            prop="tid"
                            sortable
                            width="80">
                    </el-table-column>
                    <el-table-column
                            label="标签名"
                            prop="name"
                            width="100"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="标签分类"
                            prop="category"
                            width="160"
                            sortable>
                        <template slot-scope="scope">
                            {{ scope.row.path ? scope.row.path : '无分类' }}
                            <el-button @click="setCategory(scope.row.id)" circle class="el-icon-setting"
                                       size="mini"></el-button>
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="安全保障"
                            prop="safemode"
                            width="100"
                            sortable>
                        <template slot-scope="scope">
                            <span v-if="scope.row.lightDetect">防撕</span>
                            <span v-if="scope.row.moveDetect">防移</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="检测"
                            prop="is_active"
                            sortable
                            width="100">
                        <template slot-scope="scope">
                            <el-tag @click="changeStatus(scope.row.id, false)" style="cursor: pointer;"
                                    type="success"
                                    v-if="scope.row.id !== curEditingId && scope.row.is_active">已激活
                            </el-tag>
                            <el-tag @click="changeStatus(scope.row.id, true)" style="cursor: pointer;"
                                    type="danger"
                                    v-if="scope.row.id !== curEditingId && !scope.row.is_active">未激活
                            </el-tag>
                            <el-tag type="primary" v-if="scope.row.id === curEditingId">切换中</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="在线"
                            prop="is_online"
                            sortable
                            width="100">
                        <template slot-scope="scope">
                            <el-tag type="success" v-if="scope.row.is_online">在线</el-tag>
                            <el-tag type="info" v-else>离线</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="创建时间"
                            prop="created"
                            width="250"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            label="动作"
                            prop="actions"
                            sortable
                            fixed="right"
                            width="150">
                        <template slot-scope="scope">
                            <el-button @click="openChangeTagDialog(scope.row)" circle class="el-icon-edit"
                                       size="mini"></el-button>
                            <el-button circle class="el-icon-delete" size="mini" type="danger"></el-button>
                            <el-button @click="findTag(scope.row.id)" circle class="el-icon-zoom-in" size="mini"
                                       type="success"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>

            <el-col :span="7">
                <div class="custom-tree-container">
                    <div class="block">
                        <p>
                            <el-input
                                    placeholder="过滤分类"
                                    v-model="filterText">
                            </el-input>
                        </p>

                        <el-tree
                                :data="treeData"
                                :expand-on-click-node="false"
                                default-expand-all
                                :filter-node-method="filterNode"
                                @node-click="handleNodeClick"
                                node-key="id"
                                ref="tree"
                        >
                            <span class="custom-tree-node" slot-scope="{ node, data }">
                                <span>
                                    <span class="el-icon-star-on" v-bind:style="{ color: data.color }"></span>
                                    {{ node.label }}
                                </span>
                                <span>
                                    <el-button
                                            @click="category = data.id"
                                            icon="el-icon-camera"
                                            size="mini"

                                            type="text">
                                    <!-- @click="() => append(data)">-->
                                    </el-button>
                                    <el-button
                                            @click="userAddCategory(data)"
                                            icon="el-icon-circle-plus-outline"
                                            size="mini"

                                            type="text">
                                    <!-- @click="() => append(data)">-->
                                    </el-button>
                                    <el-button
                                            @click="() => remove(node, data)"
                                            icon="el-icon-delete"
                                            size="mini"
                                            type="text">
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
            <el-form label-position="left" label-width="100px" ref="newBaseInfo" status-icon v-model="newTagCategory">
                <el-form-item label="分类名称" prop="name">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="newTagCategory.name"></el-input>
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
                <el-button @click="append" type="primary">确 定</el-button>
            </span>
        </el-dialog>

        <!--编辑标签弹框-->
        <el-dialog :visible.sync="changeTagDialog" title="编辑标签" width="32%">
            <el-form label-position="left" label-width="100px" status-icon v-model="changingTagData">
                <el-form-item label="标签名称" prop="name">
                    <el-input autocomplete="off" size="large" type="text"
                              v-model="changingTagData.name"></el-input>
                </el-form-item>
                <el-form-item label="防撕毁" prop="lightDetect">
                    <el-checkbox v-model="changingTagData.lightDetect"></el-checkbox>
                </el-form-item>
                <el-form-item label="不许移动" prop="accDetect">
                    <el-checkbox v-model="changingTagData.moveDetect"></el-checkbox>
                </el-form-item>
                <el-form-item label="静音模式" prop="muteMode">
                    <el-checkbox v-model="changingTagData.muteMode"></el-checkbox>
                </el-form-item>
            </el-form>

            <span class="dialog-footer" slot="footer">
                <el-button @click="changeTagDialog = false">取 消</el-button>
                <el-button @click="doChangeTag" type="primary">确 定</el-button>
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

        watch: {
            filterText(val) {
                this.$refs.tree.filter(val);
            },

            category() {
                this.getTableData()
            }
        },

        methods: {
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },

            handleNodeClick(data) {
                this.chosenCategoryId = data.id
            },

            open() {
                this.$message('这是一条消息提示')
            },

            userAddCategory(data) {
                this.TagSettingDialog = true
                this.targetData = data
            },

            // 树形图部分
            append() {
                let data = this.targetData

                this.TagSettingDialog = false

                let name = this.newTagCategory.name
                let colorStyle = this.colorStyle
                if (name.length === 0) {
                    this.$alert('分类名称为空')
                    return
                }

                api.post(urls.tagCategory, qs.stringify({
                    'name': name,
                    'color': colorStyle,
                    'parent_category': data.id ? data.id : null,
                    'device': localStorage.getItem('chosenDevice')
                })).then(() => {
                    this.getTreeView()
                }).catch(() => {
                    this.$alert('添加失败')
                })
            },

            remove(node, data) {
                const parent = node.parent
                const children = parent.data.children || parent.data
                const index = children.findIndex(d => d.id === data.id)
                children.splice(index, 1)
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
                        device: deviceId,
                        category: this.category
                    }
                }).then((response) => {
                    for (let item of response.data) {
                        this.tableData.push({
                            'id': item['id'],
                            'tid': item['tid'],
                            'name': item['name'],
                            'is_active': item['is_active'],
                            'created': moment(item['created']).format('YYYY-MM-DD HH:mm:ss'),
                            'is_online': item['is_online'],
                            'path': item['path'],
                            'moveDetect': item['move_detect_on'],
                            'lightDetect': item['light_detect_on'],
                            'muteMode': item['mute_mode_on']
                        })
                    }
                }).catch(() => {
                    this.$alert('表格数据加载失败，请重试！', '加载失败')
                })
            },

            'openChangeTagDialog'(tag) {
                this.changingTagData['id'] = tag.id
                this.changingTagData['name'] = tag.name
                this.changingTagData['lightDetect'] = tag.lightDetect
                this.changingTagData['moveDetect'] = tag.moveDetect
                this.changingTagData['muteMode'] = tag.muteMode
                this.changeTagDialog = true
            },

            'setCategory'(id) {
                let deviceId = localStorage.getItem('chosenDevice')
                api.patch(urls.tag + id + '/?device=' + deviceId, qs.stringify({
                    'category': this.chosenCategoryId
                })).then(() => {
                    this.$alert('设置成功！')
                    this.getTableData()
                }).catch(() => {
                    this.$alert('设置失败。')
                })
            },

            'doChangeTag'() {
                this.changeTagDialog = false
                let deviceId = localStorage.getItem('chosenDevice')
                const loading = this.$loading({
                    lock: true,
                    text: '处理中...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                })
                api.patch(urls.tag + this.changingTagData['id'] + '/?device=' + deviceId, qs.stringify({
                    'move_detect_on': this.changingTagData['moveDetect'],
                    'light_detect_on': this.changingTagData['lightDetect'],
                    'name': this.changingTagData['name']
                })).then(() => {
                    this.$alert('设置成功！如果此时设备未启用，设置将在设备下一次启用开始生效。')
                    this.getTableData()
                }).catch(() => {
                    this.$alert('设置失败。')
                }).finally(() => {
                    loading.close()
                })
            },

            async 'getTreeView'() {
                let deviceId = localStorage.getItem('chosenDevice')
                let edges = (await api.get(urls.tagCategory + '?device=' + deviceId)).data

                let idAttrMapping = {}
                let children = {}
                for (let vertex of edges) {
                    idAttrMapping[vertex.id] = {
                        'label': vertex.name,
                        'color': vertex.color,
                        'id': vertex.id,
                        'parentCategory': vertex['parent_category']
                    }
                    children[vertex.id] = []
                }
                let forestRoots = []
                for (let edge of edges) {
                    if (edge['parent_category'] == null) {
                        forestRoots.push(edge['id'])
                        continue
                    }
                    children[edge['parent_category']].push(edge['id'])
                }

                let dfs = (node) => {
                    let tmp = idAttrMapping[node]
                    tmp['children'] = []
                    for (let sub of children[node]) {
                        tmp['children'].push(dfs(sub))
                    }
                    return tmp
                }

                let tree = {
                    'label': '分类管理',
                    id: 0,
                    disabled: true,
                    children: []
                }

                for (let root of forestRoots) {
                    tree['children'].push(dfs(root))
                }

                this.treeData = [tree]
            }
        },
        'data'() {
            this.getTreeView()

            return {
                tableData: [],
                TagSettingDialog: false,
                changeTagDialog: false,
                changingTagData: {
                    id: -1,
                    name: '',
                    lightDetect: 0,
                    moveDetect: 0,
                    muteMode: 0
                },
                percentage: 0,
                curEditingId: -1,
                treeData: [{
                    'label': '分类管理',
                    id: 0,
                    disabled: true,
                    children: []
                }],
                newTagCategory: {
                    name: ''
                },
                targetData: null,
                colorStyle: '#000000',
                filterText: '',
                chosenCategoryId: null,
                category: 0
            }
        },
        created() {
            this.getTableData()
        }
    }
</script>

<style scoped>
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