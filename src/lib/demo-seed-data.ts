/**
 * Demo seed data generator for populating the marketplace with realistic dummy listings.
 *
 * Generates:
 * - ~40 guide users with 1-2 retreats each (~60 retreats, all fully booked)
 * - ~140 vendor users with 1 service each (~150 services, booked out 1+ year)
 * - ~70 host users with 1 space each (~75 spaces, booked out 2+ years)
 */

// --- NAME POOLS ---

const firstNames = [
  'Aria', 'Bodhi', 'Celeste', 'Devi', 'Ezra', 'Freya', 'Gaia', 'Harlow',
  'Indra', 'Jasper', 'Kaia', 'Luna', 'Milo', 'Naia', 'Orion', 'Priya',
  'Quinn', 'Ravi', 'Sage', 'Tara', 'Uma', 'Veda', 'Willow', 'Xena',
  'Yara', 'Zara', 'Kai', 'Leila', 'Nico', 'Ophelia', 'Rowan', 'Sienna',
  'Thea', 'Uriel', 'Vera', 'Wren', 'Ximena', 'Yosef', 'Zion', 'Amara',
  'Beau', 'Cleo', 'Dante', 'Elara', 'Finn', 'Gemma', 'Hugo', 'Isla',
  'Juno', 'Kiran', 'Lev', 'Maya', 'Nyla', 'Oscar', 'Paloma', 'Rafael',
  'Seren', 'Tobias', 'Valentina', 'Xavier', 'Yuki', 'Zephyr', 'Atlas',
  'Briar', 'Cruz', 'Dahlia', 'Elio', 'Flora', 'Grey', 'Haven', 'Idris',
  'Jules', 'Koa', 'Lyra', 'Mateo', 'Nova', 'Opal', 'Phoenix', 'Remy',
  'Sol', 'Teo', 'Uma', 'Vesper', 'Winter', 'Xander', 'Yael', 'Zola',
  'Arden', 'Beck', 'Cypress', 'Dove', 'Ember', 'Fox', 'Ginger', 'Heath',
  'Ivory', 'Jade', 'Kit', 'Lark', 'Moss', 'Noel', 'Oak', 'Pearl',
  'Reed', 'Sky', 'Thorn', 'Vale', 'Wynn', 'Aspen', 'Birch', 'Cedar',
  'Delta', 'Eden', 'Fern', 'Glen', 'Harbor', 'Ione', 'Jonah', 'Kenji',
  'Liora', 'Magnus', 'Nadine', 'Odessa', 'Penn', 'Rae', 'Sterling', 'True',
  'Uri', 'Vance', 'West', 'Yves', 'Zev', 'Alma', 'Blake', 'Cora',
  'Dean', 'Estelle', 'Felix', 'Grace', 'Hale', 'Iris', 'Joel',
];

const lastNames = [
  'Amani', 'Blackwell', 'Chen', 'Delgado', 'Everett', 'Fontaine', 'Gupta',
  'Hartwell', 'Inoue', 'Jensen', 'Kapoor', 'Larsen', 'Montoya', 'Nakamura',
  'Okafor', 'Petrov', 'Quintero', 'Reyes', 'Santos', 'Torres', 'Ueda',
  'Vasquez', 'Whitfield', 'Xiong', 'Yamada', 'Zimmerman', 'Ashworth',
  'Bello', 'Castillo', 'Dubois', 'Ellis', 'Ferreira', 'Gallagher', 'Holt',
  'Ibrahim', 'Johal', 'Kim', 'Lindqvist', 'Moreau', 'Ngo', 'Ortiz',
  'Patel', 'Quinn', 'Romano', 'Sorensen', 'Tanaka', 'Underwood', 'Volkov',
  'Walsh', 'Xu', 'Yoon', 'Zeller', 'Archer', 'Bennett', 'Cruz',
  'Diaz', 'Erikson', 'Foster', 'Garcia', 'Hayes', 'Ivanov', 'Jacobs',
  'Keller', 'Lund', 'Martinez', 'Novak', 'Olsen', 'Park', 'Rivers',
  'Shah', 'Thorne', 'Valencia', 'Webb', 'Yang', 'Zane', 'Brooks',
  'Cole', 'Drake', 'Emery', 'Finch', 'Grant', 'Hoffman', 'Ingram',
  'Knight', 'Lee', 'Mercer', 'Nash', 'Owen', 'Price', 'Rowe',
  'Stone', 'Taylor', 'Vega', 'West', 'Young', 'Blair', 'Chase',
];

// --- LOCATION DATA ---

interface LocationData {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
}

const locations: LocationData[] = [
  // Asia
  { city: 'Ubud', region: 'Bali', country: 'Indonesia', lat: -8.5069, lng: 115.2624 },
  { city: 'Canggu', region: 'Bali', country: 'Indonesia', lat: -8.6478, lng: 115.1385 },
  { city: 'Seminyak', region: 'Bali', country: 'Indonesia', lat: -8.6896, lng: 115.1607 },
  { city: 'Kyoto', region: 'Kansai', country: 'Japan', lat: 35.0116, lng: 135.7681 },
  { city: 'Chiang Mai', region: 'Northern Thailand', country: 'Thailand', lat: 18.7883, lng: 98.9853 },
  { city: 'Koh Samui', region: 'Surat Thani', country: 'Thailand', lat: 9.5120, lng: 100.0136 },
  { city: 'Goa', region: 'Western India', country: 'India', lat: 15.2993, lng: 74.1240 },
  { city: 'Rishikesh', region: 'Uttarakhand', country: 'India', lat: 30.0869, lng: 78.2676 },
  { city: 'Ella', region: 'Uva Province', country: 'Sri Lanka', lat: 6.8667, lng: 81.0466 },
  { city: 'Siem Reap', region: 'Angkor', country: 'Cambodia', lat: 13.3671, lng: 103.8448 },
  // Europe
  { city: 'Tuscany', region: 'Central Italy', country: 'Italy', lat: 43.7711, lng: 11.2486 },
  { city: 'Amalfi', region: 'Campania', country: 'Italy', lat: 40.6340, lng: 14.6027 },
  { city: 'Ibiza', region: 'Balearic Islands', country: 'Spain', lat: 38.9067, lng: 1.4206 },
  { city: 'Mallorca', region: 'Balearic Islands', country: 'Spain', lat: 39.6953, lng: 3.0176 },
  { city: 'Algarve', region: 'Southern Portugal', country: 'Portugal', lat: 37.0179, lng: -7.9304 },
  { city: 'Sintra', region: 'Lisbon District', country: 'Portugal', lat: 38.7980, lng: -9.3880 },
  { city: 'Santorini', region: 'Cyclades', country: 'Greece', lat: 36.3932, lng: 25.4615 },
  { city: 'Crete', region: 'Southern Greece', country: 'Greece', lat: 35.2401, lng: 24.4709 },
  { city: 'Lauterbrunnen', region: 'Swiss Alps', country: 'Switzerland', lat: 46.5935, lng: 7.9082 },
  { city: 'Provence', region: 'Southern France', country: 'France', lat: 43.9493, lng: 6.0679 },
  // North America
  { city: 'Sedona', region: 'Arizona', country: 'USA', lat: 34.8697, lng: -111.7610 },
  { city: 'Big Sur', region: 'California', country: 'USA', lat: 36.2704, lng: -121.8081 },
  { city: 'Joshua Tree', region: 'California', country: 'USA', lat: 34.1347, lng: -116.3131 },
  { city: 'Ojai', region: 'California', country: 'USA', lat: 34.4480, lng: -119.2429 },
  { city: 'Asheville', region: 'North Carolina', country: 'USA', lat: 35.5951, lng: -82.5515 },
  { city: 'Tulum', region: 'Quintana Roo', country: 'Mexico', lat: 20.2114, lng: -87.4654 },
  { city: 'San Miguel de Allende', region: 'Guanajuato', country: 'Mexico', lat: 20.9144, lng: -100.7452 },
  { city: 'Nosara', region: 'Guanacaste', country: 'Costa Rica', lat: 9.9776, lng: -85.6530 },
  { city: 'Santa Teresa', region: 'Puntarenas', country: 'Costa Rica', lat: 9.6401, lng: -85.1688 },
  { city: 'Maui', region: 'Hawaii', country: 'USA', lat: 20.7984, lng: -156.3319 },
  { city: 'Kauai', region: 'Hawaii', country: 'USA', lat: 22.0964, lng: -159.5261 },
  // South America
  { city: 'Sacred Valley', region: 'Cusco', country: 'Peru', lat: -13.3320, lng: -72.1175 },
  { city: 'Cusco', region: 'Cusco', country: 'Peru', lat: -13.5320, lng: -71.9675 },
  { city: 'Medellin', region: 'Antioquia', country: 'Colombia', lat: 6.2442, lng: -75.5812 },
  { city: 'Florianopolis', region: 'Santa Catarina', country: 'Brazil', lat: -27.5954, lng: -48.5480 },
  { city: 'Itacare', region: 'Bahia', country: 'Brazil', lat: -14.2784, lng: -38.9960 },
  // Africa & Middle East
  { city: 'Marrakech', region: 'Marrakech-Safi', country: 'Morocco', lat: 31.6295, lng: -7.9811 },
  { city: 'Cape Town', region: 'Western Cape', country: 'South Africa', lat: -33.9249, lng: 18.4241 },
  { city: 'Zanzibar', region: 'Zanzibar', country: 'Tanzania', lat: -6.1659, lng: 39.2026 },
  // Oceania
  { city: 'Byron Bay', region: 'New South Wales', country: 'Australia', lat: -28.6474, lng: 153.6020 },
  { city: 'Queenstown', region: 'Otago', country: 'New Zealand', lat: -45.0312, lng: 168.6626 },
  { city: 'Nadi', region: 'Western Division', country: 'Fiji', lat: -17.7765, lng: 177.9514 },
];

function locationDescription(loc: LocationData): string {
  return `${loc.city}, ${loc.country}`;
}

// --- RETREAT DATA ---

const retreatTypes = [
  'Yoga', 'Meditation', 'Wellness', 'Adventure', 'Creative Arts',
  'Spiritual', 'Fitness', 'Nature Immersion', 'Culinary', 'Mindfulness',
];

