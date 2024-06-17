import { ZQueryState } from '../types';

export interface PuppyPhoto {
  id: string;
  name: string;
  url: string;
}

export const MOCK_PUPPY_PHOTOS: PuppyPhoto[] = [
  {
    id: 'a',
    name: 'Croissant',
    url: 'croissant.jpg',
  },
  {
    id: 'b',
    name: 'Rocket',
    url: 'rocket.jpg',
  },
  {
    id: 'c',
    name: 'Cookie',
    url: 'cookie.jpg',
  },
];

export interface State {
  puppyPhotos: ZQueryState<PuppyPhoto[]>;
}
