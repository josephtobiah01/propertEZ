import {z} from 'zod';



// Philippine phone number regex
// Formats: +639171234567, 09171234567, 639171234567
const philippinePhoneRegex = /^(\+?63|0)?9\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createUserSchema = z.object({

    email: z
        
        .string()
        .regex(emailRegex, "Invalid email format")
        .min(1, "Email is required")
        .min(5, "Email must be at least 5 characters")
        .max(100, "Email must not exceed 100 characters"),

    
    name: z
        .string()
        .min(1, "Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
    
    phone: z
    .string()
    .regex(philippinePhoneRegex, "Invalid Philippine phone number format. Use: +639171234567, 09171234567, or 639171234567")
    .optional()
    .or(z.literal('')),
});


// Update User Validation Schema (all fields optional)
export const updateUserSchema = z.object({
  email: z
    .string()
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must not exceed 100 characters")
    .regex(emailRegex, "Invalid email format")
    .optional(),
  
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
    .optional(),
  
  phone: z
    .string()
    .regex(philippinePhoneRegex, "Invalid Philippine phone number format")
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => data.email || data.name || data.phone,
  {
    message: "At least one field must be provided for update",
  }
);


export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID must be a valid number")
    .transform(Number)
    .refine(val => val > 0, "ID must be greater than 0")
    .refine(val => val <= 2147483647, "ID exceeds maximum allowed value"),
});

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;