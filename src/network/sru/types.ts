export type SruPublicatie = {
  id: string;
  title: string;
  type: string;
  creator: string;
  modified: string;
  abstract: string;
  preferredUrl: string;
  bronUrl: string;
  postcodes: string[];
  productArea: string;
  audience: string;
  subject: string;
  publicatienaam: string;
};

export type SruResponse = {
  publicaties: SruPublicatie[];
  totalResults: number;
};
