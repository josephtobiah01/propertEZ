import {Request, Response, NextFunction} from 'express';
import prisma from '../prisma';
import { parse } from 'path';
import
{
    createUserSchema,
    updateUserSchema,
    userIdSchema
} from '../validators/userValidator';

import { z } from 'zod';
import { error } from 'console';

export const createUser = async (req: Request, res: Response, next: NextFunction) => 
{
    try {

        const validatedData = createUserSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: {email: validatedData.email},
        });

        if (existingUser)
            return res.status(409).json
            ({
            error: "Conflict",
            message: "Email already in use"
            });

         const{name, email, phone} = req.body;

         const user = await prisma.user.create({
                data: {
                    email: validatedData.email,
                    name: validatedData.name,
                    phone: validatedData.phone,
                },
            });
            res.status(201).json(user);
        }
    catch (error : unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
            error: "Validation Error",
            message: "Invalid input data",
            details: error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
            });
        }
        next(error);
    }

};


export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try 
    {
        const { id } = userIdSchema.parse(req.params);
        const user = await prisma.user.findUnique({
            where: { id },
            include: {properties: true}
        });

        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    }
    catch (error : unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
            error: "Validation Error",
            message: "Invalid input data",
            details: error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
            });
        }
        next(error);
    }
};


export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const users = await prisma.user.findMany({
            include: {properties: true}
        });
        res.json(users);
    }
    catch (error : unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
            error: "Validation Error",
            message: "Invalid input data",
            details: error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
            });
        }
        next(error);
    }
}


export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = userIdSchema.parse(req.params);

        const validatedData = updateUserSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: {id},
        });

        if(!existingUser) {
            return res.status(404).json({
                error: "Not Found",
                message: "User not found"
            });
        }

        if (validatedData.email && validatedData.email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({
                where: {email: validatedData.email},
            });

            if (emailTaken) {
                return res.status(409).json({
                    error: "Conflict",
                    message: "Email already in use"
                });
            }
        }

         const user = await prisma.user.update({
            where: {id},
            data: validatedData,
        });

        res.json(user);
    }
    catch (error : unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
            error: "Validation Error",
            message: "Invalid input data",
            details: error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
            });
        }
        next(error);
    }
}


export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const { id } = userIdSchema.parse(req.params);

        const existingUser = await prisma.user.findUnique({
            where: {id}
        });

        if (!existingUser){
            res.json({
                error: "Not Found",
                message: "User not found"
            })
        }

        await prisma.user.delete({
            where: {id}
        });

        res.json({
            message: "User deleted successfully",
            deleteUser: {
                id: existingUser?.id,
                email: existingUser?.email,
                name: existingUser?.name,
                phone: existingUser?.phone
            }
        });
    }

    catch (error : unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
            error: "Validation Error",
            message: "Invalid input data",
            details: error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
            });
        }
        next(error);
    }
}

