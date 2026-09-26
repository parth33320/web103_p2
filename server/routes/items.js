import express from 'express';
import { getItems, getItemById } from '../controllers/items.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:id', getItemById);

export default router;
