import {z} from "zod";

export const createPropertySchema = z.object({
    ownerId: z
        .number()
        .int("Owner ID must be an interger")
        .positive("Owner ID must be greater than zero")
        .max(2147483647, "Owner ID exceeds maximum allowed value"),
    
    address: z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(200, "Address must not exceed 200 characters")
        .trim(),

    city: z
        .string()
        .min(2, "City must be at least 2 characters")
        .max(100, "City must not exceed 100 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "City can only contain letters, spaces, hyphens, and apostrophes")
        .trim(),
    
    province: z
        .string()
        .min(2, "Province must be at least 2 characters")
        .max(100, "Province must not exceed 100 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "Province can only contain letters, spaces, hyphens, and apostrophes")
        .trim(),
    
    zipCode: z
        .string()
        .regex(/^\d{4}$/, "Zip code must be exactly 4 digits")
        .trim()
        .optional(),
    
    latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .optional(),
    
    longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .optional(),
});


export const updatePropertySchema = z.object({
    ownerId: z
        .number()
        .int("Owner ID must be an integer")
        .positive("Owner ID must be greater than 0")
        .max(2147483647, "Owner ID exceeds maximum allowed value")
        .optional(),
        
    address: z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(200, "Address must not exceed 200 characters")
        .trim()
        .optional(),
        
    city: z
        .string()
        .min(2, "City must be at least 2 characters")
        .max(100, "City must not exceed 100 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "City can only contain letters, spaces, hyphens, and apostrophes")
        .trim()
        .optional(),
        
    province: z
        .string()
        .min(2, "Province must be at least 2 characters")
        .max(100, "Province must not exceed 100 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "Province can only contain letters, spaces, hyphens, and apostrophes")
        .trim()
        .optional(),
        
    zipCode: z
        .string()
        .regex(/^\d{4}$/, "Zip code must be exactly 4 digits")
        .trim()
        .optional(),

    latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .optional(),
    
    longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);



export const propertyIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID must be a valid number")
    .transform(Number)
    .refine(val => val > 0, "ID must be greater than 0")
    .refine(val => val <= 2147483647, "ID exceeds maximum allowed value"),
});