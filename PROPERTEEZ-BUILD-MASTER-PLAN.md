# Properteez - Complete Build Master Plan

**Created:** 2025-11-01
**Project:** Airbnb-style Property Rental Mobile App (React Native)
**Goal:** Build a complete mobile app for browsing and managing property listings

---

## 📁 Project Structure Overview

```
C:\Users\otepa\source\
├── propertEZ_backend\          # Node.js + Express + TypeScript API
│   ├── src\
│   │   ├── index.ts            # Express app entry point
│   │   ├── routes\
│   │   │   ├── properties.ts   # Property CRUD routes
│   │   │   ├── listings.ts     # Listing CRUD routes
│   │   │   └── users.ts        # User routes
│   │   ├── controllers\
│   │   │   ├── propertyController.ts
│   │   │   ├── listingController.ts
│   │   │   └── userController.ts
│   │   └── middleware\
│   │       ├── errorHandler.ts
│   │       └── validateRequest.ts
│   ├── prisma\
│   │   └── schema.prisma       # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── propertEZ_mobile\propertEZMobile\  # React Native + Expo
    ├── app\
    │   ├── (tabs)\
    │   │   ├── listings.tsx    # Browse all listings
    │   │   ├── properties.tsx  # Saved properties
    │   │   └── users.tsx       # User profile
    │   ├── listing\
    │   │   └── [id].tsx        # Property detail page
    │   └── _layout.tsx
    ├── components\
    │   ├── ListingCard.tsx     # Property card component
    │   ├── FilterSheet.tsx     # Bottom sheet for filters
    │   └── SearchBar.tsx       # Search input
    ├── services\
    │   └── api.ts              # Axios API client
    ├── stores\
    │   ├── useAuthStore.ts     # Zustand auth state
    │   └── useFilterStore.ts   # Filter state
    ├── hooks\
    │   └── useListings.ts      # React Query hooks
    └── types\
        └── index.ts            # TypeScript types
```

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL 15+
- **Validation:** Zod
- **Environment:** dotenv

### Mobile
- **Framework:** React Native 0.81
- **Router:** Expo Router 6
- **Language:** TypeScript
- **State Management:** Zustand
- **Data Fetching:** @tanstack/react-query (React Query)
- **UI Library:** React Native Paper (optional)
- **Bottom Sheets:** @gorhom/bottom-sheet
- **HTTP Client:** Axios

---

## 🗄️ Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  phone     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  properties Property[]

  @@map("users")
}

model Property {
  id          Int      @id @default(autoincrement())
  ownerId     Int      @map("owner_id")
  address     String
  city        String
  state       String?
  zipCode     String?  @map("zip_code")
  latitude    Float?
  longitude   Float?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  owner    User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  listings Listing[]

  @@index([city])
  @@index([ownerId])
  @@map("properties")
}

model Listing {
  id          Int      @id @default(autoincrement())
  propertyId  Int      @map("property_id")
  title       String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  bedrooms    Int
  bathrooms   Int
  sqft        Int?
  listingType ListingType @map("listing_type") // Sale, Rent, Lease
  category    PropertyCategory
  amenities   String[] // Array of amenity strings
  images      String[] // Array of image URLs
  available   Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([listingType])
  @@index([category])
  @@index([city])
  @@index([price])
  @@index([bedrooms])
  @@map("listings")
}

enum ListingType {
  Sale
  Rent
  Lease
}

enum PropertyCategory {
  Condo
  HouseAndLot
  Pasalo
  Apartment
}
```

---

## 🚀 API Endpoints Specification

### Base URL: `http://localhost:3001/api`

#### Health Check
```
GET /health
Response: { "status": "ok", "timestamp": "2025-11-01T..." }
```

#### Users
```
POST /users
Body: { "email": "user@example.com", "name": "John Doe", "phone": "+1234567890" }
Response: { "id": 1, "email": "...", "name": "...", "createdAt": "..." }

GET /users/:id
Response: { "id": 1, "email": "...", "name": "...", "properties": [...] }
```

