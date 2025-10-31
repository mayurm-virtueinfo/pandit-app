import translate from 'google-translate-api-x';

const TRANSLATE_CONFIG = {
  tld: 'com',
};

export interface TranslatableItem {
  [key: string]: any;
}

// Translate a single string
export const translateText = async (
  text: string,
  targetLang: string,
): Promise<string> => {
  if (!text || typeof text !== 'string') return text;
  if (targetLang === 'en') return text;
  try {
    const {text: translatedText} = await translate(text, {
      to: targetLang,
      ...TRANSLATE_CONFIG,
    });
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

// Translate a single object's fields
export const translateOne = async (
  item: TranslatableItem,
  targetLang: string,
  fieldsToTranslate: string[],
): Promise<TranslatableItem> => {
  const translated = {...item};
  for (const field of fieldsToTranslate) {
    if (translated[field]) {
      // Translate simple string fields (like title, short_description)
      if (typeof translated[field] === 'string') {
        translated[field] = await translateText(translated[field], targetLang);
      }
      // Translate name in array fields (like [{"name": "Item 1","quantity": "1","units": "kg"}, {"name": "Item 2","quantity": "2","units": "kg"}])
      else if (Array.isArray(translated[field])) {
        translated[field] = await Promise.all(
          translated[field].map(async (subItem: any) => {
            if (typeof subItem === 'string') {
              return await translateText(subItem, targetLang);
            }
            // Handle other arrays (e.g., user_arranged_items, pandit_arranged_items)
            return {
              ...subItem,
              name: subItem.name
                ? await translateText(subItem.name, targetLang)
                : subItem.name,
            };
          }),
        );
      }
    }
  }
  return translated;
};

export const translateData = async (
  data: TranslatableItem | TranslatableItem[],
  targetLang: string,
  fieldsToTranslate: string[],
): Promise<TranslatableItem | TranslatableItem[]> => {
  if (targetLang === 'en') {
    return data;
  }
  // If data is an array, translate each item
  if (Array.isArray(data)) {
    return Promise.all(
      data.map(item => translateOne(item, targetLang, fieldsToTranslate)),
    );
  }
  // If data is a single object, translate it
  return translateOne(data, targetLang, fieldsToTranslate);
};
