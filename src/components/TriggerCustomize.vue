<template>
    <el-form label-position="left" label-width="100px" ref="newBaseInfo" status-icon>
        <el-form-item label="触发器名" prop="name">
            <el-input autocomplete="off" size="large" type="text"
                      v-model="name"></el-input>
        </el-form-item>
        <el-form-item label="触发器选项" prop="location">
            <div>
                <div>
                    <p>常见模板</p>
                    <div>
                        <el-tag :key="label[0]" @click="useTemplate(label[1])" class="label"
                                v-for="label in templateHelpers">
                            {{ label[0] }}
                        </el-tag>
                    </div>
                </div>
                <el-divider></el-divider>
                <el-form label-position="top">
                    <el-form-item label="回调URL" placeholder="请求网址">
                        <el-input v-model="requestUrl">
                            <el-select slot="prepend" style="width: 120px;" v-model="requestProtocol">
                                <el-option
                                        key="http"
                                        label="http://"
                                        value="http">
                                </el-option>
                                <el-option
                                        key="https"
                                        label="https://"
                                        value="https">
                                </el-option>
                                <el-option
                                        key="intellikeeper"
                                        label="内部调用"
                                        value="intellikeeper">
                                </el-option>
                            </el-select>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="回调参数（请求主体中）">
                        <el-row :gutter="20" :key="i" v-for="(param, i) in params" v-model="params[i]">
                            <el-col :span="10">
                                <el-input placeholder="参数名" v-model="params[i].key"></el-input>
                            </el-col>
                            <el-col :span="10">
                                <el-input placeholder="参数值" v-model="params[i].val"></el-input>
                            </el-col>
                            <el-col :span="4">
                                <el-button @click="params.push({ key: '', val: '' })" class="el-icon-plus"></el-button>
                            </el-col>
                        </el-row>
                    </el-form-item>
                    <el-form-item label="Header">
                        <el-row :gutter="20" :key="i" v-for="(header, i) in headers" v-model="headers[i]">
                            <el-col :span="10">
                                <el-input placeholder="名称" v-model="headers[i].key"></el-input>
                            </el-col>
                            <el-col :span="10">
                                <el-input placeholder="值" v-model="headers[i].val"></el-input>
                            </el-col>
                            <el-col :span="4">
                                <el-button @click="headers.push({ key: '', val: '' })" class="el-icon-plus"></el-button>
                            </el-col>
                        </el-row>
                    </el-form-item>
                    <el-form-item label="请求类型">
                        <el-select v-model="requestMethod">
                            <el-option
                                    :key="1"
                                    :value="1"
                                    label="GET">
                            </el-option>
                            <el-option
                                    :key="2"
                                    :value="2"
                                    label="POST">
                            </el-option>
                            <el-option
                                    :key="3"
                                    :value="3"
                                    label="PUT">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="可用标签（指针停留在标签处查看详情）">
                        <el-tag :key="label[0]" :title="label[1]" class="label" v-for="label in availableLabels">
                            {% {{ label[0] }} %}
                        </el-tag>
                    </el-form-item>
                </el-form>
            </div>
        </el-form-item>
    </el-form>
</template>

<style scoped>
    .label {
        margin: 2px;
        cursor: pointer;
    }
</style>

<script>
    export default {
        name: 'TriggerCustomize',
        methods: {
            async 'useTemplate'(config) {
                let syncParams = [config.params, config.headers]
                for (let syncParam of syncParams) {
                    for (let i = 0; i < syncParam.length; i++) {
                        let cur = syncParam[i]
                        if (!('valLabel' in cur)) {
                            continue
                        }
                        cur['val'] = (await this.$prompt('请输入' + cur['valLabel'], '输入信息', {
                            inputValue: ('val' in cur) ? cur['val'] : (('valDefault' in cur) ? cur['valDefault'] : '')
                        })).value
                    }
                }

                // use deepcopy
                this.params = JSON.parse(JSON.stringify(config.params))
                this.headers = JSON.parse(JSON.stringify(config.headers))
                this.requestMethod = config.requestMethod
                this.requestProtocol = config.requestProtocol
                this.requestUrl = config.requestUrl
            },

            'getData'() {
                let data = {
                    'name': this.name,
                    'callback_url': this.requestUrl,
                    'callback_protocol': this.requestProtocol,
                    'callback_params': {},
                    'callback_method': this.requestMethod,
                    'callback_headers': {}
                }

                for (let param of this.params) {
                    if (!param.key || !param.val) {
                        continue
                    }
                    data['callback_params'][param.key] = param.val
                }
                data['callback_params'] = JSON.stringify(data['callback_params'])

                for (let header of this.headers) {
                    if (!header.key || !header.val) {
                        continue
                    }
                    data['callback_headers'][header.key] = header.val
                }
                data['callback_headers'] = JSON.stringify(data['callback_headers'])

                return data
            }
        },
        'data'() {
            return {
                name: '',
                params: [
                    {
                        key: '',
                        val: ''
                    }
                ],
                headers: [
                    {
                        key: '',
                        val: ''
                    }
                ],
                requestMethod: 1,
                requestProtocol: 'http',
                requestUrl: '',
                availableLabels: [
                    ['tag_name', '标签名称'],
                    ['tag_path', '标签路径'],
                    ['tag_tid', '标签ID'],
                    ['device_id', '基站ID'],
                    ['device_name', '基站名称'],
                    ['event_type', '事件类型（0：测试，1：信号丢失，2：标签被移，3：标签被取下）']
                ],
                templateHelpers: [
                    ['电话通知', {
                        params: [
                            {
                                key: 'send_to',
                                valLabel: '电话号码',
                                valDefault: '+86'
                            }
                        ],
                        headers: [
                            {
                                key: '',
                                val: ''
                            }
                        ],
                        requestMethod: 1,
                        requestProtocol: 'intellikeeper',
                        requestUrl: 'sms-alarm'
                    }],
                    ['邮件通知', {
                        params: [
                            {
                                key: 'mail_to',
                                valLabel: '收件人邮箱'
                            }
                        ],
                        headers: [
                            {
                                key: '',
                                val: ''
                            }
                        ],
                        requestMethod: 1,
                        requestProtocol: 'intellikeeper',
                        requestUrl: 'email-alarm'
                    }]
                ]
            }
        }
    }
</script>