const retreatTitleTemplates = [
  '{type} Immersion in {city}',
  'The {city} {type} Retreat',
  '{type} & Stillness: {city}',
  'Rise & Restore: {city} {type}',
  'Soul of {city}: A {type} Journey',
  '{city} {type} Experience',
  'Deep Dive {type} in {city}',
  'The Art of {type}: {city} Edition',
  '{type} Under the Stars — {city}',
  'Awaken {city}: {type} Retreat',
  '{city} {type} Sanctuary',
  'Transform in {city}: {type}',
  'Heart of {city} {type}',
  'Radiant {type}: {city}',
  '{type} Reset in {city}',
];

const retreatDescriptions = [
  'A luxury immersion designed for deep transformation. Private villa accommodations, world-class facilitators, organic chef-prepared meals, and daily one-on-one sessions included. Limited to a small group for maximum personalization.',
  'Step away from the noise and into an elevated journey of self-discovery. This all-inclusive retreat features five-star accommodations, private excursions, gourmet plant-based cuisine, and expert-led sessions in one of the world\'s most inspiring settings.',
  'An intimate, high-touch gathering in a breathtaking private estate. Daily personalized sessions, spa treatments, farm-to-table dining, and curated cultural excursions. Small group size ensures individual attention.',
  'Designed for those ready to go deeper. This premium retreat includes luxury lodging, private chef, daily bodywork, guided ceremonies, and exclusive access to sacred sites with local experts.',
  'Escape the ordinary with this all-inclusive luxury experience. From sunrise sessions to candlelit evening circles, every moment is crafted with intention. Includes private room, gourmet meals, spa, and airport transfers.',
  'A world-class retreat experience that marries depth with comfort. Boutique accommodations, Michelin-trained chef, daily wellness programming, and curated adventure excursions in a stunning natural setting.',
  'This isn\'t just a retreat — it\'s a recalibration. Includes luxury private suite, personalized wellness plan, daily massage or bodywork, organic meals, and guided wilderness experiences.',
  'Immerse yourself in the culture and landscape at this premium all-inclusive retreat. Private guides, authentic local experiences, five-star lodging, and a community of intentional seekers.',
  'A carefully curated luxury experience balancing structure and freedom. Morning practices, afternoon adventures, evening ceremonies, private rooms, chef-prepared meals, and spa access included.',
  'Join an exclusive group of seekers for an unforgettable journey. Expert facilitation, stunning private property, organic cuisine, daily treatments, and curated excursions — everything handled for you.',
  'Reset your nervous system in paradise. This premium retreat combines evidence-based practices with luxury accommodations, private chef, daily spa treatments, and the healing power of nature.',
  'An elevated all-inclusive experience featuring private beachfront accommodations, personalized coaching sessions, gourmet dining, cultural immersions, and adventure excursions led by local experts.',
];

const includedOptions = [
  'Private suite, all gourmet meals, daily sessions, spa access, airport transfer',
  'Luxury lodging, private chef meals, guided excursions, daily bodywork',
  'All-inclusive: private room, organic meals, ceremonies, cultural tours, transfers',
  'Boutique accommodation, farm-to-table dining, wellness programming, spa treatments',
  'Private villa room, chef-prepared meals, daily yoga & meditation, adventure excursions',
  'Eco-luxury lodge, organic meals, healing sessions, nature immersions, evening ceremonies',
  'Beachfront suite, private chef, daily treatments, guided cultural experiences',
  'Mountain retreat room, gourmet meals, guided hikes, evening fire ceremonies, spa',
];

// --- VENDOR DATA ---

const vendorCategories = [
  'Yoga / Meditation Instruction', 'Breathwork / Pranayama', 'Sound Healing / Sound Baths',
  'Reiki / Energy Work', 'Massage / Bodywork', 'Catering / Private Chef',
  'Nutrition / Meal Planning', 'Photography', 'Videography',
  'Florist / Event Design', 'Transportation / Shuttle', 'Hiking / Nature Guide',
  'Surf / Water Sports Instruction', 'Barre / Pilates Instruction',
  'Art / Creative Workshop Facilitation', 'Music / DJ / Live Performance',
  'Ceremony / Ritual Facilitation', 'Astrology / Tarot / Intuitive Readings',
  'Life Coaching / Transformational Coaching', 'Acupuncture / TCM',
  'Ayurveda', 'Fitness / Personal Training', 'Meditation Coaching',
  'Aromatherapy / Essential Oils', 'Wine / Sommelier',
  'Herbalism / Plant Medicine Education', 'Mixology / Craft Cocktails',
  'Candle Making Workshop', 'Permaculture / Nature Education',
  'Pottery / Ceramics Workshop', 'Weaving / Textile Arts', 'Fermentation / Kombucha Workshop',
  'Cacao Ceremony Facilitation', 'Forest Bathing Guide', 'Ecstatic Dance Facilitation',
  'Drum Circle Facilitation', 'Fire Dancing / Flow Arts', 'Stand-Up Paddleboard Instruction',
  'Rock Climbing Guide', 'Paragliding / Aerial Sports',
];

const vendorServiceNames: Record<string, string[]> = {
  'Yoga / Meditation Instruction': ['Vinyasa Flow Sessions', 'Hatha & Yin Package', 'Morning Meditation Series', 'Sunrise Yoga Program', 'Restorative Yoga Package'],
  'Breathwork / Pranayama': ['Transformational Breathwork', 'Pranayama Intensive', 'Breath & Release Sessions', 'Holotropic Breathwork Package'],
  'Sound Healing / Sound Baths': ['Crystal Bowl Sound Bath', 'Gong & Singing Bowl Journey', 'Vibrational Healing Session', 'Group Sound Immersion'],
  'Reiki / Energy Work': ['Reiki Healing Package', 'Energy Alignment Sessions', 'Chakra Balancing Program', 'Distance & In-Person Reiki'],
  'Massage / Bodywork': ['Deep Tissue & Thai Package', 'Balinese Massage Sessions', 'Couples Bodywork Experience', 'Sports Recovery Package'],
  'Catering / Private Chef': ['Farm-to-Table Catering', 'Plant-Based Retreat Menu', 'Ayurvedic Meal Service', 'Raw & Living Foods Catering', 'Mediterranean Feast Package'],
  'Nutrition / Meal Planning': ['Custom Retreat Meal Plans', 'Detox Menu Design', 'Macro-Balanced Menu Service'],
  'Photography': ['Retreat Documentation Package', 'Lifestyle & Portrait Sessions', 'Golden Hour Photo Package', 'Full Retreat Visual Story'],
  'Videography': ['Cinematic Retreat Film', 'Social Media Content Package', 'Documentary-Style Coverage', 'Highlight Reel Package'],
  'Florist / Event Design': ['Tropical Floral Installations', 'Ceremony Space Design', 'Botanical Table Settings', 'Wild Garden Arrangements'],
  'Transportation / Shuttle': ['Airport Transfer Service', 'Full Retreat Transport Package', 'Day Trip Shuttle Service', 'Luxury Vehicle Service'],
  'Hiking / Nature Guide': ['Guided Mountain Trek', 'Scenic Trail Experience', 'Waterfall Adventure Day', 'Sunrise Summit Hike'],
  'Surf / Water Sports Instruction': ['Beginner Surf Lessons', 'Advanced Surf Coaching', 'Paddle & Surf Package', 'Ocean Safety & Surf Course'],
  'Barre / Pilates Instruction': ['Barre Fundamentals Series', 'Reformer Pilates Package', 'Barre & Pilates Fusion', 'Mat Pilates Retreat Sessions'],
  'Art / Creative Workshop Facilitation': ['Watercolor Workshop', 'Intuitive Painting Sessions', 'Mixed Media Retreat', 'Plein Air Painting Course'],
  'Music / DJ / Live Performance': ['Live Acoustic Set', 'Sunset DJ Experience', 'Kirtan & Mantra Evening', 'Live Band Package'],
  'Ceremony / Ritual Facilitation': ['Opening & Closing Ceremony', 'Fire Ceremony Package', 'Full Moon Ritual', 'Intention-Setting Ceremony'],
  'Astrology / Tarot / Intuitive Readings': ['Birth Chart Reading', 'Tarot Journey Session', 'Group Astrology Workshop', 'Intuitive Card Readings'],
  'Life Coaching / Transformational Coaching': ['1-on-1 Breakthrough Sessions', 'Group Coaching Workshop', 'Vision Board & Strategy Day', 'Transformation Intensive'],
  'Acupuncture / TCM': ['Acupuncture Session Package', 'TCM Wellness Consultation', 'Cupping & Acupuncture Combo'],
  'Ayurveda': ['Dosha Assessment & Plan', 'Panchakarma Consultation', 'Ayurvedic Cooking Class', 'Full Ayurvedic Wellness Package'],
  'Fitness / Personal Training': ['Functional Fitness Sessions', 'HIIT & Recovery Package', 'Strength & Mobility Program', 'Morning Boot Camp Series'],
  'Meditation Coaching': ['Guided Meditation Series', 'Mindfulness Retreat Program', 'Group Meditation Intensive', 'Silent Meditation Package'],
  'Aromatherapy / Essential Oils': ['Essential Oils Workshop', 'Aromatherapy Blending Session', 'Therapeutic Scent Journey', 'Custom Blend Creation'],
  'Wine / Sommelier': ['Wine Tasting Experience', 'Sommelier-Led Pairing Dinner', 'Vineyard & Terroir Workshop', 'Curated Wine Journey'],
  'Herbalism / Plant Medicine Education': ['Herbal Tea Ceremony', 'Plant Medicine Workshop', 'Herbal Remedy Making Class'],
  'Mixology / Craft Cocktails': ['Craft Cocktail Workshop', 'Botanical Mixology Class', 'Zero-Proof Cocktail Experience', 'Signature Drink Creation'],
  'Candle Making Workshop': ['Artisan Candle Workshop', 'Scented Candle Masterclass', 'Intention Candle Ceremony'],
  'Permaculture / Nature Education': ['Permaculture Garden Tour', 'Nature Connection Workshop', 'Sustainable Living Class'],
  'Pottery / Ceramics Workshop': ['Hand-Building Clay Workshop', 'Wheel Throwing Experience', 'Raku Firing Workshop'],
  'Weaving / Textile Arts': ['Natural Dyeing Workshop', 'Backstrap Weaving Lesson', 'Macrame & Fiber Art Class'],
  'Fermentation / Kombucha Workshop': ['Fermentation 101 Class', 'Kombucha Brewing Workshop', 'Probiotic Foods Course'],
  'Cacao Ceremony Facilitation': ['Sacred Cacao Ceremony', 'Heart-Opening Cacao Circle', 'Cacao & Sound Journey'],
  'Forest Bathing Guide': ['Guided Shinrin-yoku Walk', 'Forest Immersion Half-Day', 'Nature Meditation Walk'],
  'Ecstatic Dance Facilitation': ['Ecstatic Dance Journey', 'Conscious Movement Session', 'Dance & Release Evening'],
  'Drum Circle Facilitation': ['Community Drum Circle', 'Rhythmic Healing Session', 'Drumming & Meditation Combo'],
  'Fire Dancing / Flow Arts': ['Fire Performance Package', 'Flow Arts Workshop', 'Poi & Staff Spinning Lesson'],
  'Stand-Up Paddleboard Instruction': ['SUP Yoga Session', 'Paddleboard Tour', 'SUP Fitness Class'],
  'Rock Climbing Guide': ['Intro Rock Climbing Day', 'Multi-Pitch Climbing Adventure', 'Bouldering Workshop'],
  'Paragliding / Aerial Sports': ['Tandem Paragliding Flight', 'Aerial Silks Workshop', 'Zipline & Canopy Tour'],
};

