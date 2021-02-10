<template>
    <div>
        <p>
            <el-input
                    placeholder="过滤"
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
                    <span v-if="data.type === 'base'" class="el-icon-box"></span>
                    <span v-if="data.type === 'tag'" class="el-icon-paperclip"></span>
                    <span v-if="data.type === 'global'" class="el-icon-user"></span>
                    <span v-if="data.type === 'category'" class="el-icon-star-on" v-bind:style="{ color: data.color }"></span>
                    {{ node.label }}
                </span>
            </span>
        </el-tree>
    </div>
</template>

<script>
    import api from '@/api/api'
    import urls from '@/api/urls'

    export default {
        name: 'ClassifiedTags',

        methods: {
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },

            handleNodeClick(data) {
                this.$emit('nodeClick', data)
            }
        },

        props: {
            showAllDevices: {
                type: Boolean,
                default: false
            }
        },

        watch: {
            filterText(val) {
                this.$refs.tree.filter(val);
            },
        },

        async created() {
            let url = urls.tag + 'classified/'
            if (this.showAllDevices) {
                let deviceId = localStorage.getItem('chosenDevice')
                url += '?device=' + deviceId
            }
            let edges = (await api.get(url)).data

            let idAttrMapping = {}
            let children = {}
            for (let vertex of edges) {
                idAttrMapping[vertex.id] = {
                    'label': vertex.name,
                    'color': vertex.color,
                    'id': vertex.id,
                    'parentCategory': vertex['parent_category'],
                    'tags': vertex.tags,
                    'type': 'category'
                }
                children[vertex.id] = []
            }
            let devices = {}
            let device = null
            let deviceMapping = {}
            for (let edge of edges) {
                deviceMapping[edge['device']['id']] = edge['device']
                if (edge['parent_category'] == null) {
                    device = edge['device']['id']
                    if (!(device in devices)) {
                        devices[device] = []
                    }
                    devices[device].push(edge['id'])
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
                for (let tag of tmp['tags']) {
                    tmp['children'].push({
                        'type': 'tag',
                        'id': tag['id'],
                        'label': tag['name']
                    })
                }
                return tmp
            }

            let createDeviceNode = (deviceId) => {
                let device = deviceMapping[deviceId]
                let tree = {
                    label: device['name'],
                    type: 'base',
                    id: device['id'],
                    disabled: true,
                    children: []
                }

                for (let root of devices[deviceId]) {
                    tree['children'].push(dfs(root))
                }

                return tree
            }

            //console.log(this.showAllDevices)
            if (!this.showAllDevices) {
                if (device) {
                    this.treeData = [createDeviceNode(device)]
                }
                return
            }

            let tree = {
                label: '用户区块',
                type: 'global',
                id: 0,
                disabled: true,
                children: []
            }
            for (let device in devices) {
                tree.children.push(createDeviceNode(device))
            }
            //console.log(tree)

            this.treeData = [tree]
        },

        data() {
            return {
                filterText: '',
                treeData: [{
                    'label': '分类',
                    id: 0,
                    disabled: true,
                    children: []
                }],
            }
        }
    }
</script>

<style scoped>

</style>