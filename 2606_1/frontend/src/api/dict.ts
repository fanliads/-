import { get, post, put, del } from '@/utils/request'
import type { ApiResponse, DictTypeVO, DictDataVO, DictDataCreateDTO, DictDataUpdateDTO } from '@/types/requirement'

/** 查询所有字典类型 */
export function listDictTypes() {
  return get<ApiResponse<DictTypeVO[]>>('/dict/type/list')
}

/** 按字典编码查询字典数据 */
export function listDictData(dictCode: string) {
  return get<ApiResponse<DictDataVO[]>>(`/dict/data/list`, { params: { dictCode } })
}

/** 新增字典数据 */
export function createDictData(data: DictDataCreateDTO) {
  return post<ApiResponse<number>>('/dict/data', data)
}

/** 修改字典数据 */
export function updateDictData(id: number, data: DictDataUpdateDTO) {
  return put<ApiResponse<void>>(`/dict/data/${id}`, data)
}

/** 删除字典数据 */
export function deleteDictData(id: number) {
  return del<ApiResponse<void>>(`/dict/data/${id}`)
}
