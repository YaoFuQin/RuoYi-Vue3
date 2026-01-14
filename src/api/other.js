import request from '@/utils/request'

// 产品请求体
export function callApi(data) {
    return request({
        url: '/other/callApi',
        method: 'post',
        data,
    })
}
