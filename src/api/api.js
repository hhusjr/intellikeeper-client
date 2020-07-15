import axios from 'axios'

let api = axios.create({
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})

api.interceptors.request.use(
    config => {
        if (localStorage.getItem('Authorization')) {
            config.headers.Authorization = 'Token ' + localStorage.getItem('Authorization')
        }

        return config
    },
    error => {
        return Promise.reject(error)
    })

api.interceptors.response.use(
    response => {
        return response
    },
    error => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('Authorization')
                this.$router.replace({
                    path: '/login'
                }).then()
            }
            return Promise.reject(error.response.data)
        }
        return Promise.reject()
    }
)

export default api
