import { pool } from '../config/database.js';

/**
 * Get all items, optionally filtered by search query parameter `q`
 */
export const getItems = async (req, res) => {
  try {
    const searchQuery = req.query.q || req.query.search || '';
    let queryText = 'SELECT * FROM items ORDER BY id ASC';
    let queryParams = [];

    if (searchQuery.trim() !== '') {
      queryText = `
        SELECT * FROM items
        WHERE title ILIKE $1
           OR description ILIKE $1
           OR category ILIKE $1
        ORDER BY id ASC
      `;
      queryParams = [`%${searchQuery.trim()}%`];
    }

    const result = await pool.query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to retrieve items from database' });
  }
};

/**
 * Get a single item by ID
 */
export const getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Item with ID ${id} not found` });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching item with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve item details' });
  }
};