#### Properties
```
POST /properties
Body: {
  "ownerId": 1,
  "address": "123 Main St",
  "city": "Manila",
  "state": "NCR",
  "zipCode": "1000",
  "latitude": 14.5995,
  "longitude": 120.9842
}
Response: { "id": 1, "address": "...", "city": "...", ... }

GET /properties/:id
Response: { "id": 1, "address": "...", "listings": [...] }

PUT /properties/:id
Body: { "address": "...", "city": "..." }
Response: { "id": 1, ... }

DELETE /properties/:id
Response: { "message": "Property deleted successfully" }
```

#### Listings
```
GET /listings
Query: ?listingType=Rent&category=Condo&city=Manila&minPrice=1000&maxPrice=50000&bedrooms=2&page=1&limit=20
Response: {
  "listings": [ {...}, {...} ],
  "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}

GET /listings/:id
Response: {
  "id": 1,
  "title": "...",
  "description": "...",
  "price": 25000,
  "bedrooms": 2,
  "bathrooms": 1,
  "property": { "address": "...", "city": "..." },
  "images": ["url1", "url2"],
  ...
}

POST /listings
Body: {
  "propertyId": 1,
  "title": "Modern 2BR Condo in Makati",
  "description": "Fully furnished...",
  "price": 25000,
  "bedrooms": 2,
  "bathrooms": 1,
  "sqft": 800,
  "listingType": "Rent",
  "category": "Condo",
  "amenities": ["Parking", "Pool", "Gym"],
  "images": ["https://...", "https://..."]
}
Response: { "id": 1, "title": "...", ... }

PUT /listings/:id
Body: { "title": "...", "price": 30000, ... }
Response: { "id": 1, ... }

DELETE /listings/:id
Response: { "message": "Listing deleted successfully" }

PATCH /listings/:id/availability
Body: { "available": false }
Response: { "id": 1, "available": false }
```

---

## 📦 Backend Implementation

### 1. `package.json`
```json
{
  "name": "propertez-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.14.0",
    "prisma": "^5.20.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0"
  }
}
```

### 2. `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 3. `.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/properteez"
PORT=3001
NODE_ENV=development
```

### 4. `src/index.ts`
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import propertyRoutes from './routes/properties';
import listingRoutes from './routes/listings';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/listings', listingRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
```

### 5. `src/routes/listings.ts`
```typescript
import { Router } from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  updateListingAvailability
} from '../controllers/listingController';

const router = Router();

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', createListing);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);
router.patch('/:id/availability', updateListingAvailability);

export default router;
```

### 6. `src/controllers/listingController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ListingType, PropertyCategory } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createListingSchema = z.object({
  propertyId: z.number(),
  title: z.string().min(5).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  sqft: z.number().int().positive().optional(),
  listingType: z.enum(['Sale', 'Rent', 'Lease']),
  category: z.enum(['Condo', 'HouseAndLot', 'Pasalo', 'Apartment']),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string().url()).optional().default([]),
});

export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      listingType,
      category,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { available: true };

    if (listingType) where.listingType = listingType as ListingType;
    if (category) where.category = category as PropertyCategory;
    if (bedrooms) where.bedrooms = parseInt(bedrooms as string);
    if (city) where.property = { city: city as string };

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { property: true },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: { property: { include: { owner: true } } },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createListingSchema.parse(req.body);

    const listing = await prisma.listing.create({
      data: {
        ...data,
        listingType: data.listingType as ListingType,
        category: data.category as PropertyCategory,
      },
      include: { property: true },
    });

    res.status(201).json(listing);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
};