const vendorDescriptions = [
  'Bringing years of dedicated practice and professional training to every retreat. Known for creating safe, transformative spaces.',
  'Passionate about elevating retreat experiences through quality and attention to detail. Every engagement is tailored to the group.',
  'Locally rooted with a global perspective. Committed to authentic, meaningful experiences that leave lasting impressions.',
  'Award-winning professional with experience serving retreats, weddings, and wellness events worldwide.',
  'Specializing in intimate group settings where every participant feels seen, heard, and supported.',
  'Blending traditional techniques with contemporary approaches for a uniquely powerful experience.',
  'Trusted by retreat leaders across the region for reliability, professionalism, and heart-centered service.',
  'Creating memorable moments through craft, care, and deep respect for the retreat experience.',
];

// --- SPACE DATA ---


const spaceNameTemplates = [
  '{adj} {noun} {type}',
  'The {adj} {noun}',
  '{noun} {type} {city}',
  'Casa {adj}',
  '{city} {adj} {type}',
];

const spaceAdj = [
  'Serene', 'Golden', 'Sacred', 'Verdant', 'Azure', 'Amber', 'Celestial',
  'Tranquil', 'Radiant', 'Lush', 'Coral', 'Misty', 'Emerald', 'Ivory',
  'Jade', 'Sunset', 'Moonlit', 'Crimson', 'Indigo', 'Opal', 'Sage',
  'Terra', 'Driftwood', 'Willow', 'Copper', 'Silver', 'Obsidian', 'Pearl',
];

const spaceNoun = [
  'Haven', 'Sanctuary', 'Nest', 'Hollow', 'Ridge', 'Cove', 'Glen',
  'Bluff', 'Meadow', 'Creek', 'Stone', 'Palm', 'Orchid', 'Lotus',
  'Banyan', 'Cedar', 'Bamboo', 'Horizon', 'Summit', 'Harbor', 'Reef',
  'Spring', 'Lagoon', 'Terrace', 'Garden', 'Vista', 'Landing', 'Canopy',
];

const spaceDescriptions = [
  'A purpose-built retreat space surrounded by nature, with thoughtfully designed gathering areas and private accommodations.',
  'This stunning property offers the perfect balance of luxury and connection to the land. Ideal for groups seeking transformation.',
  'Nestled in a breathtaking landscape, this space has hosted hundreds of retreats and is loved for its warm hospitality.',
  'A hidden gem with world-class amenities and the feeling of a private paradise. Every detail supports the retreat experience.',
  'Designed from the ground up for wellness and gathering. Open-air spaces, natural materials, and views that take your breath away.',
  'A beloved property known for its character, comfort, and the magic that happens when the right people gather here.',
  'Spacious, light-filled, and deeply peaceful. This is the kind of place where you exhale the moment you arrive.',
  'Luxury meets intention in this carefully curated space. From the kitchen to the ceremony room, everything is retreat-ready.',
];

const hostVibes = [
  'Quiet + Restorative', 'Luxury + Elevated', 'Adventure + Outdoors',
  'Community + Social', 'Spiritual + Sacred', 'Rustic + Off-Grid',
  'Beachfront + Coastal', 'Jungle + Tropical', 'Modern + Minimalist',
  'Cultural + Immersive',
];

const amenitySets = [
  ['Private rooms', 'Pool', 'Yoga shala / studio', 'Chef\'s kitchen', 'Garden / grounds', 'Wi-Fi', 'A/C', 'Parking'],
  ['Shared rooms', 'Hot tub / Jacuzzi', 'Meditation room / space', 'Communal kitchen', 'Ocean / beach access', 'Wi-Fi', 'Outdoor shower'],
  ['Private rooms', 'Pool', 'Sauna', 'Cold plunge', 'Yoga shala / studio', 'Gym / fitness area', 'On-site spa', 'Wi-Fi', 'A/C'],
  ['Private rooms', 'Mountain views', 'Fire pit', 'Hiking trails on property', 'Library / reading room', 'Communal kitchen', 'Wi-Fi'],
  ['Shared rooms', 'Dormitory / Hostel', 'Yoga shala / studio', 'Garden / grounds', 'BBQ / outdoor grill', 'Laundry', 'Wi-Fi'],
  ['Private rooms', 'Pool', 'Rooftop terrace', 'Chef\'s kitchen', 'Outdoor ceremony space', 'Garden / grounds', 'Wi-Fi', 'A/C', 'EV charging'],
  ['Private rooms', 'Ocean / beach access', 'Yoga shala / studio', 'Steam room', 'Farm / permaculture garden', 'Wi-Fi'],
  ['Private rooms', 'Hot tub / Jacuzzi', 'Meditation room / space', 'Sauna', 'Cold plunge', 'Chef\'s kitchen', 'Wi-Fi', 'Wheelchair accessible'],
];

// --- IMAGE PATH MAPPINGS ---

const R = '/demo/retreats/retreat group images';

// Maps retreat type to real image filenames — numbered sequences stay together (same group of people)
const retreatTypeToImages: Record<string, string[][]> = {
  'Yoga': [
    [`${R}/group yoga retreat.jpg`, `${R}/group yoga retreat on the beach.jpg`],
    [`${R}/womens yoga group picture.jpg`],
    [`${R}/mens yoga group image.jpg`],
    [`${R}/retreat guide yoga on the beach.jpg`],
  ],
  'Meditation': [
    [`${R}/group meditation retreat.jpg`],
    [`${R}/group spiritual retreat.jpg`],
    [`${R}/spiritual retreat photo.jpg`, `${R}/spiritual retreat photo 2 female.jpg`],
  ],
  'Wellness': [
    [`${R}/group wellness retreat.jpg`],
    [`${R}/middle aged womens retreat 1.jpg`, `${R}/middle aged womens retreat 2.jpg`, `${R}/middle aged womens retreat 3.jpg`],
    [`${R}/womens group rretreat.jpg`],
  ],
  'Adventure': [
    [`${R}/group hike.jpg`],
    [`${R}/mens hiking retreat.jpg`],
    [`${R}/young group on hike.jpg`],
  ],
  'Creative Arts': [
    [`${R}/womens art retreat.jpg`],
    [`${R}/young people group retreat - women 20s .jpg`],
  ],
  'Spiritual': [
    [`${R}/female group spiritual retreat.jpg`],
    [`${R}/Social Share People on cliff Ceremony.png`],
  ],
  'Fitness': [
    [`${R}/group working out.jpg`],
    [`${R}/mens group retreat.jpg`, `${R}/mens group retreat copy.jpg`],
  ],
  'Nature Immersion': [
    [`${R}/group retreat sunset.jpg`],
    [`${R}/young people in their 20s by the fire.jpg`],
    [`${R}/group photo for retreat.jpg`],
  ],
  'Culinary': [
    [`${R}/group dinner retreat.jpg`],
    [`${R}/group retreat dinner during holidays.jpg`],
    [`${R}/young group dinner for group retreat images.jpg`],
    [`${R}/womens retreat dinner.jpg`],
    [`${R}/group wine retreat.jpg`],
  ],
  'Mindfulness': [
    [`${R}/womens retreat young beach photo.jpg`],
    [`${R}/young womens retreat drinking rose.jpg`],
    [`${R}/female retreat guide 20 years old.jpg`],
  ],
};

// --- SPACE / HOST IMAGE PROFILES ---
// Each entry = one unique property with its showcase images (exterior + interiors)
const S = '/demo/spaces/HOST SPACES';

interface SpaceImageProfile {
  name: string;
  propertyType: string;
  images: string[]; // first image = main/avatar, rest = showcase
}

