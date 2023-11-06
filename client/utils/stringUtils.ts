export const tupleArrayStringToArray = (tupleArray:string) => {
  // Remove square brackets and split into subarrays
  console.log(tupleArray)
  const cleanedString = tupleArray.replace(/\[\(/g, '').replace(/\)\]/g, '');
  console.log(cleanedString);
  const subArrays = cleanedString.split('),');
  console.log(subArrays);

  // Parse and convert the subarrays to arrays
  const parsedArrays = subArrays.map((subArray) => {
    const values = subArray.split(',').map((value) => value.trim());
    return values;
  });

  console.log(parsedArrays);
  return parsedArrays;
}

export const maxNCharacters = (string:string, n:number) => {
  if (string.length > n) {
    return `${string.substring(0, n)}...`;
  }
  return string;
}