export const updateListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const listing = await prisma.listing.update({
      where: { id: parseInt(id) },
      data,
      include: { property: true },
    });

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.listing.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateListingAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const listing = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: { available: Boolean(available) },
    });

    res.json(listing);
  } catch (error) {
    next(error);
  }
};
```

### 7. `src/routes/properties.ts`
```typescript
import { Router } from 'express';
import {
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController';

const router = Router();

router.post('/', createProperty);
router.get('/:id', getPropertyById);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

export default router;
```

### 8. `src/controllers/propertyController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createPropertySchema = z.object({
  ownerId: z.number(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPropertySchema.parse(req.body);
    const property = await prisma.property.create({ data });
    res.status(201).json(property);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: { listings: true, owner: true },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(property);
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.property.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};
```

### 9. `src/routes/users.ts`
```typescript
import { Router } from 'express';
import { createUser, getUserById } from '../controllers/userController';

const router = Router();

router.post('/', createUser);
router.get('/:id', getUserById);

export default router;
```

### 10. `src/controllers/userController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await prisma.user.create({ data });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { properties: { include: { listings: true } } },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
```

### 11. `src/middleware/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ error: 'Database error', message: err.message });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
```

---

## 📱 Mobile App Implementation

### 1. Update `package.json` (add dependencies)
```json
{
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@gorhom/bottom-sheet": "^5.2.6",
    "@react-navigation/native": "^7.1.8",
    "@tanstack/react-query": "^5.56.2",
    "axios": "^1.7.7",
    "expo": "~54.0.20",
    "expo-constants": "~18.0.10",
    "expo-font": "~14.0.9",
    "expo-image-picker": "~15.0.7",
    "expo-linking": "~8.0.8",
    "expo-router": "~6.0.13",
    "expo-splash-screen": "~31.0.10",
    "expo-status-bar": "~3.0.8",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "zustand": "^5.0.0"
  }
}
```

### 2. `.env.local`
```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. `types/index.ts`
```typescript
export enum ListingType {
  Sale = 'Sale',
  Rent = 'Rent',
  Lease = 'Lease',
}

export enum PropertyCategory {
  Condo = 'Condo',
  HouseAndLot = 'HouseAndLot',
  Pasalo = 'Pasalo',
  Apartment = 'Apartment',
}

export interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: number;
  ownerId: number;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  listings?: Listing[];
}

export interface Listing {
  id: number;
  propertyId: number;
  title: string;
  description?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  listingType: ListingType;
  category: PropertyCategory;
  amenities: string[];
  images: string[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
  property?: Property;
}

export interface ListingsResponse {
  listings: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListingFilters {
  listingType?: ListingType;
  category?: PropertyCategory;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}
```

### 4. `services/api.ts`
```typescript
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
```

### 5. `hooks/useListings.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Listing, ListingsResponse, ListingFilters } from '@/types';

export const useListings = (filters?: ListingFilters) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.listingType) params.append('listingType', filters.listingType);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.bedrooms) params.append('bedrooms', filters.bedrooms.toString());

      const { data } = await api.get<ListingsResponse>(`/listings?${params.toString()}`);
      return data;
    },
  });
};

export const useListing = (id: number) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await api.get<Listing>(`/listings/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newListing: Partial<Listing>) => {
      const { data } = await api.post<Listing>('/listings', newListing);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};
```

### 6. `stores/useFilterStore.ts`
```typescript
import { create } from 'zustand';
import { ListingType, PropertyCategory } from '@/types';

interface FilterState {
  listingType?: ListingType;
  category?: PropertyCategory;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;

  setListingType: (type?: ListingType) => void;
  setCategory: (category?: PropertyCategory) => void;
  setCity: (city?: string) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setBedrooms: (bedrooms?: number) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  listingType: undefined,
  category: undefined,
  city: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  bedrooms: undefined,

  setListingType: (type) => set({ listingType: type }),
  setCategory: (category) => set({ category }),
  setCity: (city) => set({ city }),
  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),
  setBedrooms: (bedrooms) => set({ bedrooms }),
  clearFilters: () => set({
    listingType: undefined,
    category: undefined,
    city: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
  }),
}));
```

### 7. `components/ListingCard.tsx`
```typescript
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Listing } from '@/types';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const imageUrl = listing.images[0] || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/listing/${listing.id}`)}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.details}>
          {listing.bedrooms} bed · {listing.bathrooms} bath
          {listing.sqft ? ` · ${listing.sqft} sqft` : ''}
        </Text>
        <Text style={styles.location}>{listing.property?.city}</Text>
        <Text style={styles.price}>₱{listing.price.toLocaleString()} / month</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF385C',
  },
});
```

### 8. `components/FilterSheet.tsx`
```typescript
import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useFilterStore } from '@/stores/useFilterStore';
import { ListingType, PropertyCategory } from '@/types';

