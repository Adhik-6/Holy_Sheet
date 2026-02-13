import { registerPlugin } from '@capacitor/core';

import type { LlamaPluginPlugin } from './definitions';

const LlamaPlugin = registerPlugin<LlamaPluginPlugin>('LlamaPlugin', {
  web: () => import('./web').then((m) => new m.LlamaPluginWeb()),
});

export * from './definitions';
export { LlamaPlugin };
