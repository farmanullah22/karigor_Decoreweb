/**
 * Development seed content for Decora.
 * All images reference placeholder SVGs shipped with the frontend
 * (frontend/public/seed-images) - replace them from the dashboard.
 */

const IMG = (name) => `/seed-images/${name}.svg`;

const productCategories = [
  { name: 'Windows', description: 'Aluminum, UPVC and custom-made window systems for every space.', sortOrder: 1 },
  { name: 'Doors', description: 'Sliding, casement and frameless glass door solutions.', sortOrder: 2 },
  { name: 'Aluminum', description: 'Aluminum profiles, panels and fabricated structures.', sortOrder: 3 },
  { name: 'Glass', description: 'Toughened, laminated, frosted and decorative glass.', sortOrder: 4 },
  { name: 'Partitions', description: 'Office, shower and room divider glass partitions.', sortOrder: 5 },
  { name: 'Decoration', description: 'Interior and exterior decoration products and finishes.', sortOrder: 6 },
  { name: 'Custom Solutions', description: 'Made-to-order fabrication tailored to your project.', sortOrder: 7 },
];

const projectCategories = [
  { name: 'Residential', sortOrder: 1 },
  { name: 'Commercial', sortOrder: 2 },
  { name: 'Office', sortOrder: 3 },
  { name: 'Windows', sortOrder: 4 },
  { name: 'Doors', sortOrder: 5 },
  { name: 'Glass', sortOrder: 6 },
  { name: 'Aluminum', sortOrder: 7 },
  { name: 'Interior', sortOrder: 8 },
];