interface FilterSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function FilterSheet({ isVisible, onClose }: FilterSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const { listingType, category, setListingType, setCategory, clearFilters } = useFilterStore();

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      )}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Filters</Text>

        <Text style={styles.sectionTitle}>Listing Type</Text>
        <View style={styles.buttonGroup}>
          {Object.values(ListingType).map((type) => (
            <Pressable
              key={type}
              style={[styles.filterButton, listingType === type && styles.filterButtonActive]}
              onPress={() => setListingType(type)}
            >
              <Text style={[styles.filterButtonText, listingType === type && styles.filterButtonTextActive]}>
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.buttonGroup}>
          {Object.values(PropertyCategory).map((cat) => (
            <Pressable
              key={cat}
              style={[styles.filterButton, category === cat && styles.filterButtonActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.filterButtonText, category === cat && styles.filterButtonTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear All Filters</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  clearButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
```

### 9. `app/(tabs)/listings.tsx`
```typescript
import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useListings } from '@/hooks/useListings';
import { useFilterStore } from '@/stores/useFilterStore';
import ListingCard from '@/components/ListingCard';
import FilterSheet from '@/components/FilterSheet';

export default function ListingsTab() {
  const [showFilters, setShowFilters] = useState(false);
  const filters = useFilterStore();
  const { data, isLoading, error, refetch } = useListings(filters);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load listings</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Listings</Text>
        <Pressable onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#333" />
        </Pressable>
      </View>

      <FlatList
        data={data?.listings || []}
        renderItem={({ item }) => <ListingCard listing={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isLoading}
      />

      <FilterSheet isVisible={showFilters} onClose={() => setShowFilters(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  filterButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF385C',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 10. `app/(tabs)/_layout.tsx`
```typescript
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF385C',
      }}
    >
      <Tabs.Screen
        name="listings"
        options={{
          title: 'Listings',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Properties',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### 11. `app/listing/[id].tsx`
```typescript
import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useListing } from '@/hooks/useListings';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data: listing, isLoading } = useListing(parseInt(id as string));

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.centerContainer}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {listing.images.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {listing.images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.image} />
          ))}
        </ScrollView>
      ) : (
        <Image source={{ uri: 'https://via.placeholder.com/400x300' }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>₱{listing.price.toLocaleString()} / month</Text>

        <View style={styles.details}>
          <Text style={styles.detailText}>{listing.bedrooms} Bedrooms</Text>
          <Text style={styles.detailText}>{listing.bathrooms} Bathrooms</Text>
          {listing.sqft && <Text style={styles.detailText}>{listing.sqft} sqft</Text>}
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description || 'No description available'}</Text>

        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.locationText}>
          {listing.property?.address}, {listing.property?.city}
        </Text>

        {listing.amenities.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Amenities</Text>
            {listing.amenities.map((amenity, idx) => (
              <Text key={idx} style={styles.amenityText}>• {amenity}</Text>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 400,
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF385C',
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  amenityText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
});
```

### 12. Update `app/_layout.tsx` to add React Query Provider
```typescript
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/components/useColorScheme';

const queryClient = new QueryClient();

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ title: 'Property Details' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
```

---

## 🚀 Implementation Steps

### Backend Setup

1. **Create backend directory:**
```bash
cd C:\Users\otepa\source
mkdir propertEZ_backend
cd propertEZ_backend
```

2. **Initialize Node.js project:**
```bash
npm init -y
npm install express cors dotenv @prisma/client zod
npm install -D typescript @types/express @types/cors @types/node prisma tsx
```

3. **Initialize TypeScript:**
```bash
npx tsc --init
```

4. **Initialize Prisma:**
```bash
npx prisma init
```

5. **Set up PostgreSQL** (Docker recommended):
```bash
docker run --name properteez-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=properteez -p 5432:5432 -d postgres:15
```

6. **Update `.env`** with database connection string

7. **Create Prisma schema** (see schema above)

8. **Run migrations:**
```bash
npx prisma migrate dev --name init
```

9. **Create all source files** as specified above

10. **Start development server:**
```bash
npm run dev
```

### Mobile App Setup

1. **Navigate to mobile project:**
```bash
cd C:\Users\otepa\source\propertEZ_mobile\propertEZMobile
```

2. **Install dependencies:**
```bash
npm install @tanstack/react-query axios zustand expo-image-picker
```

3. **Create all files** as specified above

4. **Create `.env.local`:**
```env
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:3001/api
```

5. **Start Expo:**
```bash
npx expo start
```

---

## ✅ Testing Checklist

- [ ] Backend health check: `http://localhost:3001/api/health`
- [ ] Create test user via API
- [ ] Create test property via API
- [ ] Create test listing via API
- [ ] Fetch listings from mobile app
- [ ] View listing details
- [ ] Apply filters
- [ ] Test all three tabs
- [ ] Test pull-to-refresh

---

## 📝 Notes

- **Images:** For now, use placeholder URLs. Later add Cloudinary/S3 integration
- **Authentication:** Add Clerk or Firebase Auth in Phase 2
- **Maps:** Add react-native-maps for property locations in Phase 2
- **Bottom Sheet:** Already set up in FilterSheet component
- **Error Handling:** Basic error handling included, enhance as needed

---

## 🎯 What's Different from YouTube Tutorial

### Similarities:
- ✅ Expo Router file-based routing
- ✅ Bottom sheet for filters (Airbnb-style)
- ✅ Tab navigation structure
- ✅ Property card listings
- ✅ Detail pages

### What We're Doing Better:
- ✅ **Node.js backend** instead of hardcoded data
- ✅ **PostgreSQL** with Prisma for production-ready data layer
- ✅ **React Query** for optimized data fetching & caching
- ✅ **Zustand** for global state (filters, auth later)
- ✅ **TypeScript** throughout for type safety
- ✅ **Proper separation:** Backend API, Mobile App
- ✅ **Scalable architecture** ready for real users

---

## 🔔 Push Notifications Feature (Core Feature)

**Why This Matters:**
Push notifications are a KEY DIFFERENTIATOR for Properteez. Unlike Facebook Marketplace, FB Groups, or TikTok, users will get instant alerts when:
- New properties matching their criteria are listed
- Saved properties drop in price
- Properties they're watching become available
- New properties are added in their preferred location

This feature is especially valuable for:
- Newly wed couples looking for apartments to rent
- First-time home buyers monitoring the market
- People relocating to new cities

### Database Schema Updates for Notifications

Add these models to your Prisma schema:

```prisma
model NotificationToken {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  token     String   @unique  // Expo Push Token
  device    String?  // Device info (iOS/Android)
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("notification_tokens")
}

model SavedSearch {
  id          Int      @id @default(autoincrement())
  userId      Int      @map("user_id")
  name        String   // "2BR Condos in Makati"
  listingType ListingType? @map("listing_type")
  category    PropertyCategory?
  city        String?
  minPrice    Decimal? @db.Decimal(10, 2) @map("min_price")
  maxPrice    Decimal? @db.Decimal(10, 2) @map("max_price")
  bedrooms    Int?
  notifyOnNew Boolean  @default(true) @map("notify_on_new")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("saved_searches")
}

model SavedListing {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  listingId Int      @map("listing_id")
  notifyOnPriceDrop Boolean @default(true) @map("notify_on_price_drop")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId])
  @@index([userId])
  @@index([listingId])
  @@map("saved_listings")
}

model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  title     String
  body      String
  data      Json?    // Additional data (listingId, etc.)
  read      Boolean  @default(false)
  sentAt    DateTime @default(now()) @map("sent_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([read])
  @@map("notifications")
}

// Update User model to include these relations:
model User {
  // ... existing fields ...
  notificationTokens NotificationToken[]
  savedSearches      SavedSearch[]
  savedListings      SavedListing[]
  notifications      Notification[]
}
```

### Backend Implementation

#### 1. Install Expo Server SDK
```bash
npm install expo-server-sdk
npm install -D @types/expo-server-sdk
```

#### 2. Create `src/services/notificationService.ts`
```typescript
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const expo = new Expo();

export interface SendNotificationParams {
  userId: number;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function sendPushNotification(params: SendNotificationParams) {
  const { userId, title, body, data } = params;

  // Get user's push tokens
  const tokens = await prisma.notificationToken.findMany({
    where: { userId, active: true },
  });

  if (tokens.length === 0) {
    console.log(`No push tokens found for user ${userId}`);
    return;
  }

  // Create notification record
  await prisma.notification.create({
    data: { userId, title, body, data: data || {} },
  });

  // Prepare push messages
  const messages: ExpoPushMessage[] = tokens
    .filter((token) => Expo.isExpoPushToken(token.token))
    .map((token) => ({
      to: token.token,
      sound: 'default',
      title,
      body,
      data,
    }));

  // Send in chunks
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  return tickets;
}

export async function notifyNewListing(listingId: number) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { property: true },
  });

  if (!listing) return;

  // Find users with matching saved searches
  const savedSearches = await prisma.savedSearch.findMany({
    where: {
      notifyOnNew: true,
      OR: [
        { listingType: listing.listingType },
        { listingType: null },
      ],
      AND: [
        listing.category ? { OR: [{ category: listing.category }, { category: null }] } : {},
        listing.property.city ? { OR: [{ city: listing.property.city }, { city: null }] } : {},
        { OR: [{ minPrice: { lte: listing.price } }, { minPrice: null }] },
        { OR: [{ maxPrice: { gte: listing.price } }, { maxPrice: null }] },
        { OR: [{ bedrooms: listing.bedrooms }, { bedrooms: null }] },
      ],
    },
    include: { user: true },
  });

  // Send notifications to matching users
  for (const search of savedSearches) {
    await sendPushNotification({
      userId: search.userId,
      title: '🏠 New Property Alert!',
      body: `${listing.title} - ₱${listing.price.toLocaleString()}/mo`,
      data: { listingId: listing.id, type: 'new_listing' },
    });
  }
}

export async function notifyPriceDrop(listingId: number, oldPrice: number, newPrice: number) {
  const savedListings = await prisma.savedListing.findMany({
    where: {
      listingId,
      notifyOnPriceDrop: true,
    },
    include: { listing: true },
  });

  for (const saved of savedListings) {
    const percentDrop = ((oldPrice - newPrice) / oldPrice * 100).toFixed(1);
    await sendPushNotification({
      userId: saved.userId,
      title: '💰 Price Drop Alert!',
      body: `${saved.listing.title} dropped ${percentDrop}% to ₱${newPrice.toLocaleString()}`,
      data: { listingId, type: 'price_drop' },
    });
  }
}
```

#### 3. Create `src/routes/notifications.ts`
```typescript
import { Router } from 'express';
import {
  registerPushToken,
  createSavedSearch,
  getSavedSearches,
  deleteSavedSearch,
  saveListing,
  unsaveListing,
  getNotifications,
  markAsRead
} from '../controllers/notificationController';

const router = Router();

router.post('/register-token', registerPushToken);
router.post('/saved-searches', createSavedSearch);
router.get('/saved-searches/:userId', getSavedSearches);
router.delete('/saved-searches/:id', deleteSavedSearch);
router.post('/saved-listings', saveListing);
router.delete('/saved-listings/:userId/:listingId', unsaveListing);
router.get('/notifications/:userId', getNotifications);
router.patch('/notifications/:id/read', markAsRead);

export default router;
```

#### 4. Create `src/controllers/notificationController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const registerPushToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, token, device } = req.body;

    const notificationToken = await prisma.notificationToken.upsert({
      where: { token },
      update: { active: true, device },
      create: { userId, token, device },
    });

    res.json(notificationToken);
  } catch (error) {
    next(error);
  }
};

export const createSavedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const savedSearch = await prisma.savedSearch.create({
      data: req.body,
    });
    res.status(201).json(savedSearch);
  } catch (error) {
    next(error);
  }
};

export const getSavedSearches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const searches = await prisma.savedSearch.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(searches);
  } catch (error) {
    next(error);
  }
};

