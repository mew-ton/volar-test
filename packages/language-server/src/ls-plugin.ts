import type {
  Connection,
  LanguagePlugin,
  LanguageServicePlugin,
  ServiceEnvironment,
  VirtualCode,
} from '@volar/language-server/node.js'
import { create as createHtmlService } from 'volar-service-html'
import { create as createCssService } from 'volar-service-css'
import type { default as TypeScript } from 'typescript'
import { coreLanguageModule } from './core/index.ts'

export function getLanguagePlugin(
  connection: Connection,
  ts: typeof TypeScript,
  serviceEnv: ServiceEnvironment,
  tsconfig: string | undefined,
): LanguagePlugin<VirtualCode>[] {
  return [coreLanguageModule(ts)]
}

export function getLanguageServicePlugins(connection: Connection, ts: typeof TypeScript): LanguageServicePlugin[] {
  return [createHtmlService(), createCssService()]
}
