export interface UpdateBookParams {
  bookId: string;
  bookData?: Record<string, any>; 
  file?: File;
  cover?: File;
}

export interface UploadBookParams {
  bookData: Record<string, any>; 
  file?: File;
  cover?: File;
}