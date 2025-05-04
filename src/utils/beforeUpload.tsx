import { message } from "antd";
import type { GetProp, UploadProps } from 'antd';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

/**
 * 上传封面前，检查图片格式
 */
export const beforeCoverUpload = (file: FileType) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式图片!');
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB!');
  }
  return isJpgOrPng && isLt5M;
};

/**
 * 上传文件前，检查pdf格式
 */
export const beforePdfUpload = (file: FileType) => {
  const isPdf = file.type === 'application/pdf';
  if (!isPdf) {
    message.error('暂仅支持 PDF 文件!');
  }
  const isLt100M = file.size / 1024 / 1024 < 100; // 限制100MB
  if (!isLt100M) {
    message.error('PDF 文件大小不能超过 100MB!');
  }
  return isPdf && isLt100M;
};