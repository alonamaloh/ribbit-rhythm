// Habitats: which levels live where, each habitat's colours, band style and shop.
'use strict';

// Levels are listed by id, in the order kids play them. A habitat with no levels shows as "coming soon".
// shop: true = this habitat has its own shop (flowers earned here are spent here).
// Habitats without a shop yet still save their flowers for when the shop opens.
const HABITATS = [
  { id: 'sunny', name: 'Sunny Pond', teaches: 'Quarters, halves, wholes and quarter rests', band: 'pop', shop: true,
    levels: ['l1', 'l2', 'l3', 's1', 's2', 'l4', 's3'] },
  { id: 'marsh', name: 'Reed Marsh', teaches: 'Half rests, whole rests and reading ahead', band: 'folk', shop: true,
    levels: ['l5', 'r1', 'm1', 'r2', 'r3', 'r4'] },
  { id: 'bayou', name: 'Firefly Bayou', teaches: 'Eighth notes', band: 'pop', shop: false,
    levels: ['l7', 'm2'] },
  { id: 'mountain', name: 'Mountain Stream', teaches: '3/4 time', band: 'pop', shop: false,
    levels: ['l8'] },
  { id: 'lagoon', name: 'Tropical Lagoon', teaches: 'Dotted notes and triplets', band: 'pop', shop: false,
    levels: [] },
  { id: 'moonlit', name: 'Moonlit Lake', teaches: 'Sight-reading and two-hand duets', band: 'pop', shop: false,
    levels: ['l6', 'l9', 'd1', 'd2', 'd3', 'd4'] },
];

// Colours for the play screen and the pond map. Habitats without their own yet use Sunny Pond's.
const THEMES = {
  sunny: { sky: ['#9fdcff', '#ebfbff'], fogSky: ['#bfdde8', '#eef7f6'], hills: ['#b2e2a4', '#8ccf7e'], water: ['#86d6dc', '#3f9fb6'],
    map: ['#9be0dd', '#4fa8b8'], grass: '#8fd468', grassDark: '#6fbf4f', reedsEvery: 1, sun: '#ffe27a' },
  marsh: { sky: ['#bfdccb', '#f2f3dc'], fogSky: ['#cfdccf', '#eef0e2'], hills: ['#a9c48a', '#87a868'], water: ['#88b9a0', '#3e7766'],
    map: ['#9cc9a8', '#4f8a72'], grass: '#9cbf6a', grassDark: '#7aa24f', reedsEvery: 0.5, sun: '#ffd98a' },
};

const levelById = id => LEVELS.find(L => L.id === id);
const levelIndex = id => LEVELS.findIndex(L => L.id === id);
const habitatOf = L => HABITATS.find(h => h.levels.includes(L.id)) || HABITATS[0];
const habitatById = id => HABITATS.find(h => h.id === id) || HABITATS[0];
const themeOf = hab => THEMES[hab.id] || THEMES.sunny;
// the habitat the player is in (remembered between visits)
const currentHabitat = () => habitatById(progress.habitat);
// the theme for what's on screen: the level being played, or the habitat being browsed
const theme = () => themeOf(G ? habitatOf(G.L) : currentHabitat());
