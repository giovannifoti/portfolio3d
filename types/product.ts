export type Product = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  printFilePath: string;
  printFileName: string;
  printFileType: "3mf";
  views: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  title: string;
  description: string;
  category?: string;
  fileUrl: string;
  fileName: string;
  fileType: "3mf";
};
