const measureTranslations: Record<string, Record<string, string>> = {
  unit: {
    m3_s: 'm³/s',
    mAOD: 'm',
    mASD: 'm',
  },
  qualifiedParameter: {
    'level-stage': 'level',
    'level-downstage': 'downstream level',
  },
};

export const translateMeasureProperties = (measure: Record<string, string>) => {
  const translated: Record<string, string> = {};
  for (const prop in measure) {
    const value = measure[prop];
    if (measureTranslations[prop] && measureTranslations[prop][value]) {
      translated[prop] = measureTranslations[prop][value];
    } else {
      translated[prop] = value;
    }
  }
  return translated;
};
