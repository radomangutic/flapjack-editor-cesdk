export function removeSpecialCharacters(inputString: string | undefined) {
  if (!inputString) {
    return "";
  }
  const cleanedString = inputString.replace(
    /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/'"]/g,
    ""
  );
  return cleanedString;
}
