import { pool } from './database.js';

const createItemsTableQuery = `
  DROP TABLE IF EXISTS items;

  CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    rating NUMERIC(3, 1) NOT NULL
  );
`;

const seedData = [
  {
    title: 'Artificial Intelligence & Generative LLMs',
    description: 'Advanced machine learning models and generative AI capable of understanding context, writing code, and reasoning across multimodal data.',
    category: 'AI & Software',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
  },
  {
    title: 'Quantum Computing',
    description: 'Superconducting processors leveraging quantum superposition and entanglement to solve complex mathematical problems exponentially faster.',
    category: 'Hardware & Physics',
    image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    title: 'Renewable Solar & Fusion Energy',
    description: 'Next-generation photovoltaic cells and fusion reactor prototypes driving zero-emission sustainable power generation.',
    category: 'Energy & Sustainability',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },
  {
    title: 'CRISPR Gene Editing Technology',
    description: 'Precision molecular scissors allowing targeted editing of DNA sequences to eradicate genetic diseases and boost crop resiliency.',
    category: 'Biotechnology',
    image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    title: 'Autonomous Electric Vehicles (EVs)',
    description: 'Self-driving battery electric vehicles equipped with LiDAR, computer vision, and neural networks for safe automated transit.',
    category: 'Transportation',
    image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    title: 'Reusable Orbital Space Rockets',
    description: 'Launch vehicles capable of landing autonomously back on Earth for rapid refurbishment, reducing payload costs to orbit.',
    category: 'Aerospace & Exploration',
    image_url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },
  {
    title: 'Augmented & Virtual Reality Headsets',
    description: 'Spatial computing devices providing immersive digital overlays and virtual environments with micro-OLED displays.',
    category: 'Hardware & Display',
    image_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
  },
  {
    title: 'Solid-State Battery Storage',
    description: 'Energy-dense battery technology replacing liquid electrolytes with solid ceramics for faster charging and greater safety.',
    category: 'Energy & Sustainability',
    image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },
  {
    title: 'Low Earth Orbit Satellite Broadband',
    description: 'Global internet satellite mega-constellations delivering high-speed low-latency broadband connectivity to remote areas.',
    category: 'Telecommunications',
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    title: 'Brain-Computer Interfaces (BCI)',
    description: 'Direct neural interface implants and non-invasive sensors translating brain signals into control commands for prosthetics and computers.',
    category: 'Biotechnology & Neuroscience',
    image_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
];

async function seedTable() {
  try {
    await pool.query(createItemsTableQuery);
    console.log('✅ items table created successfully.');

    for (const item of seedData) {
      const insertQuery = `
        INSERT INTO items (title, description, category, image_url, rating)
        VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [item.title, item.description, item.category, item.image_url, item.rating];
      await pool.query(insertQuery, values);
    }
    console.log('🌱 Seeded 10 listicle tech innovation items.');
  } catch (err) {
    console.error('❌ Error resetting database table:', err);
  } finally {
    await pool.end();
  }
}

seedTable();
