export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  interests?: string;
  bio?: string;
  age?: number;
  avatarUrl?: string;
  badges?: Badge[];
  registrations?: Registration[];
  organizedEvents?: Event[];
  ownedGroups?: Group[];
  followedGroups?: any[];
  comments?: Comment[];
  ratings?: Rating[];
  photos?: Photo[];
}

export interface Activity {
  id: string;
  title: string;
  time?: string;
  eventId: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  type: string;
  swags?: string;
  location?: string;
  lat?: number;
  lng?: number;
  imageUrl?: string;
  price: number;
  capacity: number;
  date: string;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    bio?: string;
    avatarUrl?: string;
    organizedEvents?: Partial<Event>[];
  };
  activities?: Activity[];
  categories?: { id: string, name: string }[];
  registrations?: Registration[];
  comments?: Comment[];
  ratings?: Rating[];
  photos?: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  eventId: string;
  userId: string;
  user?: {
    name: string;
    avatarUrl?: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  reply?: string;
  createdAt: string;
  userId: string;
  eventId: string;
  user?: {
    name: string;
    avatarUrl?: string;
  };
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  followers?: any[];
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  user?: {
    name: string;
  };
}

export interface Rating {
  id: string;
  score: number;
  feedback?: string;
  createdAt: string;
  userId: string;
  eventId: string;
  user?: {
    name: string;
    avatarUrl?: string;
  };
}
