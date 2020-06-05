const ROOT_SERVER = 'http://192.168.0.2:8000';

export default {
    login: {
        verify: ROOT_SERVER + '/auth/mobile/',
        token: ROOT_SERVER + '/auth/token/'
    },

    device: ROOT_SERVER + '/devices/',
    tag: ROOT_SERVER + '/tags/',
    trigger: ROOT_SERVER + '/triggers/',
    reader: ROOT_SERVER + '/readers/'
}