export type Member = {
  avatar: string;
  name: string;
  id: string;
};

export interface Params {
  count: number;
}
export interface ListItemDataType {
  id: string;
  isbn: string;
  cover: string;
  title: string;
  author: string;
  press: string;
  category: string;
  intro: string;
  status: 'AVAILABLE', 'BORROWED', 'MAINTENANCE';
  ebook: string;
  createdAt: string;
  updatedAt: string;
}