const products = [
  {
    name: 'Aluminum Sliding Window',
    category: 'Windows',
    shortDescription: 'Smooth-glide aluminum sliding windows with premium weather sealing.',
    description:
      'Our aluminum sliding windows combine slim profiles with strong, durable construction. Precision-fitted rollers ensure a smooth glide, while quality gaskets keep dust, rain and noise out. A practical, low-maintenance choice for homes and offices alike.',
    features: ['Smooth dual-track sliding system', 'Corrosion-resistant powder-coated finish', 'Integrated mosquito net option', 'Weather-sealed construction'],
    specifications: [
      { label: 'Profile', value: 'Aluminum, powder coated' },
      { label: 'Glass', value: '5mm clear / tinted float glass' },
      { label: 'Tracks', value: '2-track or 3-track options' },
      { label: 'Finish', value: 'Anodized or powder coated' },
    ],
    materials: ['Aluminum', 'Tempered Glass', 'Stainless Steel Rollers'],
    colors: ['Black', 'White', 'Champagne', 'Bronze'],
    image: IMG('product-aluminum-sliding-window'),
    gallery: [IMG('product-aluminum-sliding-window-2'), IMG('product-aluminum-sliding-window-3')],
    featured: true,
    sortOrder: 1,
  },
  {
    name: 'UPVC Casement Window',
    category: 'Windows',
    shortDescription: 'Energy-efficient UPVC casement windows with multi-point locking.',
    description:
      'UPVC casement windows deliver excellent thermal and acoustic insulation. The multi-chamber profile and multi-point locking system make them a secure, energy-efficient choice for bedrooms, living areas and offices.',
    features: ['Multi-chamber thermal insulation', 'Multi-point security locking', 'Sound reduction up to 30dB', 'Low maintenance'],
    specifications: [
      { label: 'Profile', value: 'UPVC, steel reinforced' },
      { label: 'Glass', value: 'Double glazed (4-12-4) option' },
      { label: 'Opening', value: 'Side hung / top hung' },
      { label: 'Hardware', value: 'Multi-point locking' },
    ],
    materials: ['UPVC', 'Double Glazed Glass', 'Galvanized Steel Reinforcement'],
    colors: ['White', 'Ash Grey', 'Walnut'],
    image: IMG('product-upvc-casement-window'),
    gallery: [IMG('product-upvc-casement-window-2')],
    featured: true,
    sortOrder: 2,
  },
  {
    name: 'Aluminum Casement Door',
    category: 'Doors',
    shortDescription: 'Strong aluminum framed doors with a clean, modern profile.',
    description:
      'Built on an aluminum frame with tempered glass infill, our casement doors are durable, secure and modern. They suit balconies, utility areas and commercial entrances where strength matters.',
    features: ['Heavy-duty aluminum frame', 'Tempered safety glass', 'Heavy-duty hinges and lock', 'Powder-coated finish'],
    specifications: [
      { label: 'Frame', value: '3" x 2" aluminum section' },
      { label: 'Glass', value: '6mm toughened' },
      { label: 'Locking', value: 'Heavy-duty multipoint lock' },
    ],
    materials: ['Aluminum', 'Toughened Glass'],
    colors: ['Matte Black', 'Silver', 'Bronze'],
    image: IMG('product-aluminum-casement-door'),
    gallery: [],
    featured: false,
    sortOrder: 3,
  },
  {
    name: 'Frameless Glass Door',
    category: 'Doors',
    shortDescription: 'Minimal 12mm frameless glass doors for a premium look.',
    description:
      'Frameless glass doors maximize light and space with an uninterrupted glass surface. Fitted with premium hydraulic floor springs or patch fittings, they are ideal for modern offices, showrooms and retail spaces.',
    features: ['12mm toughened safety glass', 'Hydraulic floor spring or patch fittings', 'Custom hardware finishes', 'Floor-to-ceiling options'],
    specifications: [
      { label: 'Glass', value: '12mm toughened, polished edges' },
      { label: 'Hardware', value: 'SS 304 patch fittings' },
      { label: 'Operation', value: 'Manual / hydraulic floor spring' },
    ],
    materials: ['Toughened Glass', 'Stainless Steel Hardware'],
    colors: ['Clear', 'Frosted', 'Tinted'],
    image: IMG('product-frameless-glass-door'),
    gallery: [IMG('product-frameless-glass-door-2')],
    featured: true,
    sortOrder: 4,
  },
  {
    name: 'Toughened Glass Panel',
    category: 'Glass',
    shortDescription: 'High-strength toughened glass cut to your exact sizes.',
    description:
      'Our toughened glass panels are processed to break into small granular pieces for maximum safety. Suitable for doors, windows, partitions, railings and table tops - available in a range of thicknesses.',
    features: ['4-19mm thickness range', 'Safety-compliant breakage pattern', 'Polished edges and custom drilling', 'Heat-treated for strength'],
    specifications: [
      { label: 'Thickness', value: '5mm - 19mm' },
      { label: 'Edge', value: 'Flat polished / beveled' },
      { label: 'Standard', value: 'ASTM C1048 compliant' },
    ],
    materials: ['Toughened Glass'],
    colors: ['Clear', 'Extra Clear', 'Tinted'],
    image: IMG('product-toughened-glass'),
    gallery: [],
    featured: false,
    sortOrder: 5,
  },
  {
    name: 'Frosted Glass Sheet',
    category: 'Glass',
    shortDescription: 'Privacy-friendly frosted glass for bathrooms and offices.',
    description:
      'Frosted glass provides privacy without sacrificing light. It is commonly used in bathroom windows, office partitions and cabin doors. Available with window film or acid-etched finish.',
    features: ['Privacy with light transmission', 'Uniform acid-etched finish', 'Easy to clean', 'Cut-to-size service'],
    specifications: [
      { label: 'Thickness', value: '5mm / 6mm / 8mm' },
      { label: 'Finish', value: 'Acid etched / sand blasted' },
    ],
    materials: ['Frosted Glass'],
    colors: ['White Frost', 'Satin'],
    image: IMG('product-frosted-glass'),
    gallery: [],
    featured: false,
    sortOrder: 6,
  },
  {
    name: 'Aluminum Profiles',
    category: 'Aluminum',
    shortDescription: 'High-grade aluminum sections for fabrication projects.',
    description:
      'We supply extruded aluminum profiles in a wide range of standard sections for windows, doors, cabinets and structural fabrication - available anodized or powder coated.',
    features: ['Wide range of sections', 'Anodized and powder-coated finishes', 'Consistent 6063 alloy quality', 'Cut-to-length service'],
    specifications: [
      { label: 'Alloy', value: '6063-T5 / 6061' },
      { label: 'Length', value: '12 ft standard' },
      { label: 'Finish', value: 'Mill, anodized, powder coated' },
    ],
    materials: ['Aluminum Alloy'],
    colors: ['Natural', 'Black', 'Champagne', 'Bronze'],
    image: IMG('product-aluminum-profiles'),
    gallery: [],
    featured: false,
    sortOrder: 7,
  },
  {
    name: 'Aluminum Composite Panel',
    category: 'Aluminum',
    shortDescription: 'Weatherproof ACP panels for facades and signage.',
    description:
      'Aluminum Composite Panels (ACP) offer a flat, uniform and durable surface for building facades, signage and interior cladding. The PE/PVDF coated surface resists weather and UV exposure.',
    features: ['UV and weather resistant coating', 'Lightweight yet rigid', 'Easy to fabricate and install', 'Wide color selection'],
    specifications: [
      { label: 'Thickness', value: '3mm / 4mm' },
      { label: 'Coating', value: 'PE / PVDF' },
      { label: 'Panel size', value: '2440mm x 1220mm' },
    ],
    materials: ['Aluminum', 'Polyethylene Core'],
    colors: ['Silver', 'Charcoal', 'Wood Grain', 'Custom RAL'],
    image: IMG('product-acp-panel'),
    gallery: [],
    featured: false,
    sortOrder: 8,
  },
  {
    name: 'Office Glass Partition',
    category: 'Partitions',
    shortDescription: 'Sleek glass partition systems for modern workplaces.',
    description:
      'Our office glass partitions use slim aluminum or steel frames with toughened or double-glazed panels. They create bright, flexible workspaces while keeping the layout open and professional.',
    features: ['Single or double glazed options', 'Aluminum framing, powder coated', 'Integrated blind option', 'Dedicated door systems'],
    specifications: [
      { label: 'Glass', value: '10mm toughened / 6-12-6 DGU' },
      { label: 'Frame', value: 'Aluminum, slim profile' },
      { label: 'Height', value: 'Up to 3m per run' },
    ],
    materials: ['Toughened Glass', 'Aluminum'],
    colors: ['Black', 'Silver', 'White'],
    image: IMG('product-office-partition'),
    gallery: [IMG('product-office-partition-2')],
    featured: true,
    sortOrder: 9,
  },
  {
    name: 'Sliding Folding Partition',
    category: 'Partitions',
    shortDescription: 'Fold-away glass partitions that open up any space.',
    description:
      'Sliding folding partitions let you divide or open up a space in seconds. Ideal for banquet halls, restaurants and large offices, they glide on a concealed top track with a slim bottom guide.',
    features: ['Top-hung smooth sliding', 'Concealed hardware', 'Sound insulated option', 'Custom panel size'],
    specifications: [
      { label: 'Glass', value: '6mm / 8mm toughened' },
      { label: 'Track', value: 'Anodized aluminum top track' },
      { label: 'Panels', value: '600-900mm widths' },
    ],
    materials: ['Toughened Glass', 'Aluminum Track'],
    colors: ['Clear', 'Tinted'],
    image: IMG('product-sliding-folding-partition'),
    gallery: [],
    featured: false,
    sortOrder: 10,
  },
  {
    name: 'Decorative Wall Panel',
    category: 'Decoration',
    shortDescription: 'Textured wall panels for feature walls and interiors.',
    description:
      'Decorative wall panels add depth and character to interior feature walls. Choose from wood grain, geometric and 3D finishes to match your interior design theme.',
    features: ['3D and textured finishes', 'Moisture resistant', 'Easy installation', 'Custom sizes on request'],
    specifications: [
      { label: 'Material', value: 'MDF / PVC / WPC' },
      { label: 'Thickness', value: '8mm - 20mm' },
      { label: 'Installation', value: 'Adhesive + pin' },
    ],
    materials: ['WPC', 'MDF', 'PVC'],
    colors: ['Walnut', 'Oak', 'Charcoal', 'White'],
    image: IMG('product-wall-panel'),
    gallery: [],
    featured: false,
    sortOrder: 11,
  },
  {
    name: 'Gypsum Ceiling Design',
    category: 'Decoration',
    shortDescription: 'Modern gypsum ceilings with integrated lighting designs.',
    description:
      'We design and build modern gypsum ceilings with concealed lighting, cove details and clean geometric patterns - crafted on site to fit your space perfectly.',
    features: ['Custom cove and recessed designs', 'Integrated LED lighting channels', 'Moisture-resistant gypsum board option', 'Seamless finishing'],
    specifications: [
      { label: 'Board', value: '9mm / 12mm gypsum' },
      { label: 'Frame', value: 'GI metal framing' },
      { label: 'Finish', value: 'Primer + paint' },
    ],
    materials: ['Gypsum Board', 'GI Framework'],
    colors: ['White (paintable)'],
    image: IMG('product-gypsum-ceiling'),
    gallery: [],
    featured: false,
    sortOrder: 12,
  },
  {
    name: 'Custom Window Fabrication',
    category: 'Custom Solutions',
    shortDescription: 'Windows fabricated to your exact drawings and sizes.',
    description:
      'Send us your drawing, measurements or even a photo of the space and we will fabricate windows to match - any size, any profile, any finish. From a single window to a full building, we handle measurement, fabrication and installation.',
    features: ['Any size or shape', 'Site measurement included', 'Choice of aluminum or UPVC', 'Professional installation team'],
    specifications: [
      { label: 'Lead time', value: '7-14 working days' },
      { label: 'Warranty', value: 'Up to 5 years on fabrication' },
    ],
    materials: ['Aluminum', 'UPVC', 'Glass'],
    colors: ['Any RAL color on request'],
    image: IMG('product-custom-window'),
    gallery: [IMG('product-custom-window-2')],
    featured: true,
    sortOrder: 13,
  },
  {
    name: 'Custom Glass Railing',
    category: 'Custom Solutions',
    shortDescription: 'Frameless and framed glass railings for stairs and balconies.',
    description:
      'Custom glass railings built for staircases, balconies and terraces. Choose frameless with spigots or framed with a slim aluminum handrail - engineered for safety and finished for beauty.',
    features: ['Frameless spigot or framed options', '12mm toughened glass', 'Stainless steel hardware', 'Site-specific engineering'],
    specifications: [
      { label: 'Glass', value: '12mm toughened' },
      { label: 'Hardware', value: 'SS 304 / 316' },
      { label: 'Height', value: '900mm - 1100mm' },
    ],
    materials: ['Toughened Glass', 'Stainless Steel', 'Aluminum'],
    colors: ['Clear', 'Tinted'],
    image: IMG('product-glass-railing'),
    gallery: [],
    featured: false,
    sortOrder: 14,
  },
];

