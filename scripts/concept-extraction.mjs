const tidy = (value) => value.replace(/\s+/g, " ").trim();

export function conceptsFromContentElement(value) {
  const phrase = tidy(value);
  if (!phrase) return [];

  const pairedModifier = phrase.match(/^(.+적)⋅(.+적)\s+(.+)$/);
  if (pairedModifier) {
    return [`${pairedModifier[1]} ${pairedModifier[3]}`, `${pairedModifier[2]} ${pairedModifier[3]}`];
  }

  const structureAndFunction = phrase.match(/^(.+?)의\s+(구조|특성)와\s+(기능|역할)$/);
  if (structureAndFunction) {
    const subject = tidy(structureAndFunction[1]);
    return [subject, `${subject}의 ${structureAndFunction[2]}`, `${subject}의 ${structureAndFunction[3]}`];
  }

  const conjunction = phrase.match(/^(.+?)(?:과|와)\s+(.+)$/);
  if (conjunction) {
    const left = tidy(conjunction[1]);
    const right = tidy(conjunction[2]);
    const concepts = [left];
    const possessive = right.match(/^(.+?)의\s+(.+)$/);
    if (possessive) {
      concepts.push(tidy(possessive[1]));
      if (!/^(?:관계|공통점|차이점|관련성)$/.test(tidy(possessive[2]))) concepts.push(right);
    } else {
      concepts.push(right);
    }
    return [...new Set(concepts.filter((item) => item.length >= 2))];
  }

  return [phrase];
}
