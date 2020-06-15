import { _ } from './framework.min.js';

import { enums } from './enums.min.js';
import { item } from './item.min.js';

export const wrappers = {
   item: item(_, enums)
};
