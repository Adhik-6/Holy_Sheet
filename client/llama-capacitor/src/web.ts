import { WebPlugin } from '@capacitor/core';

import type { LlamaPluginPlugin } from './definitions';

export class LlamaPluginWeb extends WebPlugin implements LlamaPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
