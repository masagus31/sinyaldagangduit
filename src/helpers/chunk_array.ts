// take an array of length n and return an array of arrays of length n
export function chunkArray(array: any[], size: number) {
  const chunkedArr = [];
  let index = 0;
  while (index < array.length) {
    chunkedArr.push(array.slice(index, size + index));
    index += size;
  }
  return chunkedArr;
}
