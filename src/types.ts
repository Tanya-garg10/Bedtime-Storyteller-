export interface ChildProfile {
  name: string;
  age: number; // e.g. 5
  character: string; // e.g. "A clumsy astronaut"
  theme: string; // e.g. "Learning that it's okay to make mistakes"
}

export interface BedtimeStory {
  id: string;
  title: string;
  text: string;
  profile: ChildProfile;
  timestamp: number;
  rating?: number; // 1-5 stars
  isFavorite: boolean;
  notes?: string; // Parents' personal log/details
  coverColor: string; // Tailwind color class for bookshelf
}

export interface CuratedTheme {
  id: string;
  title: string;
  moral: string;
  icon: string;
  description: string;
  color: string;
}

export interface CuratedCharacter {
  name: string;
  type: string;
  icon: string;
  description: string;
}
