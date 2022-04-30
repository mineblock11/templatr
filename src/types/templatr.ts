import Placeholder from "./placeholder";

export interface V1 {
  _version?: string; // default 1
  name: string;
  author: string;
  src?: string;
  description: string;
  placeholders: Placeholder[];
}

export interface V2 extends V1 {
  prerunInfo?: string;
  postrunInfo?: string;
}