const services = [
  {
    name: 'Aluminum Fabrication',
    icon: 'fabricate',
    shortDescription: 'Custom aluminum fabrication for windows, doors, cabinets and structures.',
    description:
      'Our workshop fabricates aluminum windows, doors, shopfronts, cabinets and custom structures with precision cutting and welding. Every project is built from measured drawings and installed by our own team.',
    features: ['In-house workshop fabrication', 'Measured drawings and shop drawings', 'Powder coating and anodizing', 'On-site installation team'],
    process: [
      { title: 'Consultation', description: 'We discuss your requirement and take site measurements.' },
      { title: 'Design & Quotation', description: 'You receive a clear drawing and itemized quotation.' },
      { title: 'Fabrication', description: 'Your products are fabricated in our workshop.' },
      { title: 'Installation', description: 'Our team installs, seals and cleans up the site.' },
    ],
    featured: true,
    sortOrder: 1,
  },
  {
    name: 'Window Installation',
    icon: 'window',
    shortDescription: 'Professional installation of aluminum and UPVC windows.',
    description:
      'We install all kinds of windows - sliding, casement, fixed and combination - with proper sealing, leveling and finishing. Dust-free, safe and on schedule.',
    features: ['Site measurement before fabrication', 'Leveled and sealed installation', 'Clean and careful work', 'Post-installation adjustment'],
    process: [
      { title: 'Measurement', description: 'Exact opening measurement at your site.' },
      { title: 'Preparation', description: 'We fabricate windows to fit the measured openings.' },
      { title: 'Installation', description: 'Fix, level, seal and finish on site.' },
      { title: 'Handover', description: 'Final checks, adjustment and cleaning.' },
    ],
    featured: true,
    sortOrder: 2,
  },
  {
    name: 'Glass Installation',
    icon: 'glass',
    shortDescription: 'Safe, precise installation of all types of architectural glass.',
    description:
      'From shower boxes to full facades, we handle glass installation with proper handling equipment, safe methods and clean finishing. Toughened, laminated, frosted and back-painted glass handled by specialists.',
    features: ['Toughened and laminated glass handling', 'Precision measurement and cutting', 'Safe lifting equipment', 'Clean silicone finishing'],
    process: [
      { title: 'Measurement', description: 'Template measurement of the opening or area.' },
      { title: 'Cutting & Polishing', description: 'Glass is cut, polished and processed.' },
      { title: 'Installation', description: 'Professional handling and fixing on site.' },
      { title: 'Finish', description: 'Silicone, hardware adjustment and cleaning.' },
    ],
    featured: true,
    sortOrder: 3,
  },
  {
    name: 'Custom Window Design',
    icon: 'design',
    shortDescription: 'Windows designed around your space, style and budget.',
    description:
      'Not every opening fits a standard window. We design windows around your architecture - bay shapes, arched tops, oversized spans and special ventilation needs included.',
    features: ['Design consultation with samples', 'Arched and shaped windows', 'Ventilation and light optimization', 'Mock-up before mass production'],
    process: [
      { title: 'Discuss', description: 'Share your ideas, photos or drawings.' },
      { title: 'Design', description: 'We propose profile, glass, color and hardware.' },
      { title: 'Approve', description: 'You approve the final drawing and quotation.' },
      { title: 'Build', description: 'Fabrication and installation to the approved design.' },
    ],
    featured: false,
    sortOrder: 4,
  },
  {
    name: 'Custom Door Design',
    icon: 'door',
    shortDescription: 'Doors designed for security, style and everyday use.',
    description:
      'From sleek frameless glass doors to heavy aluminum shopfront doors, we design and build doors that fit the way you use your space - with the right hardware and safety glass.',
    features: ['All door types: sliding, swing, folding', 'Safety glass and hardware selection', 'Security lock options', 'Custom sizes and finishes'],
    process: [
      { title: 'Requirement', description: 'We study the doorway, traffic and security needs.' },
      { title: 'Design', description: 'Door type, glass and hardware proposal.' },
      { title: 'Fabrication', description: 'Built to size in our workshop.' },
      { title: 'Installation', description: 'Fitting, alignment and handover.' },
    ],
    featured: false,
    sortOrder: 5,
  },
  {
    name: 'Glass Partition Installation',
    icon: 'partition',
    shortDescription: 'Office and home glass partitions, installed cleanly.',
    description:
      'We install glass partitions that divide space without blocking light - single-glazed, double-glazed, frameless and framed systems, with integrated doors where needed.',
    features: ['Frameless and framed systems', 'Single and double glazing', 'Integrated doors and blinds', 'Minimal downtime installation'],
    process: [
      { title: 'Site Survey', description: 'Measurement and structural assessment.' },
      { title: 'System Selection', description: 'Frame, glass and door configuration.' },
      { title: 'Fabrication', description: 'Prefabricated to minimize site time.' },
      { title: 'Installation', description: 'Assembly, alignment and finishing.' },
    ],
    featured: false,
    sortOrder: 6,
  },
  {
    name: 'Office Glass Solutions',
    icon: 'office',
    shortDescription: 'Complete glass solutions for offices and commercial spaces.',
    description:
      'Cabins, meeting rooms, reception screens, glass doors and signage - we provide complete glass solutions for offices, taking care of design, fabrication and installation under one roof.',
    features: ['Cabin and meeting room partitions', 'Reception and signage glass', 'Frosting and branding film', 'Coordinated door systems'],
    process: [
      { title: 'Consultation', description: 'Understand workflow, privacy and branding needs.' },
      { title: 'Layout Plan', description: 'Proposed partition layout and materials.' },
      { title: 'Execution', description: 'Fabrication and staged installation.' },
      { title: 'Finishing', description: 'Frosting, branding and final cleaning.' },
    ],
    featured: true,
    sortOrder: 7,
  },
  {
    name: 'Shower Glass Solutions',
    icon: 'shower',
    shortDescription: 'Bathroom shower enclosures in premium toughened glass.',
    description:
      'Custom shower enclosures in 8mm or 10mm toughened glass with brass or stainless steel hardware. Fixed, hinged, sliding and corner configurations, installed with perfect waterproofing.',
    features: ['8mm / 10mm toughened glass', 'Fixed, hinged and sliding options', 'Waterproof sealing', 'Anti-lime coating option'],
    process: [
      { title: 'Measurement', description: 'Exact measure of the shower area.' },
      { title: 'Design', description: 'Enclosure style and hardware selection.' },
      { title: 'Fabrication', description: 'Glass cut, polished and drilled.' },
      { title: 'Installation', description: 'Fixing, sealing and testing.' },
    ],
    featured: false,
    sortOrder: 8,
  },
  {
    name: 'Interior Decoration',
    icon: 'interior',
    shortDescription: 'Interior decoration for homes, offices and commercial spaces.',
    description:
      'Complete interior decoration services - wall paneling, ceilings, lighting features, floor finishes and detailing - coordinated to create a cohesive, beautiful space.',
    features: ['Concept and mood boards', 'Wall paneling and ceilings', 'Lighting and finishing details', 'Material and color coordination'],
    process: [
      { title: 'Concept', description: 'Understand your taste, function and budget.' },
      { title: 'Design', description: 'Mood board, materials and 3D views.' },
      { title: 'Execution', description: 'Skilled teams execute each specialty.' },
      { title: 'Styling', description: 'Final detailing and handover.' },
    ],
    featured: true,
    sortOrder: 9,
  },
  {
    name: 'Custom Fabrication',
    icon: 'custom',
    shortDescription: 'One-off fabrication projects in aluminum, glass and steel.',
    description:
      'Have a design that does not fit a catalog? We fabricate one-off pieces - glass tables, metal frames, signage structures, display units and more - from drawings or even sketches.',
    features: ['Works from sketches or drawings', 'Mixed material fabrication', 'Prototype before final build', 'Small batch friendly'],
    process: [
      { title: 'Brief', description: 'Share drawing, sketch or reference.' },
      { title: 'Feasibility', description: 'Materials, method and cost proposal.' },
      { title: 'Prototype', description: 'Sample or prototype for approval.' },
      { title: 'Delivery', description: 'Full build, delivery and installation.' },
    ],
    featured: false,
    sortOrder: 10,
  },
];