const spaceImageProfiles: SpaceImageProfile[] = [
  // Villas
  { name: 'XL White Villa', propertyType: 'Villa', images: [`${S}/XL white villa with XL pool/xlarge white villa with xlarge pool.jpg`, `${S}/XL white villa with XL pool/large modern interior for large modern villa.jpg`, `${S}/XL white villa with XL pool/ultra white interior modern .jpg`, `${S}/XL white villa with XL pool/ultra white interior modern 2.jpg`, `${S}/XL white villa with XL pool/ultra white interior modern 3.jpg`, `${S}/XL white villa with XL pool/ultra white interior modern 4.jpg`] },
  { name: 'Pink Modern Villa', propertyType: 'Villa', images: [`${S}/Pink modern villa/large modern villa.jpg`, `${S}/Pink modern villa/double sink modern restroom.jpg`] },
  { name: 'California Villa', propertyType: 'Villa', images: [`${S}/california villa/california villa 1.jpg`, `${S}/california villa/California villa 2.jpg`] },
  { name: 'Luxury Villa', propertyType: 'Villa', images: [`${S}/luxury villa/luxury villa ouside gate.jpg`, `${S}/luxury villa/glam livingroom space.jpg`, `${S}/luxury villa/large kitchen.jpg`, `${S}/luxury villa/updated modern restroom.jpg`] },
  { name: 'Modern Smaller Villa', propertyType: 'Villa', images: [`${S}/modern smaller villa/modern villa - smaller size.jpg`, `${S}/modern smaller villa/modern white kitchen.jpg`, `${S}/modern smaller villa/standard updated bathroom.jpg`] },
  { name: 'Modern Tropical Villa', propertyType: 'Villa', images: [`${S}/modern tropical villa/modern villa tropical location.jpg`, `${S}/modern tropical villa/modern villa tropical location 2.jpg`] },
  { name: 'XL Modern Tropical Villa', propertyType: 'Villa', images: [`${S}/xl modern tropical villa/xlarge modern villa tropical location.jpg`, `${S}/xl modern tropical villa/large kitchen with bar seating.jpg`, `${S}/xl modern tropical villa/modern gathering space.jpg`, `${S}/xl modern tropical villa/modern home gathering space 2.jpg`, `${S}/xl modern tropical villa/modern restroom.jpg`] },
  { name: 'XL Modern Villa', propertyType: 'Villa', images: [`${S}/xlarge modern villa with xl pool/xlarge retreat villa with xlarege pool modern style.jpg`, `${S}/xlarge modern villa with xl pool/industrial chefs kitchen for xlarge luxury estate villa.jpg`, `${S}/xlarge modern villa with xl pool/luxury restroom.jpg`, `${S}/xlarge modern villa with xl pool/ultra luxury bathroom for modern xlarge house.jpg`] },
  { name: 'Spanish Villa', propertyType: 'Villa', images: [`${S}/spanish villa/interior spanish villa.jpg`] },
  { name: 'Smaller Ultra Modern Villa', propertyType: 'Villa', images: [`${S}/smaller ultra modern villa/ultra modern villa smaller sized.jpg`, `${S}/smaller ultra modern villa/modern bathroom.jpg`, `${S}/smaller ultra modern villa/simple modern restroom.jpg`] },
  { name: 'Tiny Modern Retreat', propertyType: 'Villa', images: [`${S}/tiny modern retreat/modern villa.jpg`] },
  { name: 'Cool House with Pool', propertyType: 'Villa', images: [`${S}/cool house with pool/cool house with pool.jpg`] },
  // Retreat Centers
  { name: 'Large Retreat Center', propertyType: 'Retreat Center', images: [`${S}/Large retreat center /large retreat center in the woods 1.jpg`] },
  { name: 'Medium Retreat in Woods', propertyType: 'Retreat Center', images: [`${S}/medium sized retreat in woods/medium sized retreat home in the woods.jpg`, `${S}/medium sized retreat in woods/midium sized home gathering space.jpg`, `${S}/medium sized retreat in woods/interior king room 1.jpg`, `${S}/medium sized retreat in woods/interior king room 2.jpg`] },
  { name: 'Retreat Cabins', propertyType: 'Retreat Center', images: [`${S}/retreat cabins/retreat cabins.jpg`, `${S}/retreat cabins/cabin interior.jpg`, `${S}/retreat cabins/cabin with woman.jpg`, `${S}/retreat cabins/multiple smaller cabins retreat spaces.jpg`, `${S}/retreat cabins/image of cabin with ice plunge bath.jpg`] },
  { name: 'Multiple Bungalows', propertyType: 'Retreat Center', images: [`${S}/multiple bungalows in Tropical location/multiple small bungalos for rent in tropical location - thailand?.jpg`] },
  { name: 'Retreat with Grass', propertyType: 'Retreat Center', images: [`${S}/retreat with grass/large retreat home with grass.jpg`, `${S}/retreat with grass/large white home with grass 2.jpg`, `${S}/retreat with grass/oak interior bedroom 1.jpg`, `${S}/retreat with grass/oak interior bedroom 2.jpg`, `${S}/retreat with grass/oak interior bedroom 3.jpg`] },
  // Boutique Hotels
  { name: 'Large European Hotel', propertyType: 'Boutique Hotel', images: [`${S}/Large European hotel : multiple room location/large european home with multiple rooms.jpg`] },
  { name: 'Bungalow Hostel', propertyType: 'Boutique Hotel', images: [`${S}/bungalo hostel/hotel style bungalo rooms.jpg`, `${S}/bungalo hostel/hostel rooms interior.jpg`, `${S}/bungalo hostel/spanish hostel rooms 1.jpg`, `${S}/bungalo hostel/spanish hostel rooms 2.jpg`] },
  // Eco-Lodges
  { name: 'Tropical Huts', propertyType: 'Eco-Lodge', images: [`${S}/tropical huts/tropical hut 3.jpg`, `${S}/tropical huts/tropical huts 2.jpg`, `${S}/tropical huts/tropical huts 4.jpg`] },
  { name: 'Rustic Cabins', propertyType: 'Eco-Lodge', images: [`${S}/rustic cabins/rustic cabin porch.jpg`] },
  { name: 'Southeast Asian Retreat', propertyType: 'Eco-Lodge', images: [`${S}/southeast asian retreat house/southeast asian home.jpg`] },
  { name: 'Lodge by the River', propertyType: 'Eco-Lodge', images: [`${S}/lodge/lodge by the river.jpg`, `${S}/lodge/lodge library.jpg`] },
  // Private Estates
  { name: 'Italian Estate', propertyType: 'Private Estate', images: [`${S}/italian estate/Italian estate 1.jpg`, `${S}/italian estate/italian estate 2.jpg`, `${S}/italian estate/italian estate 3.jpg`] },
  { name: 'Tuscan Estate', propertyType: 'Private Estate', images: [`${S}/tuscan estate/tuscan estate.jpg`, `${S}/tuscan estate/tuscan estate 2.jpg`] },
  { name: 'Country Estate', propertyType: 'Private Estate', images: [`${S}/country estate/country estate .jpg`, `${S}/country estate/industrial chefs kitchen.jpg`, `${S}/country estate/large retreat hall.jpg`] },
  { name: 'Large Estate Villa', propertyType: 'Private Estate', images: [`${S}/large estate villa/lsrge estate villa.jpg`] },
  { name: 'Tropical Estate', propertyType: 'Private Estate', images: [`${S}/tropical estate/interior bedroom for tropical estate .jpg`] },
  // Beach Houses
  { name: 'Retreat on the Ocean', propertyType: 'Beach House', images: [`${S}/retreat on the ocean/retreat on the ocean 2.jpg`] },
  { name: 'Tropical House on Ocean', propertyType: 'Beach House', images: [`${S}/tropical house on the ocean/tropical house on the ocean.jpg`, `${S}/tropical house on the ocean/tropical huts in the jungle.jpg`] },
  { name: 'Island Retreat Home', propertyType: 'Beach House', images: [`${S}/island retreat home/island retreat home.jpg`] },
  // Mountain Lodges
  { name: 'Japan Retreat House', propertyType: 'Mountain Lodge', images: [`${S}/Japan house/japan retreat.jpg`, `${S}/Japan house/japan house pic 2.jpg`, `${S}/Japan house/japan house pic 3.jpg`] },
  { name: 'Stone Retreat Home', propertyType: 'Mountain Lodge', images: [`${S}/stone retreat home/xl stone retreat home.jpg`] },
  { name: 'Large Stone Villa', propertyType: 'Mountain Lodge', images: [`${S}/large stone villa/large stone villa.jpg`, `${S}/large stone villa/interior for modern retreat home.jpg`] },
  // Farmhouses
  { name: 'Farmhouse Retreat', propertyType: 'Farmhouse', images: [`${S}/farmhouse/farmhouse exterior.jpg`, `${S}/farmhouse/farmhouse porch.jpg`, `${S}/farmhouse/farmhouse kitchen 1.jpg`, `${S}/farmhouse/farmhouse kitchen 2.jpg`, `${S}/farmhouse/farmhouse living room.jpg`, `${S}/farmhouse/farmhouse garden and shed.jpg`, `${S}/farmhouse/farmhouse outside dining.jpg`, `${S}/farmhouse/farmhouse interior.jpg`] },
  { name: 'Shabby Chic Retreat', propertyType: 'Farmhouse', images: [`${S}/chabby chic retreat/retreat home three stories pink.jpg`, `${S}/chabby chic retreat/shabby chic bedroom.jpg`, `${S}/chabby chic retreat/shabby chic bedrrom 2.jpg`, `${S}/chabby chic retreat/shabby chic restroom.jpg`, `${S}/chabby chic retreat/shabby chic restroom 2 - master suite.jpg`] },
  // Other
  { name: 'California Bungalow', propertyType: 'Villa', images: [`${S}/california bungalow/bungalow apartments in southern california?.jpg`, `${S}/california bungalow/boho decor .jpg`, `${S}/california bungalow/small side yard gathering space.jpg`] },
  { name: 'Southern California Home', propertyType: 'Villa', images: [`${S}/southern california home/southern california home.jpg`] },
  { name: 'Mid-Large Home', propertyType: 'Villa', images: [`${S}/mid to large sized home/mid-large size home.jpg`] },
  { name: 'Mid-Large Retreat', propertyType: 'Villa', images: [`${S}/mid to large 8-10/mid to large sized home.jpg`] },
];

// --- GUIDE PORTRAIT IMAGES ---
const G = '/demo/guides';

// Female guide portraits (28)
const femaleGuideAvatars: string[] = [
  `${G}/blonde beach guide female 20s.jpg`,
  `${G}/blonde female mid 20's.jpg`,
  `${G}/female 30 years old guide in tropical location.jpg`,
  `${G}/female 40ish - 1.jpg`,
  `${G}/female adventure or hiking guide.jpg`,
  `${G}/female guide 20s.jpg`,
  `${G}/female guide 30 years old.jpg`,
  `${G}/female guide in 50s.jpg`,
  `${G}/female guide in her 20s traveler.jpg`,
  `${G}/female guide mid 40s.jpg`,
  `${G}/female hiking guide in her 30s .jpg`,
  `${G}/female life coach mid 30.jpg`,
  `${G}/female mid 20 - 1.jpg`,
  `${G}/female mid 20 - arts.jpg`,
  `${G}/female mid 20s spiritual guide.jpg`,
  `${G}/female mid 30 - 2.jpg`,
  `${G}/female mid 30 - guide.jpg`,
  `${G}/female mid 30's 1.jpg`,
  `${G}/female ocean guide ocean sports retreat.jpg`,
  `${G}/female retreat guide 20 years old.jpg`,
  `${G}/female spiritual guide in her 50s.jpg`,
  `${G}/woman in her 50s guide.jpg`,
  `${G}/woman in her 60s retreat for older ladies.jpg`,
  `${G}/woman mid 30s guide.jpg`,
  `${G}/womens retreat guide in her 40s.jpg`,
  `${G}/yoga guide in 30s.jpg`,
  `${G}/50+ guide arts and crafts retreat.jpg`,
];