export const deleteSavedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.savedSearch.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Saved search deleted' });
  } catch (error) {
    next(error);
  }
};

export const saveListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, listingId, notifyOnPriceDrop } = req.body;
    const saved = await prisma.savedListing.create({
      data: { userId, listingId, notifyOnPriceDrop },
    });
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const unsaveListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, listingId } = req.params;
    await prisma.savedListing.delete({
      where: {
        userId_listingId: {
          userId: parseInt(userId),
          listingId: parseInt(listingId),
        },
      },
    });
    res.json({ message: 'Listing unsaved' });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true },
    });
    res.json(notification);
  } catch (error) {
    next(error);
  }
};
```

#### 5. Update `src/controllers/listingController.ts`
Add notification trigger when creating a listing:

```typescript
// In createListing function, after creating the listing:
import { notifyNewListing } from '../services/notificationService';

// ... inside createListing ...
const listing = await prisma.listing.create({ ... });

// Trigger notification for matching saved searches
await notifyNewListing(listing.id);

res.status(201).json(listing);
```

#### 6. Update `src/index.ts` to include notification routes
```typescript
import notificationRoutes from './routes/notifications';

app.use('/api/notifications', notificationRoutes);
```

### Mobile Implementation

#### 1. Install dependencies
```bash
npx expo install expo-notifications expo-device expo-constants
```

#### 2. Create `services/notificationService.ts`
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(userId: number) {
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })).data;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF385C',
    });
  }

  // Register token with backend
  try {
    await api.post('/notifications/register-token', {
      userId,
      token,
      device: Platform.OS,
    });
  } catch (error) {
    console.error('Failed to register push token:', error);
  }

  return token;
}

export function useNotificationListener(onNotification: (notification: any) => void) {
  React.useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(onNotification);
    return () => subscription.remove();
  }, [onNotification]);
}

export function useNotificationResponseListener(onResponse: (response: any) => void) {
  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(onResponse);
    return () => subscription.remove();
  }, [onResponse]);
}
```

