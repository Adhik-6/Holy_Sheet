export interface LlamaPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
