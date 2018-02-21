import compose from './compose.js';

export const map = f => arr => arr.map(f);

export const filter = f => arr => arr.filter(f);

export const find = f => arr => arr.find(f);

export const newSet = arr => new Set(arr);

export const uniq = compose(Array.from, newSet);