const projects = [
  {
    name: 'Modern Residential Window Upgrade',
    category: 'Residential',
    location: 'Gulberg, Peshawar',
    completionDate: '2025-11-20',
    shortDescription: 'Full building window replacement with slim-profile aluminum sliding windows.',
    description:
      'A complete upgrade of a 6-apartment residential building, replacing old steel windows with slim-profile aluminum sliding windows. Work included site measurement of 84 openings, acoustic glazing on the road side and integrated mosquito screens throughout.',
    materialsUsed: ['Aluminum Profiles', '5mm Clear Glass', 'Stainless Steel Rollers'],
    servicesProvided: ['Site Measurement', 'Fabrication', 'Window Installation'],
    coverImage: IMG('project-residential-windows'),
    gallery: [IMG('project-residential-windows-2'), IMG('project-residential-windows-3')],
    featured: true,
    sortOrder: 1,
  },
  {
    name: 'Corporate Office Glass Partition',
    category: 'Office',
    location: 'University Town, Peshawar',
    completionDate: '2026-01-15',
    shortDescription: 'Double-glazed office partitions with integrated blinds for a corporate HQ.',
    description:
      'Design and installation of 260 sqm of double-glazed office partitioning across three floors, including six meeting rooms with integrated venetian blinds, frameless glass doors and a frosted branded reception screen.',
    materialsUsed: ['Toughened Glass', 'Double Glazed Units', 'Aluminum Framing'],
    servicesProvided: ['Layout Design', 'Glass Partition Installation', 'Office Glass Solutions'],
    coverImage: IMG('project-office-partition'),
    gallery: [IMG('project-office-partition-2'), IMG('project-office-partition-3')],
    featured: true,
    sortOrder: 2,
  },
  {
    name: 'Aluminum Door Installation Project',
    category: 'Doors',
    location: 'Bahria Town, Peshawar',
    completionDate: '2025-09-05',
    shortDescription: '42 custom aluminum doors fabricated and installed across a duplex project.',
    description:
      'Fabrication and installation of 42 aluminum casement and sliding doors for a luxury duplex development, including heavy-duty hardware, safety glass and coordinated powder-coated finishes to match the building facade.',
    materialsUsed: ['Aluminum Sections', '6mm Toughened Glass', 'SS 304 Hardware'],
    servicesProvided: ['Custom Door Design', 'Fabrication', 'Installation'],
    coverImage: IMG('project-aluminum-doors'),
    gallery: [IMG('project-aluminum-doors-2')],
    featured: true,
    sortOrder: 3,
  },
  {
    name: 'Luxury Home Floor-to-Ceiling Windows',
    category: 'Residential',
    location: 'Saddar, Peshawar',
    completionDate: '2025-12-10',
    shortDescription: 'Double-height floor-to-ceiling glazing for a private residence.',
    description:
      'A signature glazing project for a private residence: 12 double-height floor-to-ceiling fixed glazing panels with structural silicone joints, plus three large sliding door systems opening onto the garden terrace.',
    materialsUsed: ['12mm Toughened Glass', 'Structural Silicone', 'Slim Aluminum Profiles'],
    servicesProvided: ['Custom Window Design', 'Glass Installation'],
    coverImage: IMG('project-luxury-home-windows'),
    gallery: [IMG('project-luxury-home-windows-2')],
    featured: false,
    sortOrder: 4,
  },
  {
    name: 'Commercial Showroom Glass Facade',
    category: 'Commercial',
    location: 'Hayatabad, Peshawar',
    completionDate: '2025-08-18',
    shortDescription: 'Full-height showroom facade with frameless glass and ACP cladding.',
    description:
      'A 14m wide commercial showroom frontage combining frameless glass display windows, ACP column cladding and an automatic sliding entrance. Installed without interrupting the mall corridor below.',
    materialsUsed: ['Toughened Glass', 'Aluminum Composite Panel', 'Automatic Door System'],
    servicesProvided: ['Facade Design', 'Glass Installation', 'Custom Fabrication'],
    coverImage: IMG('project-showroom-facade'),
    gallery: [IMG('project-showroom-facade-2')],
    featured: false,
    sortOrder: 5,
  },
  {
    name: 'Apartment Building Aluminum Windows',
    category: 'Aluminum',
    location: 'Warsak Road, Peshawar',
    completionDate: '2025-06-25',
    shortDescription: 'Batch fabrication of 120 aluminum windows for a 10-storey building.',
    description:
      'Large-scale batch fabrication and phased installation of 120 aluminum windows for a 10-storey residential building, delivered in coordination with the main contractor to match the construction schedule.',
    materialsUsed: ['Aluminum Profiles', '5mm Glass', 'Mosquito Mesh'],
    servicesProvided: ['Batch Fabrication', 'Phased Installation'],
    coverImage: IMG('project-apartment-windows'),
    gallery: [],
    featured: false,
    sortOrder: 6,
  },
  {
    name: 'Boutique Hotel Interior Decoration',
    category: 'Interior',
    location: 'Cox\u2019s Bazar',
    completionDate: '2025-10-30',
    shortDescription: 'Interior decoration for a boutique hotel lobby and 22 rooms.',
    description:
      'Interior decoration of a boutique hotel - lobby feature wall, gypsum ceiling designs with concealed lighting, decorative wall panels in 22 rooms and custom mirrors and glass details in all bathrooms.',
    materialsUsed: ['Gypsum Board', 'Decorative Wall Panels', 'Custom Glass Mirrors'],
    servicesProvided: ['Interior Decoration', 'Custom Fabrication'],
    coverImage: IMG('project-hotel-interior'),
    gallery: [IMG('project-hotel-interior-2'), IMG('project-hotel-interior-3')],
    featured: true,
    sortOrder: 7,
  },
];

