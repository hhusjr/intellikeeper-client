<template>
    <div class="content-body">
        <div class="toolbar">
            <el-row :gutter="15">
                <el-col :span="5">
                    <el-button class="fill-btn el-icon-guide" type="success" @click="testCallback">触发器联调测试</el-button>
                </el-col>
            </el-row>
        </div>
        <el-row :gutter="20">
            <el-col :span="6" style="padding: 0 20px 20px;">
                <ClassifiedTags :show-all-devices="true" v-on:nodeClick="handleNodeClick"></ClassifiedTags>
            </el-col>
            <el-col :span="18" style="padding: 20px;">
                <el-alert
                        title="触发器具有向上冒泡能力，当子节点异常，将会触发其本身的触发器以及所有父节点的触发器"
                        type="success"
                        style="margin-bottom: 20px">
                </el-alert>
                <div class="transfer-outer">
                    <el-transfer v-model="usedTriggers" filterable :data="triggers" :titles="['所有触发器', '选中触发器']" @change="changeTrigger"></el-transfer>
                </div>
            </el-col>
        </el-row>

        <el-dialog
                title="触发器联调测试"
                :visible.sync="showTestCallback"
                width="30%">
            <el-alert title="测试触发器联动调用配置是否正确"></el-alert>
            <p>请选择一个标签。系统将根据您定义的事件绑定规则调用您设定的触发器，您可以检查调用是否成功。</p>
            <ClassifiedTags v-on:nodeClick="handleTestLabelClick"></ClassifiedTags>
            <span slot="footer" class="dialog-footer">
                <el-button @click="testDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmTest">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<style scoped>
    .transfer-outer {
        display: flex;
        justify-content: center;
    }
</style>

<script>
    import api from '@/api/api'
    import urls from '@/api/urls'
    import * as qs from 'qs'
    import ClassifiedTags from '@/components/ClassifiedTags'

    export default {
        name: 'CallbackConfiguration',
        components: {ClassifiedTags},
        'data'() {
            return {
                triggers: [],
                usedTriggers: [],
                scope: 1,
                target: 0,
                showTestCallback: false,
                chosenTagId: -1,
            }
        },
        methods: {
            'handleTestLabelClick'(data) {
                if (data['type'] === 'tag') {
                    this.chosenTagId = data.id
                }
            },

            'testCallback'() {
                this.showTestCallback = true
            },

            'confirmTest'() {
                this.showTestCallback = false
                let loading = this.$loading({
                    lock: true,
                    text: '处理中...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                })
                api.get(urls.tag + this.chosenTagId + '/test-callback/').then(() => {
                    this.$alert('请检查联调结果。', '操作成功！')
                }).catch(() => {
                    this.$alert('处理失败，请重试！', '处理失败')
                }).finally(() => {
                    loading.close()
                })
            },

            'getTriggers'() {
                api.get(urls.trigger).then((response) => {
                    let rawTriggers = response.data
                    let triggers = []
                    for (let trigger of rawTriggers) {
                        triggers.push({
                            key: trigger['id'],
                            label: trigger['name']
                        })
                    }
                    this.triggers = triggers
                })
            },

            'handleNodeClick'(data) {
                let scopeMapping = {
                    'global': 1,
                    'base': 2,
                    'category': 3,
                    'tag': 4
                }
                this.scope = scopeMapping[data.type]
                this.target = data.id
                this.getUsedTriggers()
            },

            'getUsedTriggers'() {
                let usedTriggers = []
                api.get(urls.trigger + 'used/?scope=' + this.scope + '&target=' + this.target).then((response) => {
                    for (let trigger of response.data) {
                        usedTriggers.push(trigger['id'])
                    }
                    this.usedTriggers = usedTriggers
                })
            },

            'changeTrigger'(origin, dir, changed) {
                let url = urls.trigger + 'used/?scope=' + this.scope + '&target=' + this.target
                if (dir === 'right') {
                    for (let trigger of changed) {
                        api.post(url, qs.stringify({
                            trigger: trigger
                        }))
                    }
                } else if (dir === 'left') {
                    for (let trigger of changed) {
                        api.delete(url, {
                            data: qs.stringify({
                                trigger: trigger
                            })
                        })
                    }
                }
            }
        },
        created() {
            this.getTriggers()
            this.getUsedTriggers()
        },
    }
</script>
