import request from '@/utils/request'

// 查询产品品类列表
export function listCategory(query) {
    return request({
        url: '/system/category/list',
        method: 'get',
        params: query,
    })
}

// 查询产品品类详细
export function getCategory(categoryId) {
    return request({
        url: '/system/category/' + categoryId,
        method: 'get',
    })
}

// 查询产品品类下拉树结构
export function treeselect() {
    return request({
        url: '/system/category/treeselect',
        method: 'get',
    })
}

// 根据角色ID查询产品品类下拉树结构
export function roleCategoryTreeselect(roleId) {
    return request({
        url: '/system/category/rolecategoryTreeselect/' + roleId,
        method: 'get',
    })
}

// 新增产品品类
export function addCategory(data) {
    return request({
        url: '/system/category',
        method: 'post',
        data: data,
    })
}

// 修改产品品类
export function updateCategory(data) {
    return request({
        url: '/system/category',
        method: 'put',
        data: data,
    })
}

// 删除产品品类
export function delCategory(categoryId) {
    return request({
        url: '/system/category/' + categoryId,
        method: 'delete',
    })
}