const companySettings = {
  companyName: 'Decora',
  tagline: 'Modern Windows, Glass & Aluminum Solutions',
  footerDescription:
    'Decora manufactures and installs premium aluminum windows, doors, glass solutions and interior decoration for homes, offices and commercial spaces. From a single window to a complete building - we design, fabricate and install.',
  logo: '',
  favicon: '',
  phone: '+92 321 9175485',
  whatsapp: '+923219175485',
  email: 'info@karigordecore.com',
  address: 'Hascol Pump, Peshawar Ring Rd., near Sarhad University, Garhi Sikandar Khan, Peshawar, 25000, Pakistan',
  googleMapsUrl:
    'https://maps.google.com/?q=Hascol+Pump,+Peshawar+Ring+Rd,+near+Sarhad+University,+Garhi+Sikandar+Khan,+Peshawar,+Pakistan',
  businessHours: [
    { days: 'Saturday - Thursday', hours: '9:00 AM - 8:00 PM' },
    { days: 'Friday', hours: '2:30 PM - 8:00 PM' },
  ],
  social: {
    facebook: 'https://facebook.com/karigordecore',
    instagram: 'https://instagram.com/karigordecore',
    tiktok: '',
    youtube: '',
    linkedin: '',
  },
  defaultMeta: {
    title: 'Decora | Modern Windows, Glass & Aluminum Solutions',
    description:
      'Decora manufactures and installs aluminum windows, doors, glass partitions and interior decoration. Custom fabrication for residential, office and commercial projects.',
  },
};

