import { and, compose, eq, prop, uniqueByKey } from './lib.js';

// uniqueNeighbourhoods :: o -> ks
export const uniqueNeighbourhoods = uniqueByKey('neighbourhood');

// uniqueCuisines :: o -> ks
export const uniqueCuisines = uniqueByKey('cuisine_type');

/** Predicate the filters by cuisine, neighbourhood, or both. */
// byCuisineAndNeighbourhood :: (s, s) -> f
export const byCuisineAndNeighbourhood = (cuisine='all', neighbourhood='all') => {
  const filterCuisine = compose(eq(cuisine), prop('cuisine_type'));
  const filterNeighbourhood = compose(eq(neighbourhood), prop('neighbourhood'));
  return (
      cuisine != 'all' && neighbourhood != 'all' ? and(filterCuisine, filterNeighbourhood)
    : cuisine != 'all' ? filterCuisine
    : neighbourhood != 'all' ? filterNeighbourhood
    : x => x
  );
};
