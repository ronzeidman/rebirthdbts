export function camelToSnake(name: string) {
  const upperChars = name.match(/([A-Z])/g);
  if (!upperChars) {
    return name;
  }
  upperChars.forEach(upperChar => {
    name = name.replace(upperChar, '_' + upperChar.toLowerCase());
  });

  if (name.startsWith('_')) {
    name = name.substring(1);
  }
  return name;
}