const homepage = {
  hero: {
    heading: 'Modern Windows, Glass & Aluminum Solutions',
    subheading: 'Decora',
    description:
      'We design, fabricate and install customized windows, doors, glass partitions and interior decoration for homes, offices and commercial spaces. Buy our products - or bring us your project and we will build a solution around it.',
    backgroundImage: { url: IMG('hero-architecture'), alt: 'Modern building facade with large glass windows' },
    buttons: [
      { label: 'Explore Products', link: '/products', variant: 'primary' },
      { label: 'View Our Projects', link: '/projects', variant: 'secondary' },
      { label: 'Contact Us', link: '/contact', variant: 'ghost' },
    ],
    // Rotating hero. The first slide mirrors the single-hero fields above;
    // the controller keeps both in sync when the dashboard is saved.
    slides: [
      {
        heading: 'Modern Windows, Glass & Aluminum Solutions',
        subheading: 'Decora',
        description:
          'We design, fabricate and install customized windows, doors, glass partitions and interior decoration for homes, offices and commercial spaces. Buy our products - or bring us your project and we will build a solution around it.',
        backgroundImage: { url: IMG('hero-architecture'), alt: 'Modern building facade with large glass windows' },
        buttons: [
          { label: 'Explore Products', link: '/products', variant: 'primary' },
          { label: 'View Our Projects', link: '/projects', variant: 'secondary' },
          { label: 'Contact Us', link: '/contact', variant: 'ghost' },
        ],
      },
      {
        heading: 'Ready-Made Products, Built To Measure',
        subheading: 'Buy Or Customize',
        description:
          'Pick a finished product from our catalog, or bring us your own project - drawings, measurements, ideas - and we will design, fabricate and install the whole solution.',
        backgroundImage: { url: IMG('product-aluminum-sliding-window'), alt: 'Aluminum sliding window installed in a residential building' },
        buttons: [
          { label: 'Browse Products', link: '/products', variant: 'primary' },
          { label: 'Request a Quote', link: '/quote', variant: 'secondary' },
        ],
      },
      {
        heading: 'Fabricated In Our Own Workshop',
        subheading: 'Quality You Can Measure',
        description:
          'From the first site measurement to the final handover, our own fabrication and installation teams control quality at every step - no outsourcing, no surprises.',
        backgroundImage: { url: IMG('about-workshop'), alt: 'Decora fabrication workshop' },
        buttons: [
          { label: 'Our Services', link: '/services', variant: 'primary' },
          { label: 'About Decora', link: '/about', variant: 'ghost' },
        ],
      },
      {
        heading: 'Spaces We Have Transformed',
        subheading: 'Completed Projects',
        description:
          'Residential, office and commercial work - aluminum windows, frameless glass doors, partitions, railings and full interior decoration packages.',
        backgroundImage: { url: IMG('project-office-partition'), alt: 'Glass office partition installed in a corporate office' },
        buttons: [
          { label: 'See Our Projects', link: '/projects', variant: 'primary' },
          { label: 'Contact Us', link: '/contact', variant: 'ghost' },
        ],
      },
    ],
  },
  about: {
    heading: 'Precision Craftsmanship for Every Space',
    description:
      'Decora is a manufacturing and decoration company specializing in aluminum and glass solutions. With our own fabrication workshop and dedicated installation teams, we control quality at every step - from the first measurement to the final handover. Whether you need a single window or a complete commercial glazing package, you get the same attention to detail.',
    image: { url: IMG('about-workshop'), alt: 'Decora fabrication workshop' },
    ctaLabel: 'Learn More About Us',
    ctaLink: '/about',
  },
  sections: {
    products: {
      heading: 'Our Products',
      subheading: 'Quality windows, doors, glass and aluminum products - ready to install.',
      enabled: true,
    },
    services: {
      heading: 'Our Services',
      subheading: 'From custom fabrication to full project solutions - we handle everything.',
      enabled: true,
    },
    projects: {
      heading: 'Completed Projects',
      subheading: 'A look at the spaces we have transformed for our clients.',
      enabled: true,
    },
    whyUs: {
      heading: 'Why Choose Decora',
      subheading: 'What sets our work apart on every project.',
      enabled: true,
      items: [
        { title: 'Premium Quality', description: 'Quality materials and controlled fabrication in our own workshop.' },
        { title: 'Professional Installation', description: 'Trained installation teams that work clean and finish properly.' },
        { title: 'Custom Designs', description: 'Solutions designed around your space, not the other way around.' },
        { title: 'Experienced Team', description: 'Fabrication and decoration experience across many project types.' },
        { title: 'Reliable Service', description: 'Clear timelines, honest communication and dependable delivery.' },
        { title: 'Competitive Pricing', description: 'Direct factory pricing without compromising on quality.' },
        { title: 'Quality Materials', description: 'Branded profiles, certified glass and genuine hardware.' },
        { title: 'Customer Satisfaction', description: 'We are not finished until you are happy with the result.' },
      ],
    },
    stats: {
      enabled: false,
      items: [],
    },
  },
  cta: {
    heading: 'Have a Project in Mind?',
    description: "Let's create the right solution for your space. Share your requirement and get a detailed quotation.",
    primaryLabel: 'Request a Quote',
    primaryLink: '/quote',
    secondaryLabel: 'Contact Us',
    secondaryLink: '/contact',
  },
  seo: {
    title: 'Decora | Modern Windows, Glass & Aluminum Solutions',
    description:
      'Customized aluminum windows and doors, glass partitions, shower glass and interior decoration. Products and project-based fabrication services in Pakistan.',
  },
};

