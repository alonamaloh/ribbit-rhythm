// Titles for the results screen. Just lists of text: add, change or remove freely.
'use strict';

// By number of stars. 1 star still means the frog made it across, so keep it cheerful.
const RESULT_TITLES = {
  3: ['Perfect pond!', 'Ribbit-tastic!', 'Toad-ally awesome!', 'Hop-tastic!', 'Lily pad legend!',
      'Frog-nificent!', 'Right on the beat!', 'Super-duper hopper!', 'The whole pond is clapping!', 'Un-frog-ettable!'],
  2: ['Great hopping!', 'Nice hops!', 'Hoppy days!', 'Smooth hopping!', 'Well hopped!',
      'Croaking good!', 'What a jumper!', 'Lily pad pro!', 'Ribbiting work!'],
  1: ['You made it across!', 'Hop, hop, hooray!', 'Safe on the shore!', 'You did it!',
      'You never gave up!', 'Practice makes hoppy!', 'Across the pond!', 'Land ho, little frog!'],
};

// Extra titles for one level (by level id). "any" works for every star count.
const LEVEL_TITLES = {
  l1: { any: ['Your very first hops!'], 3: ['A star hopper is born!'] },
  l2: { any: ['The fish say thank you!', 'You let the fish swim by!'], 3: ['Not a single splash!'] },
  l3: { any: ['Hold it… hold it… yes!', 'Long notes, long smiles!'] },
  l4: { any: ['You read through the fog!', 'The mist can’t stop you!'] },
  l5: { any: ['The big fish swam right by!', 'Two beats of waiting. Yes!'] },
  m1: { any: ['Out of the reeds!', 'Eyes on the notes!'] },
  l6: { any: ['Hopping in the dark!', 'The owls are impressed!'], 3: ['Night-time ninja!'] },
  l7: { any: ['Hop-hop, hop-hop!', 'One-and, two-and, yes!'], 3: ['Quick as a firefly!'] },
  l8: { any: ['One-two-three, hooray!', 'What a waltz!'], 3: ['May I have this dance?'] },
  m2: { any: ['Through the tall grass!', 'The grass couldn’t hide it!'] },
  l9: { any: ['The moon is smiling!'], 3: ['Moonlight marvel!'] },
  d1: { any: ['Great teamwork, frogs!'], 3: ['Ping! Pong! Perfect!'] },
  d2: { any: ['Both hands, one band!'], 3: ['Steady as a rock!'] },
  d3: { any: ['What a frog chorus!', 'Two frogs, one song!'] },
  d4: { any: ['Two lines? No problem!'], 3: ['Duet-tastic!'] },
};

// Pick a title: often one for this level, otherwise a general one; never one of the last few shown.
const recentTitles = [];
function resultTitle(L, stars) {
  const lv = LEVEL_TITLES[L.id] || {}, own = (lv.any || []).concat(lv[stars] || []);
  const fresh = list => list.filter(t => !recentTitles.includes(t));
  let pool = own.length && Math.random() < 0.4 ? fresh(own) : [];
  if (!pool.length) pool = fresh(RESULT_TITLES[stars]);
  if (!pool.length) pool = RESULT_TITLES[stars];
  const t = pool[Math.floor(Math.random() * pool.length)];
  recentTitles.push(t); if (recentTitles.length > 4) recentTitles.shift();
  return t;
}
