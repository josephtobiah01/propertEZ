import {Request, Response, NextFunction} from 'express';
import prisma from '../prisma';
import{
    createPropertySchema,
    updatePropertySchema,
    propertyIdSchema
} from '../validators/propertyValidator';

import { z } from 'zod';
import { error } from 'console';

export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validateData = createPropertySchema.parse(req.body);

        const ownerExists = await prisma.user.findUnique({
            where: {id: validateData.ownerId},
        });

        if (!ownerExists) {
            return res.status(404).json({
                error: "Not Found",
                message: "Owner not found"
            });
        }

        const property = await prisma.property.create({
            data: validateData,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });
        res.status(201).json(property);
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


export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {

    try{
        
        const { id } = propertyIdSchema.parse(req.params);

        const property = await prisma.property.findUnique({
            where: {id},
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                listings: true,
            }
        });

        if (!property) {
            return res.status(404).json({
                error: "Not Found",
                message: "Property not found"
            });
        }
        res.json(property);
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


export const getAllProperties = async (req: Request, res: Response, next: NextFunction) => {

    try{
        const properties = await prisma.property.findMany({
            include: {
                owner: {
                    select:{
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                listings: true,
            }
        });
        res.json(properties);
    }
    catch (error : unknown) {
        next(error);
    }
}

export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {

    try{

        const { id } = propertyIdSchema.parse(req.params);

        const validateData = updatePropertySchema.parse(req.body);

        const existingProperty = await prisma.property.findUnique({
            where: { id }
        });

        if (!existingProperty){
            return res.status(404).json({
                error: "Not Found",
                message: "Property Not Found"
            })
        }

        if (validateData.ownerId && validateData.ownerId !== existingProperty.ownerId) {
            const newOwnerExists = await prisma.property.findUnique({
                where: {id: validateData.ownerId}
            });

            if (!newOwnerExists){
                return res.status(404).json({
                    error: "Not Found",
                    message: "New owner not found"
                })
            }
        }

        const property = await prisma.property.update({
            where: {id},
            data: validateData,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json(property)
    }
    catch(error: unknown){
        if(error instanceof z.ZodError){
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

export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {

    try{

        const {id} = propertyIdSchema.parse(req.params);

        const existingProperty = await prisma.property.findUnique({
            where: {id},
        });

        if (!existingProperty) {
            return res.status(400).json({
                error: "Not Found",
                message: "Property not Found"
            });
        }

        await prisma.property.delete({
            where: {id}
        });

        res.json({
            message: "Property deleted successfully",
            deletedProperty: {
                id: existingProperty.id,
                address: existingProperty.address,
                city: existingProperty.city
            }
        });

    }
    catch(error: unknown){
        if(error instanceof z.ZodError){
            return res.status(404).json({
                error: "Validation Error",
                message: "Invalid property Id",
                details: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        next(error);
    }
}