#### 3. Create `hooks/useNotifications.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export const useSavedSearches = (userId: number) => {
  return useQuery({
    queryKey: ['saved-searches', userId],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/saved-searches/${userId}`);
      return data;
    },
  });
};

export const useCreateSavedSearch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (search: any) => {
      const { data } = await api.post('/notifications/saved-searches', search);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
};

export const useSaveListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, listingId }: { userId: number; listingId: number }) => {
      const { data } = await api.post('/notifications/saved-listings', {
        userId,
        listingId,
        notifyOnPriceDrop: true,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-listings'] });
    },
  });
};

export const useNotifications = (userId: number) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/notifications/${userId}`);
      return data;
    },
  });
};
```

#### 4. Update `app/_layout.tsx` to register for notifications
```typescript
import { registerForPushNotifications } from '@/services/notificationService';

// Inside RootLayout component, after fonts load:
useEffect(() => {
  // Register for push notifications (userId will come from auth later)
  const userId = 1; // Replace with actual user ID from auth
  registerForPushNotifications(userId);
}, []);
```

#### 5. Create `app/(tabs)/notifications.tsx` (optional)
A dedicated tab to view all notifications:

```typescript
import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsTab() {
  const userId = 1; // Replace with actual user ID
  const { data: notifications, isLoading } = useNotifications(userId);

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>{new Date(item.sentAt).toLocaleDateString()}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  notification: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  body: { fontSize: 14, color: '#666', marginBottom: 4 },
  time: { fontSize: 12, color: '#999' },
});
```

### Notification Triggers

1. **New Listing Match:** When a property is created that matches a user's saved search
2. **Price Drop:** When a saved listing's price decreases
3. **Property Available:** When a previously unavailable saved property becomes available
4. **New in Area:** Daily digest of new properties in saved locations

---

## 🔜 Future Enhancements (Phase 2)

- [ ] Image upload with Cloudinary/S3
- [ ] Authentication with Clerk
- [ ] User profiles and saved listings
- [ ] Map view with react-native-maps
- [ ] Booking/inquiry system
- [ ] Push notifications
- [ ] Reviews and ratings
- [ ] Payment integration
- [ ] Chat between landlords and renters

---

**End of Master Plan**

This document serves as the complete blueprint for building the Properteez mobile app. Every file, every line of code, and every step is documented here. If this session ends, simply reference this file to continue from where we left off.
