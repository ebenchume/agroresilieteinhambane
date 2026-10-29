import { CropType, DistrictZone, UserType } from './auth';

export type ForumCategory = 
  | 'boas-praticas'
  | 'duvidas'
  | 'pragas-doencas'
  | 'mercado-precos'
  | 'clima-agua'
  | 'sementes';

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorZone: DistrictZone;
  authorType: UserType;
  isExtensionist?: boolean;
  content: string;
  likes: string[]; // user IDs who liked
  createdAt: string;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorZone: DistrictZone;
  authorCrop: CropType;
  authorType: UserType;
  isExtensionist?: boolean;
  title: string;
  content: string;
  category: ForumCategory;
  cropTag: CropType | 'Geral';
  likes: string[]; // user IDs who liked
  comments: ForumComment[];
  createdAt: string;
  pinned?: boolean;
  audioNoteDuration?: string; // e.g. "0:45" voice note representation
}
