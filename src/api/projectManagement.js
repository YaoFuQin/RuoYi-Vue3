import request from '@/utils/request'

// 查询项目管理列表
export function projectManagement_list(query) {
  return request({
    url: '/projectManagement/list',
    method: 'get',
    params: query
  })
}

// 查询项目管理详情
export function projectManagement_detils(productId) {
  return request({
    url: '/projectManagement/' + productId,
    method: 'get'
  })
}

// 新增项目管理
export function addProjectManagement(data) {
  return request({
    url: '/projectManagement/add',
    method: 'post',
    data
  })
}

// 更新项目管理
export function updateProjectManagement(data) {
  return request({
    url: '/projectManagement/edit',
    method: 'put',
    data
  })
}

// 删除项目管理
export function delProjectManagement(productIds) {
  return request({
    url: '/projectManagement/' + productIds,
    method: 'delete'
  })
}



// 查询公司产品库列表
export function companyProducts_list(query) {
  return request({
    url: '/productManagement/companyProducts/list',
    method: 'get',
    params: query
  })
}
