// S4 :: () -> str
const S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1);

// guid :: () -> str
const guid = () => `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;

// nameToId :: (str|any) -> str
export const nameToId = name =>
  typeof name !== 'string' ||
  name === '' ?
      guid()
    : name
      .trim()
      .toLowerCase()
      .replace(/\W+/g, '');