// Male guide portraits (13)
const maleGuideAvatars: string[] = [
  `${G}/male yoga guide mid 20s.jpg`,
  `${G}/male guide mid 40s.jpg`,
  `${G}/male guide mid 50s.jpg`,
  `${G}/male in 30s guide.jpg`,
  `${G}/male journaling or writing retreat guide.jpg`,
  `${G}/male mid 30 music retreat guide.jpg`,
  `${G}/male mid 30s guide .jpg`,
  `${G}/male mid 40s south american guide.jpg`,
  `${G}/man in his 30s guide.jpg`,
  `${G}/mens travel adventure guide mid 20s.jpg`,
  `${G}/travel retreat guide male.jpg`,
  `${G}/male guide art retreat.jpg`,
  `${G}/executive guide 40s.jpg`,
];

// Guide names that should get male portraits
const maleGuideNames = new Set([
  'Bodhi', 'Ezra', 'Jasper', 'Milo', 'Orion', 'Ravi', 'Kai', 'Nico',
  'Rowan', 'Uriel', 'Yosef', 'Zion', 'Indra',
]);

// --- VENDOR IMAGE PROFILES ---
// Each entry bundles an avatar (face or best work sample) with portfolio images.
// Same-person images are grouped together on the same profile.
// avatar=null means use a work sample as the profile image.

interface VendorImageProfile {
  category: string;
  avatar: string | null; // face photo or best work sample for profile pic
  portfolio: string[];   // work samples shown on their profile page
}

const V = '/demo/vendors';

