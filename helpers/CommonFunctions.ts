export function removeSpecialCharacters(inputString: string | undefined) {
  if (!inputString) {
    return "";
  }
  // Updated regular expression to remove single quotes and dots
  const cleanedString = inputString.replace(/['"]/g, "");
  return cleanedString;
}