const sampleInquiries = [
  {
    name: 'Rashed Ahmed',
    phone: '+8801711223344',
    email: 'rashed.ahmed@example.com',
    subject: 'Sliding windows for apartment',
    service: 'Window Installation',
    message:
      'I need aluminum sliding windows for 3 bedrooms and a living room in my new apartment. Please contact me to discuss measurement and pricing.',
    status: 'new',
    source: 'contact_form',
    daysAgo: 1,
  },
  {
    name: 'Farhana Islam',
    phone: '+8801822334455',
    email: 'farhana.islam@example.com',
    subject: 'Shower glass enclosure',
    service: 'Shower Glass Solutions',
    message:
      'Looking for a custom shower enclosure for a corner bathroom. Approximately 4ft x 4ft. When can your team measure the space?',
    status: 'contacted',
    source: 'service',
    daysAgo: 4,
  },
  {
    name: 'Tanvir Hossain',
    phone: '+8801933445566',
    email: 'tanvir.h@example.com',
    subject: 'Office partition quotation',
    service: 'Glass Partition Installation',
    message:
      'We are setting up a new office near Peshawar Ring Road. Need glass partitions for 4 cabins and a meeting room. Please share an estimate per square foot.',
    status: 'in_progress',
    source: 'contact_form',
    daysAgo: 7,
  },
];

