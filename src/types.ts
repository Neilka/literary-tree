export interface Author {
  slug: string;
  name: string;
  era: string;
  startYear: number | null;
  endYear: number | null;
  works: string[];
  reason: string;
  branch: string;
  section: string;
  sectionNum: number;
  isPioneer: boolean;
  isNobel: boolean;
}

export interface Branch {
  name: string;
  color: string;
  authors: Author[];
}

export interface DataRoot {
  branches: Branch[];
  authors: Author[];
  stats: {
    total_authors: number;
    total_branches: number;
    pioneers: number;
    nobelists: number;
  };
}
