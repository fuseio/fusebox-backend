export function getDifference (setA: Set<any>, setB: Set<any>) {
  return [...[...setA].filter(element => !setB.has(element))]
}

export function getUnion (setA:Set<any>, setB: Set<any>) {
  return [...new Set([...setA, ...setB])]
}