const vendorImageProfiles: VendorImageProfile[] = [
  // --- YOGA (4 profiles) ---
  { category: 'Yoga / Meditation Instruction', avatar: `${V}/yoga/yoga man 1.jpg`, portfolio: [`${V}/yoga/yoga 1.jpg`, `${V}/yoga/yoga 2.jpg`, `${V}/yoga/yoga 3.jpg`, `${V}/yoga/Yoga 4.jpg`] },
  { category: 'Yoga / Meditation Instruction', avatar: `${V}/yoga/yoga man 2.2.jpg`, portfolio: [`${V}/yoga/yoga man 2.jpg`, `${V}/yoga/yoga man 2.1.jpg`, `${V}/yoga/Yoga 7.jpg`] },
  { category: 'Yoga / Meditation Instruction', avatar: `${V}/yoga/yoga 14.jpg`, portfolio: [`${V}/yoga/yoga 8.jpg`, `${V}/yoga/yoga 9.jpg`, `${V}/yoga/yoga1 10.jpg`, `${V}/yoga/Yoga 11.jpg`] },
  { category: 'Yoga / Meditation Instruction', avatar: `${V}/yoga/yoga 15.jpg`, portfolio: [`${V}/yoga/yoga 12.jpg`, `${V}/yoga/yoga 13.jpg`, `${V}/yoga/yoga 16.jpg`, `${V}/yoga/zen 1.jpg`] },
  // --- BREATHWORK (3 profiles) ---
  { category: 'Breathwork / Pranayama', avatar: `${V}/breathwork/breathwork man 1.jpg`, portfolio: [`${V}/breathwork/breathwork man 2.jpg`, `${V}/breathwork/breathwork man 3.jpg`, `${V}/breathwork/breathwork 1.jpg`] },
  { category: 'Breathwork / Pranayama', avatar: `${V}/breathwork/breathwork couple 1.jpg`, portfolio: [`${V}/breathwork/breathwork couple 2.jpg`] },
  { category: 'Breathwork / Pranayama', avatar: `${V}/breathwork/breathwork woman 1.jpg`, portfolio: [] },
  // --- SOUND HEALING (2 profiles) ---
  { category: 'Sound Healing / Sound Baths', avatar: `${V}/sound healing/sound healing.jpg`, portfolio: [`${V}/sound healing/sound healing 2.jpg`, `${V}/sound healing/sound healing 4.jpg`, `${V}/sound healing/sound healing 5.jpg`] },
  { category: 'Sound Healing / Sound Baths', avatar: `${V}/sound healing/sound healing 6.jpg`, portfolio: [`${V}/sound bowl/sound bowl 1.jpg`, `${V}/sound bowl/sound bowls 2.jpg`, `${V}/sound bowl/sound healing.jpg`] },
  // --- REIKI / ENERGY WORK (3 profiles) ---
  { category: 'Reiki / Energy Work', avatar: `${V}/energy healing/energy heanling new female.jpg`, portfolio: [`${V}/energy healing/energy healing new female 2.jpg`, `${V}/energy healing/reiki 1.jpg`] },
  { category: 'Reiki / Energy Work', avatar: `${V}/energy healing/crystal healing.jpg`, portfolio: [`${V}/energy healing/energy healing hands and crystals.jpg`, `${V}/energy healing/energy healing 2.jpg`] },
  { category: 'Reiki / Energy Work', avatar: `${V}/energy healing/energy healing.jpg`, portfolio: [`${V}/energy healing/energy healing 3.jpg`, `${V}/energy healing/energy healing 4.jpg`] },
  // --- MASSAGE (5 profiles) ---
  { category: 'Massage / Bodywork', avatar: `${V}/massage therapy/male massage therapist 2.jpg`, portfolio: [`${V}/massage therapy/male massage therapist.jpg`, `${V}/massage therapy/massage therapist male 3.jpg`, `${V}/massage therapy/massage therapist male 4.jpg`] },
  { category: 'Massage / Bodywork', avatar: `${V}/massage therapy/massage therapist female.jpg`, portfolio: [`${V}/massage therapy/massage 1.jpg`, `${V}/massage therapy/massage 2.jpg`] },
  { category: 'Massage / Bodywork', avatar: `${V}/massage therapy/different female massage therapist.jpg`, portfolio: [`${V}/massage therapy/massage 3.jpg`, `${V}/massage therapy/massage therapist female 2.jpg`] },
  { category: 'Massage / Bodywork', avatar: `${V}/massage therapy/3rd female massage therapist .jpg`, portfolio: [`${V}/massage therapy/third female massage therapist.jpg`, `${V}/massage therapy/third female massage therapist 2.jpg`] },
  { category: 'Massage / Bodywork', avatar: `${V}/massage therapy/female massage therapist 3.jpg`, portfolio: [`${V}/massage therapy/massage therapist.jpg`] },
  // --- CATERING (5 profiles) ---
  { category: 'Catering / Private Chef', avatar: `${V}/catering/fine dining catering.jpg`, portfolio: [`${V}/catering/catering 1.jpg`, `${V}/catering/catering 2.jpg`, `${V}/catering/catering 3.jpg`, `${V}/catering/catering 8.jpg`] },
  { category: 'Catering / Private Chef', avatar: `${V}/catering/fine dining catering 2.jpg`, portfolio: [`${V}/catering/catering 11 - fine dining.jpg`, `${V}/catering/catering 12.jpg`, `${V}/catering/catering 7.jpg`] },
  { category: 'Catering / Private Chef', avatar: `${V}/catering/vegan catering 1.jpg`, portfolio: [`${V}/catering/catering 4.jpg`, `${V}/catering/catering 5.jpg`, `${V}/catering/catering 6.jpg`] },
  { category: 'Catering / Private Chef', avatar: `${V}/catering/catering 9.jpg`, portfolio: [`${V}/catering/catering 10.jpg`] },
  { category: 'Catering / Private Chef', avatar: `${V}/private chef/private chef tattoos.jpg`, portfolio: [`${V}/private chef/private chef 1.jpg`, `${V}/private chef/private chef male 2.jpg`] },
  // --- NUTRITION (3 profiles) ---
  { category: 'Nutrition / Meal Planning', avatar: `${V}/nutritionist/female nutritionist 2.jpg`, portfolio: [`${V}/nutritionist/female nutritionist.jpg`, `${V}/nutritionist/female nutritionist 3.jpg`, `${V}/nutritionist/detox drinks.jpg`, `${V}/nutritionist/nutrition.jpg`, `${V}/nutritionist/nutrition bowl.jpg`] },
  { category: 'Nutrition / Meal Planning', avatar: `${V}/nutritionist/male chef nutritionist 1.jpg`, portfolio: [`${V}/nutritionist/detox male 1.jpg`, `${V}/nutritionist/detox 1.jpg`, `${V}/nutritionist/detox 2.jpg`] },
  { category: 'Nutrition / Meal Planning', avatar: `${V}/nutritionist/male chef nutritionist 2.jpg`, portfolio: [`${V}/nutritionist/nutrition 2.jpg`] },
  // --- PHOTOGRAPHY (4 profiles) ---
  { category: 'Photography', avatar: `${V}/Photography/photographer 1 female.jpg`, portfolio: [`${V}/Photography/event photography 1.jpg`] },
  { category: 'Photography', avatar: `${V}/Photography/photographer 1 male.jpg`, portfolio: [] },
  { category: 'Photography', avatar: `${V}/Photography/photographer 3 male.jpg`, portfolio: [] },
  { category: 'Photography', avatar: `${V}/Photography/photographer 4 male.jpg`, portfolio: [`${V}/Photography/photographer 2 male.jpg`] },
  // --- VIDEOGRAPHY (2 profiles) ---
  { category: 'Videography', avatar: `${V}/videography/videographym4.jpg`, portfolio: [`${V}/videography/videography 1.jpg`] },
  { category: 'Videography', avatar: `${V}/videography/videography 2.jpg`, portfolio: [`${V}/videography/videography 3.jpg`] },
  // --- FLORAL (2 profiles) ---
  { category: 'Florist / Event Design', avatar: `${V}/floral/florist 1.jpg`, portfolio: [`${V}/floral/floral .jpg`, `${V}/floral/florist arranging.jpg`] },
  { category: 'Florist / Event Design', avatar: `${V}/floral/second florist.jpg`, portfolio: [`${V}/floral/floral 2.jpg`] },
  // --- TRANSPORTATION (1 profile) ---
  { category: 'Transportation / Shuttle', avatar: `${V}/transportation van/transportation van.jpg`, portfolio: [] },
  // --- HIKING / NATURE GUIDE (2 profiles) ---
  { category: 'Hiking / Nature Guide', avatar: `${V}/hiking guide/hiking guide male.jpg`, portfolio: [`${V}/hiking guide/hiking guide.jpg`] },
  { category: 'Hiking / Nature Guide', avatar: `${V}/hiking guide/nature guide.jpg`, portfolio: [`${V}/hiking guide/hiking guide 3.jpg`] },
  // --- SURF (1 profile) ---
  { category: 'Surf / Water Sports Instruction', avatar: `${V}/surf/surf instructor .jpg`, portfolio: [`${V}/surf/surf.jpg`, `${V}/surf/surf 2.jpg`, `${V}/surf/surf instructor 2.jpg`] },
  // --- BARRE / PILATES (4 profiles) ---
  { category: 'Barre / Pilates Instruction', avatar: `${V}/barre/barre blonde female 1.jpg`, portfolio: [`${V}/barre/barre blonde female 2.jpg`, `${V}/barre/barre blonde female 3.jpg`] },
  { category: 'Barre / Pilates Instruction', avatar: `${V}/barre/barre femle 2.jpg`, portfolio: [`${V}/barre/barre 1.jpg`] },
  { category: 'Barre / Pilates Instruction', avatar: `${V}/barre/barre instructor #3.jpg`, portfolio: [`${V}/barre/barre instructor #3.2.jpg`] },
  { category: 'Barre / Pilates Instruction', avatar: `${V}/pilates/pilates instructor.jpg`, portfolio: [`${V}/pilates/pilates instructor 2.jpg`] },
  // --- ART / CREATIVE WORKSHOP (2 profiles) ---
  { category: 'Art / Creative Workshop Facilitation', avatar: `${V}/watercolor class/watercolor class.jpg`, portfolio: [`${V}/watercolor class/watercolor workshop 1.jpg`] },
  { category: 'Art / Creative Workshop Facilitation', avatar: `${V}/arts and crafts workshop/arts and crafts workshop.jpg`, portfolio: [`${V}/arts and crafts workshop/crafting workshop 1.jpg`, `${V}/arts and crafts workshop/crafting workshop 2.jpg`, `${V}/arts and crafts workshop/crafting workshop 3.jpg`] },
  // --- MUSIC / LIVE PERFORMANCE (2 profiles) ---
  { category: 'Music / DJ / Live Performance', avatar: `${V}/live performance/live performance singer.jpg`, portfolio: [`${V}/musician/singer 1.jpg`] },
  { category: 'Music / DJ / Live Performance', avatar: `${V}/live performance/live performance artist 2.jpg`, portfolio: [] },
  // --- CEREMONY (1 profile) ---
  { category: 'Ceremony / Ritual Facilitation', avatar: `${V}/ceremony/ceremony 1.jpg`, portfolio: [`${V}/ceremony/ceremony ritual.jpg`, `${V}/ceremony/ceremony ritual 2.jpg`] },
  // --- ASTROLOGY / TAROT (2 profiles) ---
  { category: 'Astrology / Tarot / Intuitive Readings', avatar: `${V}/astrology/astrology reading profile.jpg`, portfolio: [`${V}/astrology/astrology chart reading with astrologer.jpg`, `${V}/astrology/astrology reading 1.jpg`, `${V}/astrology/astrology chart .jpg`, `${V}/astrology/astrology chart reading .jpg`] },
  { category: 'Astrology / Tarot / Intuitive Readings', avatar: `${V}/tarot/tarot card 1.jpg`, portfolio: [`${V}/tarot/tarot cards 2.jpg`, `${V}/tarot/tarot cards 3.jpg`, `${V}/tarot/tarot cards 4.jpg`] },
  // --- LIFE COACHING (2 profiles) ---
  { category: 'Life Coaching / Transformational Coaching', avatar: `${V}/life coach/life coach female profile 1.jpg`, portfolio: [`${V}/life coach/life coach 1.jpg`, `${V}/life coach/life coach 2.jpg`] },
  { category: 'Life Coaching / Transformational Coaching', avatar: `${V}/life coach/male life coach 1.jpg`, portfolio: [`${V}/life coach/image for life coach profile.jpg`] },
  // --- ACUPUNCTURE (1 profile) ---
  { category: 'Acupuncture / TCM', avatar: `${V}/accupuncture/accupuncture .jpg`, portfolio: [`${V}/accupuncture/accupuncture 1.jpg`, `${V}/accupuncture/accupuncture 2.jpg`] },
  // --- AYURVEDA (1 profile) ---
  { category: 'Ayurveda', avatar: `${V}/ayurveda/ayurrveda.jpg`, portfolio: [`${V}/ayurveda/ayurveda 2.jpg`, `${V}/ayurveda/traditional Indian ceremony.jpg`, `${V}/ayurveda/life coach female profile 2.jpg`] },
  // --- FITNESS / PERSONAL TRAINING (3 profiles) ---
  { category: 'Fitness / Personal Training', avatar: `${V}/fitness instructor/fitness instructor female blonde.jpg`, portfolio: [`${V}/fitness instructor/fitness instructor female blonde 2.jpg`] },
  { category: 'Fitness / Personal Training', avatar: `${V}/fitness instructor/fitness instructor - female 1.jpg`, portfolio: [] },
  { category: 'Fitness / Personal Training', avatar: `${V}/fitness instructor/fitness instructor 3.jpg`, portfolio: [`${V}/fitness instructor/fitness instructor female 2 .jpg`] },
  // --- MEDITATION COACHING (4 profiles) ---
  { category: 'Meditation Coaching', avatar: `${V}/meditation/group meditation vendor with manbun profile image.jpg`, portfolio: [`${V}/meditation/group meditation - vendor with man bun.jpg`, `${V}/meditation/group meditation vendor with manbun 3.jpg`, `${V}/meditation/group meditation- vendor with man bun.jpg`] },
  { category: 'Meditation Coaching', avatar: `${V}/meditation/meditation vendor profile - younger.jpg`, portfolio: [`${V}/meditation/group meditation younger vendor.jpg`, `${V}/meditation/group meditation younger vendor 2.jpg`] },
  { category: 'Meditation Coaching', avatar: `${V}/meditation/meditation female #2 profile.jpg`, portfolio: [`${V}/meditation/meditation female .jpg`, `${V}/meditation/meditation female 2.1.jpg`] },
  { category: 'Meditation Coaching', avatar: `${V}/meditation/meditation male 1.0.jpg`, portfolio: [`${V}/meditation/meditation male 1.2.jpg`, `${V}/meditation/meditation group image.jpg`] },
  // --- AROMATHERAPY (3 profiles) ---
  { category: 'Aromatherapy / Essential Oils', avatar: `${V}/aromatherapy /aromatherapy female 1.jpg`, portfolio: [`${V}/aromatherapy /aromatherapy female 2.jpg`, `${V}/aromatherapy /aromatherapy workshop.jpg`] },
  { category: 'Aromatherapy / Essential Oils', avatar: `${V}/aromatherapy /aroma therapy male.jpg`, portfolio: [`${V}/aromatherapy /aromatherapy workshop hands.jpg`] },
  { category: 'Aromatherapy / Essential Oils', avatar: `${V}/aromatherapy /aromatherapy workship female profile image.jpg`, portfolio: [`${V}/aromatherapy /aromatherapy workshop vendor 2.jpg`] },
  // --- WINE / SOMMELIER (2 profiles) ---
  { category: 'Wine / Sommelier', avatar: `${V}/wine/female sommelier.jpg`, portfolio: [`${V}/wine/female sommelier 2.jpg`, `${V}/wine/wine tasting.jpg`, `${V}/wine/wine tasting set of 4.jpg`] },
  { category: 'Wine / Sommelier', avatar: `${V}/wine/sommelier 1.jpg`, portfolio: [`${V}/wine/wine.jpg`, `${V}/wine/wine tasting score card.jpg`, `${V}/wine/wine tasting set of 4 - 2.jpg`] },
  // --- HERBALISM / TEA CEREMONY (1 profile) ---
  { category: 'Herbalism / Plant Medicine Education', avatar: `${V}/tea ceremony/tea ceremony.jpg`, portfolio: [`${V}/tea ceremony/herbal tea 1.jpg`, `${V}/tea ceremony/herbal tea 2.jpg`, `${V}/tea ceremony/tea ceremony workshop.jpg`] },
  // --- MIXOLOGY (3 profiles) ---
  { category: 'Mixology / Craft Cocktails', avatar: `${V}/mixologist/mixologist female 1.jpg`, portfolio: [`${V}/mixologist/mixologist female with drink.jpg`, `${V}/mixologist/mixologist drink 1.jpg`, `${V}/mixologist/mixologist drink 2.jpg`] },
  { category: 'Mixology / Craft Cocktails', avatar: `${V}/mixologist/mixologist male 1.jpg`, portfolio: [`${V}/mixologist/mixologist drink 3.jpg`, `${V}/mixologist/mixologist drink 4.jpg`] },
  { category: 'Mixology / Craft Cocktails', avatar: `${V}/mixologist/mixologist male 2.jpg`, portfolio: [`${V}/mixologist/mixologist drink 5.jpg`] },
  // --- CANDLE MAKING (1 profile) ---
  { category: 'Candle Making Workshop', avatar: `${V}/candle maker/candle maker.jpg`, portfolio: [`${V}/candle maker/candle maker 2.jpg`, `${V}/candle maker/candle making workshop 1.jpg`, `${V}/candle maker/candle making 2 workshop.jpg`] },
  // --- PERMACULTURE / NATURE EDUCATION (1 profile) ---
  { category: 'Permaculture / Nature Education', avatar: `${V}/nature education/nature education 1.jpg`, portfolio: [`${V}/nature education/nature education 2.jpg`, `${V}/nature education/nature education 3.jpg`, `${V}/nature education/naturen education 4.jpg`] },
  // --- POTTERY (1 profile) ---
  { category: 'Pottery / Ceramics Workshop', avatar: `${V}/pottery/pottery workshop 1.jpg`, portfolio: [`${V}/pottery/pottery workshop 2.jpg`, `${V}/pottery/pottery workshop 3.jpg`, `${V}/pottery/pottery workshop 4.jpg`, `${V}/pottery/pottery workshop 5.jpg`] },
  // --- WEAVING (1 profile) ---
  { category: 'Weaving / Textile Arts', avatar: `${V}/weaving/weaving  woman.jpg`, portfolio: [`${V}/weaving/textile arts 1.jpg`, `${V}/weaving/textile arts 2.jpg`, `${V}/weaving/weaving workshop small loom.jpg`] },
  // --- KOMBUCHA (1 profile) ---
  { category: 'Fermentation / Kombucha Workshop', avatar: `${V}/kombucha workshop/kombucha workshop 2.jpg`, portfolio: [`${V}/kombucha workshop/kombucha workshop 1.jpg`] },
  // --- CACAO (1 profile) ---
  { category: 'Cacao Ceremony Facilitation', avatar: `${V}/cacao ceremony/cacao ceremony 1.jpg`, portfolio: [`${V}/cacao ceremony/cacao ceremony 2.jpg`, `${V}/cacao ceremony/cacao ceremony 3.jpg`, `${V}/cacao ceremony/cacao ceremony 5.jpg`] },
  // --- FOREST BATHING (1 profile) ---
  { category: 'Forest Bathing Guide', avatar: `${V}/forest bathing/forest bathing 1.jpg`, portfolio: [`${V}/forest bathing/forest bathing 2.jpg`, `${V}/forest bathing/forest bathing 3.jpg`, `${V}/forest bathing/forest bathing barefoot.jpg`, `${V}/forest bathing/forest bathing bird in hand.jpg`] },
  // --- ECSTATIC DANCE (1 profile) ---
  { category: 'Ecstatic Dance Facilitation', avatar: `${V}/ecstatic dance/ecstatic dance 2.jpg`, portfolio: [`${V}/ecstatic dance/ecstatic dance 3.jpg`] },
  // --- DRUM CIRCLE (1 profile) ---
  { category: 'Drum Circle Facilitation', avatar: `${V}/drum circle/drum circle 3.jpg`, portfolio: [`${V}/drum circle/drum circle 1.jpg`, `${V}/drum circle/drum circle 2.jpg`] },
  // --- FIRE DANCING (1 profile) ---
  { category: 'Fire Dancing / Flow Arts', avatar: `${V}/fire dancing/fire dancing 1.jpg`, portfolio: [`${V}/fire dancing/fire dancing 2.jpg`, `${V}/fire dancing/fire dancer 3.jpg`, `${V}/fire dancing/ecstatic dance 1.jpg`] },
  // --- SUP (1 profile) ---
  { category: 'Stand-Up Paddleboard Instruction', avatar: `${V}/standup paddle board/stand up paddle board 1.jpg`, portfolio: [`${V}/standup paddle board/stand up paddle board group 2.jpg`, `${V}/standup paddle board/stand up paddle boarding group.jpg`, `${V}/standup paddle board/stand up paddle boaring 2 men.jpg`] },
  // --- ROCK CLIMBING (1 profile) ---
  { category: 'Rock Climbing Guide', avatar: `${V}/rock climbing/rock climbing 2.jpg`, portfolio: [`${V}/rock climbing/rock climbing 1.jpg`, `${V}/rock climbing/rock climbing 3.jpg`, `${V}/rock climbing/rock climbing guide 4.jpg`] },
  // --- PARAGLIDING (1 profile) ---
  { category: 'Paragliding / Aerial Sports', avatar: `${V}/paragliding/paragliding 1.jpg`, portfolio: [`${V}/paragliding/paragliding 2.jpg`, `${V}/paragliding/paragliding 3.jpg`] },
];

