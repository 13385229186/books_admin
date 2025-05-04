
// 从环境变量读取COS配置，补全头像url
const { UMI_APP_COS_BUCKET, UMI_APP_COS_REGION } = process.env;
const cosBaseUrl = `https://${UMI_APP_COS_BUCKET}.cos.${UMI_APP_COS_REGION}.myqcloud.com/`;

/** 将cos相对路径补全 */ 
export function toCosUrl(path: string) {
  if(path){
    return cosBaseUrl + path;
  }
  return '';
}

export function pageListParamFormat(params: any) {
  const { current, pageSize, ...restParams } = params;
  
  return {
    ...restParams, // 保留其他所有参数
    pageParam: {
      current: current || 1,
      pageSize: pageSize || 5
    }
  };
}

/** 从url获取文件名 */
export const getFileNameFromUrl = (url: string) => {
  try {
    // 解码URL编码的字符串
    const decodedUrl = decodeURIComponent(url);
    
    // 提取最后一部分路径
    const fileName = decodedUrl.split('/').pop() || '';
    
    // 移除可能残留的查询参数（?xxx）和哈希（#xxx）
    return fileName.split('?')[0].split('#')[0];
  } catch {
    return ''; 
  }
};


/** 日期格式化函数 */
export const formatDateTime = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '-';
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

