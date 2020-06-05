<template>
    <el-row :gutter="20">
        <el-col :span="6" style="padding: 20px;">
            <el-tree :data="classifiedTags" @node-click="handleNodeClick"></el-tree>
        </el-col>
        <el-col :span="18" style="padding: 20px;">
            <div class="transfer-outer">
                <el-transfer v-model="usedTriggers" filterable :data="triggers" :titles="['所有触发器', '选中触发器']" @change="changeTrigger"></el-transfer>
            </div>
        </el-col>
    </el-row>
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

    export default {
        name: 'CallbackConfiguration',
        'data'() {
            return {
                classifiedTags: [],
                triggers: [],
                usedTriggers: [],
                scope: 1,
                target: 0
            }
        },
        methods: {
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
                this.scope = data.scope
                this.target = data.target
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
            api.get(urls.tag + 'classified/').then((response) => {
                let treeStructure = [{
                    label: '我的基站',
                    children: [],
                    scope: 1,
                    target: 0
                }]
                for (let device_id in response.data['tags']) {
                    if (!Object.prototype.hasOwnProperty.call(response.data['tags'], device_id)) {
                        continue
                    }
                    let node = {
                        label: response.data.devices[device_id].name,
                        children: [],
                        scope: 2,
                        target: device_id
                    }
                    treeStructure[0].children.push(node)
                    for (let tag of response.data['tags'][device_id]) {
                        node.children.push({
                            label: tag.name,
                            scope: 3,
                            target: tag.id
                        })
                    }
                }
                this.classifiedTags = treeStructure
            })

            this.getTriggers()
            this.getUsedTriggers()
        },
    }
</script>