// Build lookup: category → array of image profiles for that category
const vendorImagesByCategory: Record<string, VendorImageProfile[]> = {};
for (const profile of vendorImageProfiles) {
  if (!vendorImagesByCategory[profile.category]) {
    vendorImagesByCategory[profile.category] = [];
  }
  vendorImagesByCategory[profile.category].push(profile);
}

// Guide gallery images use retreat group photos (no overlap with vendor images)
const guideGalleryImages: Record<string, string[]> = {
  'Yoga': [`${R}/group yoga retreat.jpg`, `${R}/group yoga retreat on the beach.jpg`],
  'Meditation': [`${R}/group meditation retreat.jpg`, `${R}/group spiritual retreat.jpg`],
  'Wellness': [`${R}/group wellness retreat.jpg`, `${R}/womens group rretreat.jpg`],
  'Adventure': [`${R}/group hike.jpg`, `${R}/young group on hike.jpg`],
  'Creative Arts': [`${R}/womens art retreat.jpg`, `${R}/young people group retreat - women 20s .jpg`],
  'Spiritual': [`${R}/female group spiritual retreat.jpg`, `${R}/spiritual retreat photo.jpg`],
  'Fitness': [`${R}/group working out.jpg`, `${R}/mens group retreat.jpg`],
  'Nature Immersion': [`${R}/group retreat sunset.jpg`, `${R}/group photo for retreat.jpg`],
  'Culinary': [`${R}/group dinner retreat.jpg`, `${R}/group wine retreat.jpg`],
  'Mindfulness': [`${R}/womens retreat young beach photo.jpg`, `${R}/young people in their 20s by the fire.jpg`],
};

// --- DETERMINISTIC SEEDED RANDOM ---

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// --- GENERATORS ---

export interface DemoUser {
  id: string;
  displayName: string;
  email: string;
  roles: string[];
  profileSlug: string;
  locationLabel?: string;
  locationLat?: number;
  locationLng?: number;
  bio?: string;
  specialties?: string[];
  vendorCategories?: string[];
  guideRetreatTypes?: string[];
  hostAmenities?: string[];
  avatarUrl?: string;
  galleryUrls?: string[];
  portfolioUrls?: string[];
  propertyShowcaseUrls?: string[];
  createdAt: 'SERVER_TIMESTAMP';
  isDemo: true;
}

export interface DemoRetreat {
  hostId: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  costPerPerson: number;
  currency: string;
  capacity: number;
  currentAttendees: number;
  locationDescription: string;
  lat: number;
  lng: number;
  included: string;
  status: 'published';
  retreatImageUrls: string[];
  createdAt: 'SERVER_TIMESTAMP';
  updatedAt: 'SERVER_TIMESTAMP';
  isDemo: true;
}

export interface DemoService {
  vendorId: string;
  name: string;
  description: string;
  category: string;
  serviceArea: string;
  startingPrice: number;
  currency: string;
  status: 'active';
  serviceImageUrls: string[];
  bookedUntil: string;
  createdAt: 'SERVER_TIMESTAMP';
  updatedAt: 'SERVER_TIMESTAMP';
  isDemo: true;
}

export interface DemoSpace {
  spaceOwnerId: string;
  name: string;
  description: string;
  propertyType: string;
  city: string;
  stateProvince: string;
  country: string;
  locationDescription: string;
  lat: number;
  lng: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  dailyRate: number;
  currency: string;
  amenities: string[];
  hostVibe: string;
  status: 'published';
  spaceImageUrls: string[];
  nextAvailableDate: string;
  createdAt: 'SERVER_TIMESTAMP';
  updatedAt: 'SERVER_TIMESTAMP';
  isDemo: true;
}

