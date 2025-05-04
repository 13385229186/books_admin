import { request } from '@umijs/max';

export async function api(
  url: string,
  data: any,
  method: string = 'POST',
  options?: { [key: string]: any }
) {
  const userToken = localStorage.getItem('token');
  
  // 判断是否为文件上传
  const isFormData = data instanceof FormData;

  const headers = {
    'Authorization': `Bearer ${userToken}`,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }), // 非FormData时设置JSON头
    ...(options?.headers || {}),
  };

  return request(url, {
    method,
    headers,
    data: isFormData ? data : { ...data }, // 保持FormData原始格式或JSON
    ...(options || {}),
  });
}

/**
 * 混合上传文件和数据
 * @param url 接口地址
 * @param params 普通表单字段
 * @param files 文件字段
 * @param jsonData JSON数据
 * @param options 额外配置
 */
export async function multipartRequest(
  url: string,
  params?: Record<string, any>,
  files?: {
    file?: File;
    cover?: File;
    [key: string]: File | undefined;
  },
  jsonData?: {
    data: any; // JSON 数据内容
    fieldName: string; // 字段名
  },
  options?: { [key: string]: any }
) {
  const formData = new FormData();
  const token = localStorage.getItem('token');

  //console.log(params)
  //console.log(files)
  //console.log(jsonData)


  // 1. 添加普通表单字段
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
  }

  // 2. 添加文件字段
  if (files) {
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });
  }

  // 3. 添加JSON数据（转为Blob）
  if (jsonData?.data) {
    const jsonBlob = new Blob(
      [JSON.stringify(jsonData.data)], 
      { type: 'application/json' }
    );
    formData.append(jsonData.fieldName, jsonBlob);
  }

  //console.log('**************\n', formData)

  // 4. 发送请求
  return request(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    data: formData,
    ...options,
  });
}