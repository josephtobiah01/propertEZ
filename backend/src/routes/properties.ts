import express from 'express'
import {
    createProperty,
    getPropertyById,
    getAllProperties,
    updateProperty,
    deleteProperty
} from '../controllers/propertyController'

const router = express.Router();

router.post('/', createProperty);

router.get('/', getAllProperties);

router.get('/:id', getPropertyById);

router.put('/:id', updateProperty);

router.delete('/:id', deleteProperty);

export default router;