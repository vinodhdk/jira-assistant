interface Array<T> {
  //GroupBy(func: (x: T) => any): Array<any>
  ToArray(): Array<T>
  // Returns array
  Where(func: (x: T) => boolean, maxItems?: number): Array<T>
  Select<X>(func?: (x: T) => X, includeNulls?: boolean): Array<X>
  OrderBy(func?: (x: T) => any): Array<T>
  OrderByDescending(func: any): Array<T>
  SelectMany<X>(func: (x: T) => X): Array<X>
  Distinct<X>(func: (x: T) => X): Array<X>
  DistinctObj<X>(func: (x: T) => X): Array<X>
  Reverse(): Array<T>
  Concat(array: Array<T>): Array<T>
  Intersect<X>(secondArray: Array<X>, func: (item1: T, index: number, item2: X, index2: number) => boolean): Array<T>

  // numeric return type
  Sum(func?: (x: T) => number): number
  Avg(func?: (x: T) => number): number
  Max(func?: (x: T) => number): number
  Min(func?: (x: T) => number): number
  Count(func?: (x: T) => boolean): number

  // Boolean return types
  Any(func?: (x: T) => boolean): boolean
  All(func: (x: T) => boolean): boolean
  ContainsAny(aray: Array<T>): boolean
  AddDistinct(item: T): boolean

  // Single value return types
  First(func?: (x: T) => boolean): T
  Last(func?: (x: T) => boolean): T
  ElementAt(index: number): T
  DefaultIfEmpty(defaultValue: T): T
  ElementAtOrDefault(index: number, defaultValue: T): T
  FirstOrDefault(defaultValue: T, func?: (x: T) => boolean): T
  LastOrDefault(defaultValue: T, func?: (x: T) => boolean): T
  Add(item: T): T
  InsertAt(index: number, item: T): T
  ToString(seperator?: string): string

  ForEach(func: (x: T, i?: number, opt?: ListOptions<T>) => void): Array<T>
  Remove(func: (x: T) => boolean): Array<T>
  RemoveAt(index: number, count?: number): Array<T>
  RemoveAll(func?: (x: T) => boolean): Array<T>
  RemoveAll(array: T[]): Array<T>
  AddRange(items: Array<T>): Array<T>
  InsertRangeAt(index: number, ...item: T[]): T
  AddDistinctRange(items: Array<T>): Array<T>
  Replace(item: T, newItem: T): Array<T>
  Clone(items?: Array<T>): Array<T>
  Skip(count: number): Array<T>
  Take(count: number): Array<T>
  Union<X>(func?: (x: T) => Array<X>): Array<X>

  NotIn<X>(items: X[], func?: (item: T, ignoreItem: X) => boolean): Array<T>
  NotIn(items: string[], ignoreCase: boolean): Array<T>

  In<X>(items: X[], func?: (item: T, filterItem: X) => boolean): Array<T>
  In(items: string[], ignoreCase: boolean): Array<T>

  GroupBy<X>(func: (x: T) => X): Array<LinqGroup<X, T>>
  InnerJoin<X>(array: Array<X>, onclause: (left: T, right: X) => boolean): Array<LinqJoinedTable<T, X>>
  LeftJoin<X>(rightArray: Array<X>, onclause: (left: T, right: X) => boolean): Array<LinqJoinedTable<T, X>>
  RightJoin<X>(rightArray: Array<X>, onclause: (left: T, right: X) => boolean): Array<LinqJoinedTable<T, X>>
}

interface LinqGroup<X, T> {
  key: X
  values: Array<T>
}

interface LinqJoinedTable<T, X> {
  left: T
  right: X
}

interface ListOptions<T> {
  prev: T
  next: T
  count: number
  isLast: boolean
  isFirst: boolean
}