export function generateAllDemoData() {
  const rand = seededRandom(42);

  const users: DemoUser[] = [];
  const retreats: DemoRetreat[] = [];
  const services: DemoService[] = [];
  const spaces: DemoSpace[] = [];

  // Track used names to avoid duplicates
  const usedNames = new Set<string>();
  let nameIdx = 0;

  function nextName(): { first: string; last: string; full: string } {
    let full: string;
    let first: string;
    let last: string;
    do {
      first = firstNames[nameIdx % firstNames.length];
      last = lastNames[Math.floor(nameIdx / firstNames.length) % lastNames.length];
      // Mix up last names more with an offset based on role bucket
      const offset = Math.floor(nameIdx * 7 + nameIdx * 3) % lastNames.length;
      last = lastNames[offset];
      full = `${first} ${last}`;
      nameIdx++;
    } while (usedNames.has(full) && nameIdx < 10000);
    usedNames.add(full);
    return { first, last, full };
  }

  // --- GUIDES (40 users, ~60 retreats) ---
  let maleGuideIdx = 0;
  let femaleGuideIdx = 0;

  for (let i = 0; i < 40; i++) {
    const name = nextName();
    const loc = locations[i % locations.length];
    const types = pickN(retreatTypes, 2, rand);
    const userId = `demo-guide-${i.toString().padStart(3, '0')}`;

    // Assign portrait based on name gender
    const isMale = maleGuideNames.has(name.first);
    let avatarUrl: string;
    if (isMale && maleGuideIdx < maleGuideAvatars.length) {
      avatarUrl = maleGuideAvatars[maleGuideIdx++];
    } else if (!isMale && femaleGuideIdx < femaleGuideAvatars.length) {
      avatarUrl = femaleGuideAvatars[femaleGuideIdx++];
    } else {
      // Fallback: use whichever pool has remaining
      avatarUrl = femaleGuideIdx < femaleGuideAvatars.length
        ? femaleGuideAvatars[femaleGuideIdx++]
        : maleGuideAvatars[maleGuideIdx++ % maleGuideAvatars.length];
    }

    users.push({
      id: userId,
      displayName: name.full,
      email: `${slugify(name.full)}@demo.highviberetreats.com`,
      roles: ['guide'],
      profileSlug: slugify(name.full),
      locationLabel: locationDescription(loc),
      locationLat: loc.lat,
      locationLng: loc.lng,
      bio: `Experienced ${types[0].toLowerCase()} and ${types[1].toLowerCase()} facilitator based in ${loc.city}. Leading transformative retreats for over ${3 + Math.floor(rand() * 12)} years.`,
      guideRetreatTypes: types,
      avatarUrl,
      galleryUrls: [
        ...(guideGalleryImages[types[0]] || []),
        ...(guideGalleryImages[types[1]] || []),
      ].slice(0, 4),
      createdAt: 'SERVER_TIMESTAMP',
      isDemo: true,
    });

    // Each guide gets 1-2 retreats
    const retreatCount = i < 20 ? 2 : 1; // First 20 guides get 2 retreats
    for (let r = 0; r < retreatCount; r++) {
      const retreatLoc = r === 0 ? loc : locations[(i * 3 + r) % locations.length];
      const type = types[r % types.length];
      const template = retreatTitleTemplates[(i * retreatCount + r) % retreatTitleTemplates.length];
      const title = template
        .replace('{type}', type)
        .replace('{city}', retreatLoc.city);

      const capacity = [8, 10, 12, 14, 15, 16, 18, 20][Math.floor(rand() * 8)];
      const durationDays = [5, 6, 7, 8, 10][Math.floor(rand() * 5)];

      // Random start date in the past few months to next few months
      const monthOffset = Math.floor(rand() * 6) - 2;
      const dayOffset = Math.floor(rand() * 28);
      const startDate = new Date(2026, 2 + monthOffset, 1 + dayOffset);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      // Most retreats $1500-$5000/person, a few budget ($800-$1200), a few ultra-premium ($5500-$8000)
      let price: number;
      const tier = rand();
      if (tier < 0.08) {
        // ~8% budget
        price = [800, 950, 1100, 1200][Math.floor(rand() * 4)];
      } else if (tier > 0.92) {
        // ~8% ultra-premium
        price = [5500, 6000, 6500, 7000, 8000][Math.floor(rand() * 5)];
      } else {
        // ~84% core range
        price = [1500, 1800, 2000, 2200, 2500, 2800, 3000, 3200, 3500, 3800, 4000, 4200, 4500, 4800, 5000][Math.floor(rand() * 15)];
      }

      // Pick an image group from the retreat type's pool, rotating through them
      // Each group is a set of images showing the same people
      const typeImageGroups = retreatTypeToImages[type] || retreatTypeToImages['Wellness'];
      const imageGroup = typeImageGroups[(i * retreatCount + r) % typeImageGroups.length];

      retreats.push({
        hostId: userId,
        title,
        description: pick(retreatDescriptions, rand),
        type,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        costPerPerson: price,
        currency: 'USD',
        capacity,
        currentAttendees: capacity, // FULLY BOOKED
        locationDescription: locationDescription(retreatLoc),
        lat: retreatLoc.lat + (rand() - 0.5) * 0.05,
        lng: retreatLoc.lng + (rand() - 0.5) * 0.05,
        included: pick(includedOptions, rand),
        status: 'published',
        retreatImageUrls: imageGroup,
        createdAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
        isDemo: true,
      });
    }
  }

  // --- VENDORS (1 vendor per unique image profile — no image recycling) ---
  for (let i = 0; i < vendorImageProfiles.length; i++) {
    const imageProfile = vendorImageProfiles[i];
    const category = imageProfile.category;
    const name = nextName();
    const loc = locations[i % locations.length];
    const userId = `demo-vendor-${i.toString().padStart(3, '0')}`;

    const avatarUrl = imageProfile.avatar || (imageProfile.portfolio[0] || '');
    const portfolioUrls = imageProfile.portfolio;

    users.push({
      id: userId,
      displayName: name.full,
      email: `${slugify(name.full)}@demo.highviberetreats.com`,
      roles: ['vendor'],
      profileSlug: slugify(name.full),
      locationLabel: locationDescription(loc),
      locationLat: loc.lat,
      locationLng: loc.lng,
      bio: pick(vendorDescriptions, rand),
      vendorCategories: [category],
      avatarUrl,
      portfolioUrls,
      createdAt: 'SERVER_TIMESTAMP',
      isDemo: true,
    });

    // Each vendor gets 1 service
    {
      const serviceNames = vendorServiceNames[category] || [`${category} Service`];
      const serviceName = serviceNames[i % serviceNames.length];

      // Realistic pricing by category (per retreat/event engagement)
      const categoryPricing: Record<string, number[]> = {
        'Catering / Private Chef': [2500, 3000, 3500, 4000, 5000, 6000, 8000],
        'Photography': [1500, 2000, 2500, 3000, 3500, 4500],
        'Videography': [2000, 2500, 3000, 4000, 5000, 6000],
        'Music / DJ / Live Performance': [800, 1200, 1500, 2000, 2500, 3000],
        'Astrology / Tarot / Intuitive Readings': [300, 400, 500, 600, 800, 1000],
        'Sound Healing / Sound Baths': [400, 500, 600, 750, 1000, 1200],
        'Reiki / Energy Work': [300, 400, 500, 600, 800],
        'Ceremony / Ritual Facilitation': [500, 750, 1000, 1500, 2000],
        'Yoga / Meditation Instruction': [500, 750, 1000, 1200, 1500, 2000],
        'Breathwork / Pranayama': [400, 600, 800, 1000, 1200],
        'Massage / Bodywork': [600, 800, 1000, 1200, 1500],
        'Florist / Event Design': [800, 1200, 1500, 2000, 3000, 4000],
        'Transportation / Shuttle': [400, 600, 800, 1000, 1500],
        'Hiking / Nature Guide': [500, 750, 1000, 1200, 1500],
        'Surf / Water Sports Instruction': [400, 600, 800, 1000, 1200],
        'Barre / Pilates Instruction': [400, 600, 800, 1000, 1200],
        'Art / Creative Workshop Facilitation': [400, 600, 800, 1000, 1200],
        'Life Coaching / Transformational Coaching': [800, 1200, 1500, 2000, 2500],
        'Acupuncture / TCM': [400, 500, 600, 800, 1000],
        'Ayurveda': [500, 750, 1000, 1500, 2000],
        'Fitness / Personal Training': [400, 600, 800, 1000, 1200],
        'Meditation Coaching': [500, 750, 1000, 1200, 1500],
        'Aromatherapy / Essential Oils': [300, 400, 500, 600, 800],
        'Wine / Sommelier': [800, 1200, 1500, 2000, 2500],
        'Nutrition / Meal Planning': [500, 750, 1000, 1500],
        'Mixology / Craft Cocktails': [600, 800, 1000, 1500, 2000],
        'Candle Making Workshop': [300, 400, 500, 600],
        'Cacao Ceremony Facilitation': [300, 400, 500, 600, 800],
        'Forest Bathing Guide': [250, 350, 500, 600],
        'Ecstatic Dance Facilitation': [400, 500, 600, 800, 1000],
        'Drum Circle Facilitation': [300, 400, 500, 600],
        'Pottery / Ceramics Workshop': [500, 750, 1000, 1200],
      };
      const defaultPricing = [500, 750, 1000, 1500, 2000];
      const priceOptions = categoryPricing[category] || defaultPricing;
      const price = priceOptions[Math.floor(rand() * priceOptions.length)];

      // Booked until 12-18 months from now
      const bookedMonths = 12 + Math.floor(rand() * 7);
      const bookedUntil = new Date(2026, 2 + bookedMonths, 1);

      services.push({
        vendorId: userId,
        name: serviceName,
        description: pick(vendorDescriptions, rand),
        category: category,
        serviceArea: locationDescription(loc),
        startingPrice: price,
        currency: 'USD',
        status: 'active',
        serviceImageUrls: [],
        bookedUntil: bookedUntil.toISOString().split('T')[0],
        createdAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
        isDemo: true,
      });
    }
  }

  // --- HOSTS (40 users, 1 space each — one per spaceImageProfile) ---
  for (let i = 0; i < spaceImageProfiles.length; i++) {
    const spaceProfile = spaceImageProfiles[i];
    const name = nextName();
    const loc = locations[i % locations.length];
    const userId = `demo-host-${i.toString().padStart(3, '0')}`;

    users.push({
      id: userId,
      displayName: name.full,
      email: `${slugify(name.full)}@demo.highviberetreats.com`,
      roles: ['host'],
      profileSlug: slugify(name.full),
      locationLabel: locationDescription(loc),
      locationLat: loc.lat,
      locationLng: loc.lng,
      bio: `Owner of a beautiful ${spaceProfile.propertyType.toLowerCase()} in ${loc.city}, dedicated to hosting transformative retreat experiences.`,
      hostAmenities: pick(amenitySets, rand),
      avatarUrl: spaceProfile.images[0],
      propertyShowcaseUrls: spaceProfile.images,
      createdAt: 'SERVER_TIMESTAMP',
      isDemo: true,
    });

    const adj = pick(spaceAdj, rand);
    const noun = pick(spaceNoun, rand);
    const spaceName = `${adj} ${noun} — ${spaceProfile.name}`;

    // Most retreat homes house 8-15 guests; a few larger estates accommodate up to 24
    const capacity = [8, 8, 10, 10, 12, 12, 14, 15, 16, 18, 20, 24][Math.floor(rand() * 12)];
    const bedrooms = Math.max(3, Math.floor(capacity / 2.2));
    const bathrooms = Math.max(2, Math.floor(bedrooms * 0.85));

    let dailyRate: number;
    const rateTier = rand();
    if (rateTier < 0.15) {
      dailyRate = [500, 550, 600, 650, 700, 750, 800][Math.floor(rand() * 7)];
    } else if (rateTier > 0.8) {
      dailyRate = [1500, 1800, 2000, 2200, 2500, 2800, 3000, 3500][Math.floor(rand() * 8)];
    } else {
      dailyRate = [800, 850, 900, 950, 1000, 1100, 1200, 1300, 1400, 1500][Math.floor(rand() * 10)];
    }

    const bookedMonths = 24 + Math.floor(rand() * 13);
    const nextAvailable = new Date(2026, 2 + bookedMonths, 1);

    spaces.push({
      spaceOwnerId: userId,
      name: spaceName,
      description: pick(spaceDescriptions, rand),
      propertyType: spaceProfile.propertyType,
      city: loc.city,
      stateProvince: loc.region,
      country: loc.country,
      locationDescription: locationDescription(loc),
      lat: loc.lat + (rand() - 0.5) * 0.05,
      lng: loc.lng + (rand() - 0.5) * 0.05,
      capacity,
      bedrooms,
      bathrooms,
      dailyRate,
      currency: 'USD',
      amenities: pick(amenitySets, rand),
      hostVibe: pick(hostVibes, rand),
      status: 'published',
      spaceImageUrls: spaceProfile.images,
      nextAvailableDate: nextAvailable.toISOString().split('T')[0],
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
      isDemo: true,
    });
  }

  return { users, retreats, services, spaces };
}
