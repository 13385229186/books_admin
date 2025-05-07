import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spin, message } from 'antd';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import styles from './style.less';
import { LoadingOutlined } from '@ant-design/icons';

// 配置PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';

interface PdfReaderProps {
  pdfUrl: string;
  bookId: string;
}

const PdfReader: React.FC<PdfReaderProps> = ({ pdfUrl, bookId }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageRange, setPageRange] = useState<{start: number; end: number}>({start: 1, end: 10});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 本地存储键名
  const STORAGE_KEY = 'last-read-page' + bookId;
  console.log(STORAGE_KEY)

  // 从本地存储获取上次阅读页数
  const getLastReadPage = () => {
    try {
      const lastPage = localStorage.getItem(STORAGE_KEY);
      return lastPage ? parseInt(lastPage) : 1;
    } catch {
      return 1;
    }
  };

  // 保存当前阅读页数
  const saveCurrentPage = useCallback((page: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, page.toString());
    } catch (e) {
      console.error('本地存储失败:', e);
    }
  }, []);

  // 初始化加载范围（上次阅读位置前后各10页）
  const initPageRange = useCallback((lastPage: number, totalPages: number) => {
    const start = Math.max(1, lastPage - 10);
    const end = Math.min(totalPages, lastPage + 10);
    return { start, end };
  }, []);

  // 滚动到指定页面
  const scrollToPage = useCallback((page: number) => {
    const attemptScroll = (retryCount = 0) => {
      const pageElement = document.getElementById(`pdf-page-${page}`);
      const container = containerRef.current;

      if (pageElement && container) {
        container.scrollTo({
          top: pageElement.offsetTop - container.offsetTop - 20,
          behavior: 'auto'
        });
      } else if (retryCount < 3) {
        setTimeout(() => attemptScroll(retryCount + 1), 100 * (retryCount + 1));
      }
    };

    attemptScroll();
  }, []);

  // 加载更多页面（向前或向后）
  const loadMorePages = useCallback((direction: 'prev' | 'next') => {
    if (!numPages) return;

    setPageRange(prev => {
      if (direction === 'prev') {
        const newStart = Math.max(1, prev.start - 10);
        return { ...prev, start: newStart };
      } else {
        const newEnd = Math.min(numPages, prev.end + 10);
        return { ...prev, end: newEnd };
      }
    });
  }, [numPages]);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !numPages) return;

    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    const scrollPosition = scrollTop + clientHeight;

    // 检测是否接近顶部（加载前面10页）
    if (scrollTop < 100 && pageRange.start > 1) {
      loadMorePages('prev');
    }

    // 检测是否接近底部（加载后面10页）
    if (scrollHeight - scrollPosition < 500 && pageRange.end < numPages) {
      loadMorePages('next');
    }

    // 更新当前页码
    const visiblePages = document.querySelectorAll('[id^="pdf-page-"]');
    let newCurrentPage = currentPage;
    
    visiblePages.forEach(el => {
      const pageNum = parseInt(el.id.split('-')[2]);
      const { top } = el.getBoundingClientRect();
      if (top >= 0 && top <= clientHeight * 0.5) {
        newCurrentPage = pageNum;
      }
    });

    if (newCurrentPage !== currentPage) {
      setCurrentPage(newCurrentPage);
      saveCurrentPage(newCurrentPage);
    }
  }, [currentPage, numPages, pageRange, loadMorePages, saveCurrentPage]);

  // 初始化容器宽度和滚动监听
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // 初始化PDF文档
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    
    const lastPage = getLastReadPage();
    const range = initPageRange(lastPage, numPages);
    
    setPageRange(range);
    setCurrentPage(lastPage);
    
    // 延迟滚动确保页面已渲染
    setTimeout(() => scrollToPage(lastPage), 100);
  }, [initPageRange, scrollToPage]);

  // 添加滚动监听
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 生成要渲染的页面范围
  const pagesToRender = [];
  if (numPages) {
    for (let i = pageRange.start; i <= pageRange.end; i++) {
      pagesToRender.push(i);
    }
  }

  return (
    <div className={styles.pdfContainer} ref={containerRef}>   
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error: any) => {
          console.error('PDF加载失败:', error);
          message.error('PDF加载失败，请尝试下载后阅读');
          setIsLoading(false);
        }}
        loading={(
          <div className={styles.loadingContainer}>
            <Spin indicator={<LoadingOutlined spin/>} size='large' tip="电子书加载中..." >
              <div></div>
            </Spin>
          </div>
        )}
      >
        {pagesToRender.map(pageNumber => (
          <div 
            key={`page-${pageNumber}`} 
            id={`pdf-page-${pageNumber}`}
            className={styles.pdfPageWrapper}
          >
            <Page 
              pageNumber={pageNumber} 
              width={containerWidth - 40}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={<Spin tip={`加载第 ${pageNumber} 页...`} ><div></div></Spin>}
            />
          </div>
        ))}
      </Document>
      
      {!isLoading && numPages && (
        <div className={styles.pageIndicator}>
          第 {currentPage} 页 / 共 {numPages} 页
          <div className={styles.pageRange}>
            (显示 {pageRange.start}-{pageRange.end} 页)
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfReader;