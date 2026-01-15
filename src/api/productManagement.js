import request from '@/utils/request'

// 查询平台产品库列表
export function platformProducts_list(query) {
  return request({
    url: '/productManagement/platformProducts/list',
    method: 'get',
    params: query
  })
}

// 查询平台产品库详情
export function rolePlatformProducts(productId) {
  return request({
    url: '/productManagement/platformProducts/' + productId,
    method: 'get'
  })
}

// 新增平台产品
export function addPlatformProducts(data) {
  return request({
    url: '/productManagement/platformProducts/add',
    method: 'post',
    data
  })
}

// 更新平台产品
export function updatePlatformProducts(data) {
  return request({
    url: '/productManagement/platformProducts/edit',
    method: 'put',
    data
  })
}

// 删除平台产品
export function delPlatformProducts(productIds) {
  return request({
    url: '/productManagement/platformProducts/' + productIds,
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

// 查询公司产品库详情
export function roleCompanyProducts(productId) {
  return request({
    url: '/productManagement/companyProducts/' + productId,
    method: 'get'
  })
}

// 新增公司产品
export function addCompanyProducts(data) {
  return request({
    url: '/productManagement/companyProducts/add',
    method: 'post',
    data
  })
}

// 更新公司产品
export function updateCompanyProducts(data) {
  return request({
    url: '/productManagement/companyProducts/edit',
    method: 'put',
    data
  })
}

// 删除公司产品
export function delCompanyProducts(productIds) {
  return request({
    url: '/productManagement/companyProducts/' + productIds,
    method: 'delete'
  })
}

// 平台产品导入到公司产品
export function importToCompany(data) {
  return request({
    url: '/productManagement/platformProducts/importToCompany',
    method: 'post',
    data
  })
}