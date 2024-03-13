/** @see https://tc39.es/proposal-array-grouping/#sec-map.groupby */
// already shipped in chrome, no type definition yet

type MapGroupBy = <T, G>(
  items: Iterable<T>,
  callbackfn: (value: T, index: number) => G,
) => Map<G, T[]>;

type MapWithGroupBy = typeof Map & { groupBy: MapGroupBy };

export default Map as MapWithGroupBy;