const sampleQuotes = [
  {
    name: 'Sabbir Rahman',
    phone: '+8801744556677',
    email: 'sabbir.r@example.com',
    productService: 'Frameless Glass Door',
    quantity: '6 doors',
    projectType: 'commercial',
    budget: 'PKR 300,000 - 400,000',
    message:
      'Need 6 frameless glass doors with floor springs for a restaurant entrance and interior dividers. Please include installation in the quotation.',
    status: 'new',
    source: 'product',
    daysAgo: 2,
  },
  {
    name: 'Nusrat Jahan',
    phone: '+8801855667788',
    email: 'nusrat.jahan@example.com',
    productService: 'Custom Window Fabrication',
    quantity: '18 windows',
    projectType: 'residential',
    budget: 'PKR 500,000+',
    message:
      'Building a duplex house in Hayatabad. I have architectural drawings with 18 window openings. Please quote for aluminum windows including mosquito nets.',
    status: 'reviewed',
    source: 'quote_page',
    daysAgo: 5,
  },
];

/**
 * Development-only admin credentials are read from the environment
 * (SEED_ADMIN_*). Never use the defaults in production.
 */
function getSeedAdmin() {
  return {
    name: process.env.SEED_ADMIN_NAME || 'Karigor Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@karigordecore.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Karigor@Admin2026',
    role: 'superadmin',
  };
}

module.exports = {
  productCategories,
  projectCategories,
  products,
  services,
  projects,
  companySettings,
  homepage,
  sampleInquiries,
  sampleQuotes,
  getSeedAdmin,
};
