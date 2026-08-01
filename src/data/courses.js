export const courses = [
  {
    id: 'course-001',
    title: 'The Art of Blue Pottery — From Earth to Elegance',
    shortTitle: 'Blue Pottery Masterclass',
    instructor: 'Lakshmi Devi',
    instructorId: 'art-001',
    category: 'pottery',
    difficulty: 'Beginner',
    duration: '6 weeks',
    totalHours: 24,
    lessons: 18,
    students: 1240,
    rating: 4.9,
    reviews: 342,
    price: 2999,
    originalPrice: 4999,
    featured: true,
    enrolled: false,
    progress: 0,
    description: 'Learn the centuries-old craft of Jaipur Blue Pottery from National Award winner Lakshmi Devi. From preparing quartz-based clay to painting intricate Mughal patterns, this comprehensive course covers every step of this unique Persian-Rajasthani art form.',
    whatYouLearn: [
      'Prepare authentic quartz-based blue pottery clay (no regular clay!)',
      'Master the traditional coil and slab forming techniques',
      'Mix natural cobalt and copper oxide glazes',
      'Paint Mughal floral motifs with single-hair brushes',
      'Fire and finish pieces to achieve the signature turquoise glaze',
      'Understand the history and cultural significance of Blue Pottery',
    ],
    curriculum: [
      {
        title: 'Introduction to Blue Pottery',
        lessons: [
          { id: 'l-001', title: 'The History of Jaipur Blue Pottery', duration: '18 min', type: 'video', completed: false },
          { id: 'l-002', title: 'Understanding Quartz-Based Clay', duration: '22 min', type: 'video', completed: false },
          { id: 'l-003', title: 'Setting Up Your Workspace', duration: '15 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Clay Preparation & Forming',
        lessons: [
          { id: 'l-004', title: 'Mixing the Perfect Blue Pottery Clay', duration: '35 min', type: 'video', completed: false },
          { id: 'l-005', title: 'Coil Building Technique', duration: '40 min', type: 'video', completed: false },
          { id: 'l-006', title: 'Slab Construction Method', duration: '30 min', type: 'video', completed: false },
          { id: 'l-007', title: 'Practice: Create Your First Form', duration: '60 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Glazing & Painting',
        lessons: [
          { id: 'l-008', title: 'Preparing Natural Oxide Glazes', duration: '25 min', type: 'video', completed: false },
          { id: 'l-009', title: 'Traditional Mughal Patterns', duration: '45 min', type: 'video', completed: false },
          { id: 'l-010', title: 'Single-Hair Brush Techniques', duration: '35 min', type: 'video', completed: false },
          { id: 'l-011', title: 'Practice: Paint Your First Piece', duration: '90 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Firing & Finishing',
        lessons: [
          { id: 'l-012', title: 'Kiln Preparation & Temperature Control', duration: '20 min', type: 'video', completed: false },
          { id: 'l-013', title: 'The Firing Process', duration: '28 min', type: 'video', completed: false },
          { id: 'l-014', title: 'Finishing & Quality Check', duration: '18 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Advanced Techniques & Final Project',
        lessons: [
          { id: 'l-015', title: 'Multi-Color Designs', duration: '40 min', type: 'video', completed: false },
          { id: 'l-016', title: 'Creating Functional Pieces', duration: '35 min', type: 'video', completed: false },
          { id: 'l-017', title: 'Final Project: Complete Blue Pottery Set', duration: '120 min', type: 'assignment', completed: false },
          { id: 'l-018', title: 'Course Review & Certificate', duration: '15 min', type: 'quiz', completed: false },
        ]
      },
    ],
    tags: ['pottery', 'blue pottery', 'jaipur', 'beginner'],
  },
  {
    id: 'course-002',
    title: 'Madhubani Painting — Ancient Art for Modern Souls',
    shortTitle: 'Madhubani Painting',
    instructor: 'Meena Kumari',
    instructorId: 'art-003',
    category: 'painting',
    difficulty: 'Beginner',
    duration: '4 weeks',
    totalHours: 16,
    lessons: 14,
    students: 2100,
    rating: 4.9,
    reviews: 456,
    price: 1999,
    originalPrice: 3499,
    featured: true,
    enrolled: false,
    progress: 0,
    description: 'Discover the 2,500-year-old art of Madhubani painting with internationally acclaimed artist Meena Kumari. Learn to create stunning mythological narratives using natural pigments and traditional techniques passed down through generations.',
    whatYouLearn: [
      'Understand the five distinct styles of Madhubani art',
      'Prepare natural pigments from flowers, leaves, and minerals',
      'Master the iconic double-line technique',
      'Create mythological narrative compositions',
      'Paint the sacred Tree of Life and Kohbar motifs',
      'Develop your unique artistic voice within the tradition',
    ],
    curriculum: [
      {
        title: 'Foundations of Madhubani',
        lessons: [
          { id: 'l-101', title: 'History & Cultural Significance', duration: '20 min', type: 'video', completed: false },
          { id: 'l-102', title: 'The Five Styles of Madhubani', duration: '25 min', type: 'video', completed: false },
          { id: 'l-103', title: 'Materials & Natural Pigments', duration: '18 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Basic Techniques',
        lessons: [
          { id: 'l-104', title: 'The Double-Line Technique', duration: '30 min', type: 'video', completed: false },
          { id: 'l-105', title: 'Basic Motifs — Fish, Peacock, Lotus', duration: '35 min', type: 'video', completed: false },
          { id: 'l-106', title: 'Practice: Your First Madhubani Motif', duration: '45 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Bharni Style Deep Dive',
        lessons: [
          { id: 'l-107', title: 'Color Filling with Bharni Technique', duration: '28 min', type: 'video', completed: false },
          { id: 'l-108', title: 'Creating the Tree of Life', duration: '40 min', type: 'video', completed: false },
          { id: 'l-109', title: 'Practice: Tree of Life Painting', duration: '60 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Advanced Composition',
        lessons: [
          { id: 'l-110', title: 'Narrative Composition Principles', duration: '25 min', type: 'video', completed: false },
          { id: 'l-111', title: 'Kohbar — The Sacred Wedding Art', duration: '35 min', type: 'video', completed: false },
          { id: 'l-112', title: 'Final Project: Complete Narrative Piece', duration: '90 min', type: 'assignment', completed: false },
          { id: 'l-113', title: 'Course Review & Quiz', duration: '15 min', type: 'quiz', completed: false },
          { id: 'l-114', title: 'Certificate & Next Steps', duration: '10 min', type: 'video', completed: false },
        ]
      },
    ],
    tags: ['painting', 'madhubani', 'bihar', 'folk art', 'beginner'],
  },
  {
    id: 'course-003',
    title: 'The Sacred Craft of Pashmina Weaving',
    shortTitle: 'Pashmina Weaving',
    instructor: 'Abdul Kareem',
    instructorId: 'art-004',
    category: 'textile',
    difficulty: 'Advanced',
    duration: '12 weeks',
    totalHours: 48,
    lessons: 24,
    students: 560,
    rating: 5.0,
    reviews: 178,
    price: 7999,
    originalPrice: 12999,
    featured: true,
    enrolled: false,
    progress: 0,
    description: 'An extraordinary journey into the world\'s finest textile art with seventh-generation master weaver Abdul Kareem. Learn the ancient Kani weave technique that produces shawls so fine they can pass through a ring.',
    whatYouLearn: [
      'Understand Pashmina fiber — from Changthangi goat to finished yarn',
      'Set up and operate a traditional Kashmiri handloom',
      'Master the Kani weave using wooden bobbins',
      'Create Sozni (needlework) embroidery patterns',
      'Authenticate genuine Pashmina from machine-made imitations',
      'Design original patterns inspired by Kashmiri gardens',
    ],
    curriculum: [
      {
        title: 'The World of Pashmina',
        lessons: [
          { id: 'l-201', title: 'The Changthangi Goat & Pashmina Fiber', duration: '22 min', type: 'video', completed: false },
          { id: 'l-202', title: 'History of Kashmiri Weaving', duration: '18 min', type: 'video', completed: false },
          { id: 'l-203', title: 'Fiber Processing & Spinning', duration: '30 min', type: 'video', completed: false },
          { id: 'l-204', title: 'Understanding the Handloom', duration: '25 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Basic Weaving',
        lessons: [
          { id: 'l-205', title: 'Setting Up the Warp', duration: '35 min', type: 'video', completed: false },
          { id: 'l-206', title: 'Basic Weave Patterns', duration: '40 min', type: 'video', completed: false },
          { id: 'l-207', title: 'Color Theory for Textiles', duration: '20 min', type: 'video', completed: false },
          { id: 'l-208', title: 'Practice: Your First Weave Sample', duration: '120 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Kani Weave Technique',
        lessons: [
          { id: 'l-209', title: 'Introduction to Kani Bobbins', duration: '25 min', type: 'video', completed: false },
          { id: 'l-210', title: 'Reading Talim (Pattern Code)', duration: '35 min', type: 'video', completed: false },
          { id: 'l-211', title: 'Kani Weave — Step by Step', duration: '50 min', type: 'video', completed: false },
          { id: 'l-212', title: 'Practice: Kani Sample', duration: '180 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Sozni Embroidery',
        lessons: [
          { id: 'l-213', title: 'Sozni Needle Techniques', duration: '30 min', type: 'video', completed: false },
          { id: 'l-214', title: 'Traditional Floral Patterns', duration: '40 min', type: 'video', completed: false },
          { id: 'l-215', title: 'Color Gradation in Embroidery', duration: '25 min', type: 'video', completed: false },
          { id: 'l-216', title: 'Practice: Sozni Border', duration: '120 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Advanced & Authentication',
        lessons: [
          { id: 'l-217', title: 'Designing Original Patterns', duration: '35 min', type: 'video', completed: false },
          { id: 'l-218', title: 'Natural Dyeing for Pashmina', duration: '28 min', type: 'video', completed: false },
          { id: 'l-219', title: 'The Ring Test & Authentication', duration: '20 min', type: 'video', completed: false },
          { id: 'l-220', title: 'GI Tag & Certification Process', duration: '15 min', type: 'video', completed: false },
          { id: 'l-221', title: 'Final Project: Complete Stole', duration: '300 min', type: 'assignment', completed: false },
          { id: 'l-222', title: 'Portfolio Building & Selling', duration: '20 min', type: 'video', completed: false },
          { id: 'l-223', title: 'Final Assessment', duration: '30 min', type: 'quiz', completed: false },
          { id: 'l-224', title: 'Certificate & Mentorship', duration: '10 min', type: 'video', completed: false },
        ]
      },
    ],
    tags: ['textile', 'pashmina', 'kashmir', 'weaving', 'advanced'],
  },
  {
    id: 'course-004',
    title: 'Dhokra Bronze Casting — The Lost-Wax Method',
    shortTitle: 'Dhokra Bronze Casting',
    instructor: 'Savitri Bai',
    instructorId: 'art-005',
    category: 'metalwork',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    totalHours: 32,
    lessons: 16,
    students: 780,
    rating: 4.7,
    reviews: 234,
    price: 3999,
    originalPrice: 5999,
    featured: true,
    enrolled: false,
    progress: 0,
    description: 'Explore the 4,000-year-old lost-wax casting technique with tribal master Savitri Bai. Create unique bronze figurines and jewelry using the same method that produced the Dancing Girl of Mohenjo-daro.',
    whatYouLearn: [
      'Master the lost-wax (cire perdue) casting process',
      'Create beeswax models and thread patterns',
      'Build clay molds with rice husk tempering',
      'Melt and pour bronze alloy safely',
      'Finish and patina bronze pieces',
      'Understand tribal symbolism and design language',
    ],
    curriculum: [
      {
        title: 'Origins & Materials',
        lessons: [
          { id: 'l-301', title: 'The 4,000-Year Legacy', duration: '18 min', type: 'video', completed: false },
          { id: 'l-302', title: 'Materials & Tools Overview', duration: '22 min', type: 'video', completed: false },
          { id: 'l-303', title: 'Safety in Metal Casting', duration: '15 min', type: 'video', completed: false },
          { id: 'l-304', title: 'Tribal Symbolism Guide', duration: '20 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Wax Modeling',
        lessons: [
          { id: 'l-305', title: 'Preparing Beeswax', duration: '20 min', type: 'video', completed: false },
          { id: 'l-306', title: 'Thread & Coil Wax Techniques', duration: '35 min', type: 'video', completed: false },
          { id: 'l-307', title: 'Creating Your Wax Model', duration: '60 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Mold Making & Casting',
        lessons: [
          { id: 'l-308', title: 'Clay Mold Preparation', duration: '30 min', type: 'video', completed: false },
          { id: 'l-309', title: 'The Melting & Pouring Process', duration: '40 min', type: 'video', completed: false },
          { id: 'l-310', title: 'Breaking the Mold — The Reveal', duration: '20 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Finishing & Projects',
        lessons: [
          { id: 'l-311', title: 'Filing & Smoothing', duration: '25 min', type: 'video', completed: false },
          { id: 'l-312', title: 'Patina & Aging Techniques', duration: '20 min', type: 'video', completed: false },
          { id: 'l-313', title: 'Jewelry: Earrings & Pendants', duration: '45 min', type: 'video', completed: false },
          { id: 'l-314', title: 'Final Project: Tribal Figurine', duration: '120 min', type: 'assignment', completed: false },
          { id: 'l-315', title: 'Final Assessment', duration: '20 min', type: 'quiz', completed: false },
          { id: 'l-316', title: 'Certificate & Community', duration: '10 min', type: 'video', completed: false },
        ]
      },
    ],
    tags: ['metalwork', 'dhokra', 'bronze', 'casting', 'tribal', 'intermediate'],
  },
  {
    id: 'course-005',
    title: 'Hand Block Printing — Stamps of Tradition',
    shortTitle: 'Hand Block Printing',
    instructor: 'Anjali Sharma',
    instructorId: 'art-009',
    category: 'textile',
    difficulty: 'Beginner',
    duration: '5 weeks',
    totalHours: 20,
    lessons: 15,
    students: 1650,
    rating: 4.7,
    reviews: 523,
    price: 2499,
    originalPrice: 3999,
    featured: false,
    enrolled: false,
    progress: 0,
    description: 'Learn the 300-year-old art of Bagru hand block printing with natural dyes. From carving wooden blocks to creating stunning textile patterns, discover why this ancient craft is experiencing a global renaissance.',
    whatYouLearn: [
      'Carve basic wooden printing blocks',
      'Prepare natural dyes from indigo, pomegranate, and turmeric',
      'Master the dabu (mud resist) technique',
      'Create repeat patterns and borders',
      'Print on various fabrics — cotton, silk, linen',
      'Build a collection of printed textiles',
    ],
    curriculum: [
      {
        title: 'Introduction to Block Printing',
        lessons: [
          { id: 'l-401', title: 'History of Bagru Block Printing', duration: '15 min', type: 'video', completed: false },
          { id: 'l-402', title: 'Types of Blocks & Patterns', duration: '20 min', type: 'video', completed: false },
          { id: 'l-403', title: 'Setting Up Your Print Station', duration: '18 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Natural Dyes',
        lessons: [
          { id: 'l-404', title: 'Indigo Dye Preparation', duration: '30 min', type: 'video', completed: false },
          { id: 'l-405', title: 'Pomegranate, Turmeric & Madder', duration: '25 min', type: 'video', completed: false },
          { id: 'l-406', title: 'Practice: Dye Sample Fabrics', duration: '45 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Printing Techniques',
        lessons: [
          { id: 'l-407', title: 'Basic Stamping Technique', duration: '30 min', type: 'video', completed: false },
          { id: 'l-408', title: 'Repeat Patterns & Alignment', duration: '35 min', type: 'video', completed: false },
          { id: 'l-409', title: 'The Dabu Mud Resist Method', duration: '40 min', type: 'video', completed: false },
          { id: 'l-410', title: 'Practice: Print a Table Runner', duration: '60 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Advanced & Final Project',
        lessons: [
          { id: 'l-411', title: 'Multi-Color Printing', duration: '30 min', type: 'video', completed: false },
          { id: 'l-412', title: 'Printing on Silk & Fine Fabrics', duration: '25 min', type: 'video', completed: false },
          { id: 'l-413', title: 'Final Project: Complete Textile Set', duration: '90 min', type: 'assignment', completed: false },
          { id: 'l-414', title: 'Quiz & Assessment', duration: '15 min', type: 'quiz', completed: false },
          { id: 'l-415', title: 'Certificate & Next Steps', duration: '10 min', type: 'video', completed: false },
        ]
      },
    ],
    tags: ['textile', 'block printing', 'rajasthan', 'natural dye', 'beginner'],
  },
  {
    id: 'course-006',
    title: 'Warli Art — Tribal Stories on Canvas',
    shortTitle: 'Warli Art Fundamentals',
    instructor: 'Suresh Patel',
    instructorId: 'art-010',
    category: 'painting',
    difficulty: 'Beginner',
    duration: '3 weeks',
    totalHours: 12,
    lessons: 10,
    students: 1100,
    rating: 4.8,
    reviews: 287,
    price: 1499,
    originalPrice: 2499,
    featured: false,
    enrolled: false,
    progress: 0,
    description: 'Enter the world of Warli tribal art — one of the oldest art forms on Earth. Using just circles, triangles, and squares, learn to create powerful visual narratives that have captivated art lovers worldwide.',
    whatYouLearn: [
      'Understand the geometric visual language of Warli art',
      'Prepare traditional rice paste medium',
      'Master the circle-triangle-square vocabulary',
      'Create human figures, animals, and nature scenes',
      'Compose narrative scenes depicting daily life',
      'Adapt Warli art for modern surfaces and products',
    ],
    curriculum: [
      {
        title: 'Understanding Warli',
        lessons: [
          { id: 'l-501', title: 'The Warli Tribe & Their Art', duration: '18 min', type: 'video', completed: false },
          { id: 'l-502', title: 'Geometric Language — Circles, Triangles, Squares', duration: '22 min', type: 'video', completed: false },
          { id: 'l-503', title: 'Preparing Rice Paste Medium', duration: '15 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Basic Elements',
        lessons: [
          { id: 'l-504', title: 'Human Figures & Movement', duration: '25 min', type: 'video', completed: false },
          { id: 'l-505', title: 'Animals, Trees & Nature', duration: '30 min', type: 'video', completed: false },
          { id: 'l-506', title: 'Practice: Basic Warli Elements', duration: '45 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Composition & Projects',
        lessons: [
          { id: 'l-507', title: 'Narrative Composition Techniques', duration: '25 min', type: 'video', completed: false },
          { id: 'l-508', title: 'The Tarpa Dance — Iconic Scene', duration: '30 min', type: 'video', completed: false },
          { id: 'l-509', title: 'Final Project: Circle of Life Painting', duration: '60 min', type: 'assignment', completed: false },
          { id: 'l-510', title: 'Certificate & Assessment', duration: '15 min', type: 'quiz', completed: false },
        ]
      },
    ],
    tags: ['painting', 'warli', 'tribal', 'beginner', 'maharashtra'],
  },
  {
    id: 'course-007',
    title: 'Chikankari Embroidery — Stitches of Lucknow',
    shortTitle: 'Chikankari Embroidery',
    instructor: 'Fatima Begum',
    instructorId: 'art-011',
    category: 'textile',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    totalHours: 32,
    lessons: 16,
    students: 870,
    rating: 4.9,
    reviews: 398,
    price: 3499,
    originalPrice: 5499,
    featured: true,
    enrolled: false,
    progress: 0,
    description: 'Master the ethereal art of Lucknow Chikankari with embroidery virtuoso Fatima Begum. Learn 32 traditional stitches, from delicate tepchi to the prized murri, and create shadow-work embroidery that catches light like moonbeams.',
    whatYouLearn: [
      'Master 32 traditional Chikankari stitches',
      'Create shadow-work (tepchi) embroidery',
      'Work with muslin, georgette, and silk fabrics',
      'Design traditional and contemporary patterns',
      'Understand the grading system for Chikankari quality',
      'Create complete garment-ready embroidered pieces',
    ],
    curriculum: [
      {
        title: 'Introduction & Basics',
        lessons: [
          { id: 'l-601', title: 'The Mughal Legacy of Chikankari', duration: '18 min', type: 'video', completed: false },
          { id: 'l-602', title: 'Fabrics, Threads & Needles', duration: '20 min', type: 'video', completed: false },
          { id: 'l-603', title: 'Basic Transfer Techniques', duration: '22 min', type: 'video', completed: false },
          { id: 'l-604', title: 'Tepchi — The Foundation Stitch', duration: '30 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Essential Stitches',
        lessons: [
          { id: 'l-605', title: 'Bakhia — The Shadow Stitch', duration: '35 min', type: 'video', completed: false },
          { id: 'l-606', title: 'Murri — The Crown Jewel', duration: '40 min', type: 'video', completed: false },
          { id: 'l-607', title: 'Phanda, Jali & Hool Stitches', duration: '35 min', type: 'video', completed: false },
          { id: 'l-608', title: 'Practice: Stitch Sampler', duration: '90 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Pattern Design',
        lessons: [
          { id: 'l-609', title: 'Traditional Floral Patterns', duration: '30 min', type: 'video', completed: false },
          { id: 'l-610', title: 'Paisley & Vine Motifs', duration: '28 min', type: 'video', completed: false },
          { id: 'l-611', title: 'Contemporary Design Adaptation', duration: '25 min', type: 'video', completed: false },
          { id: 'l-612', title: 'Practice: Design Your Own Pattern', duration: '60 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Advanced & Final Project',
        lessons: [
          { id: 'l-613', title: 'Working on Silk & Georgette', duration: '30 min', type: 'video', completed: false },
          { id: 'l-614', title: 'Quality Grading & Assessment', duration: '20 min', type: 'video', completed: false },
          { id: 'l-615', title: 'Final Project: Embroidered Panel', duration: '120 min', type: 'assignment', completed: false },
          { id: 'l-616', title: 'Certificate & Artisan Network', duration: '10 min', type: 'quiz', completed: false },
        ]
      },
    ],
    tags: ['textile', 'chikankari', 'embroidery', 'lucknow', 'intermediate'],
  },
  {
    id: 'course-008',
    title: 'Wood Carving — The Living Art of Saharanpur',
    shortTitle: 'Traditional Wood Carving',
    instructor: 'Ramesh Suthar',
    instructorId: 'art-002',
    category: 'woodwork',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    totalHours: 40,
    lessons: 20,
    students: 890,
    rating: 4.8,
    reviews: 289,
    price: 4499,
    originalPrice: 6999,
    featured: false,
    enrolled: false,
    progress: 0,
    description: 'Learn the art of traditional Indian wood carving from Shilp Guru awardee Ramesh Suthar. From selecting the right timber to carving intricate jali screens, this comprehensive course transforms beginners into skilled wood artisans.',
    whatYouLearn: [
      'Select and prepare different wood types',
      'Master essential carving tools and techniques',
      'Create relief and through carvings',
      'Design and carve geometric jali patterns',
      'Apply traditional and modern finishing techniques',
      'Build functional decorative pieces',
    ],
    curriculum: [
      {
        title: 'Introduction to Wood Carving',
        lessons: [
          { id: 'l-701', title: 'History of Saharanpur Woodwork', duration: '18 min', type: 'video', completed: false },
          { id: 'l-702', title: 'Wood Types — Sheesham, Teak, Walnut', duration: '22 min', type: 'video', completed: false },
          { id: 'l-703', title: 'Tools of the Trade', duration: '25 min', type: 'video', completed: false },
          { id: 'l-704', title: 'Safety & Workspace Setup', duration: '15 min', type: 'video', completed: false },
        ]
      },
      {
        title: 'Basic Carving',
        lessons: [
          { id: 'l-705', title: 'Chip Carving Fundamentals', duration: '35 min', type: 'video', completed: false },
          { id: 'l-706', title: 'Relief Carving Techniques', duration: '40 min', type: 'video', completed: false },
          { id: 'l-707', title: 'Grain Direction & Tool Control', duration: '25 min', type: 'video', completed: false },
          { id: 'l-708', title: 'Practice: Carved Decorative Panel', duration: '90 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Jali Work',
        lessons: [
          { id: 'l-709', title: 'Understanding Jali Geometry', duration: '30 min', type: 'video', completed: false },
          { id: 'l-710', title: 'Drilling & Piercing Techniques', duration: '35 min', type: 'video', completed: false },
          { id: 'l-711', title: 'Creating a Jali Screen', duration: '45 min', type: 'video', completed: false },
          { id: 'l-712', title: 'Practice: Jali Window Panel', duration: '120 min', type: 'assignment', completed: false },
        ]
      },
      {
        title: 'Finishing & Projects',
        lessons: [
          { id: 'l-713', title: 'Sanding & Smoothing', duration: '20 min', type: 'video', completed: false },
          { id: 'l-714', title: 'Oil, Wax & Lacquer Finishes', duration: '25 min', type: 'video', completed: false },
          { id: 'l-715', title: 'Creating Functional Items', duration: '35 min', type: 'video', completed: false },
          { id: 'l-716', title: 'Final Project: Carved Decorative Box', duration: '150 min', type: 'assignment', completed: false },
          { id: 'l-717', title: 'Floral & Vine Carving', duration: '30 min', type: 'video', completed: false },
          { id: 'l-718', title: 'Combining Techniques', duration: '25 min', type: 'video', completed: false },
          { id: 'l-719', title: 'Final Assessment', duration: '20 min', type: 'quiz', completed: false },
          { id: 'l-720', title: 'Certificate & Artisan Community', duration: '10 min', type: 'video', completed: false },
        ]
      },
    ],
    tags: ['woodwork', 'carving', 'saharanpur', 'jali', 'intermediate'],
  },
];

export const featuredCourses = courses.filter(c => c.featured);

export const getCourseById = (id) => courses.find(c => c.id === id);

export const getCoursesByCategory = (category) => courses.filter(c => c.category === category);
