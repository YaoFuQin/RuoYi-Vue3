import request from '@/utils/request'

// 查询企业列表
export function listBusinessManagement(query) {
    return request({
        url: 'system/businessManagement/list',
        method: 'get',
        params: query,
    })
}
