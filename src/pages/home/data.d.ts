export interface HotBookWithHeatScore {
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
  heatScore: float;
  createdAt: string;
  updatedAt: string;
}