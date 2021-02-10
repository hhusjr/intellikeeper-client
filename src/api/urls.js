const ROOT_SERVER = 'http://localhost:8001';

export default {
    login: {
        verify: ROOT_SERVER + '/auth/mobile/',
        token: ROOT_SERVER + '/auth/token/'
    },

    device: ROOT_SERVER + '/devices/',
    tag: ROOT_SERVER + '/tags/',
    trigger: ROOT_SERVER + '/triggers/',
    reader: ROOT_SERVER + '/readers/',
    tagCategory: ROOT_SERVER + '/tag-categories/',
    event: ROOT_SERVER + '/events/'
}
