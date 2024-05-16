import {
  createServer,
  createConnection,
  loadTsdkByPath,
  createTypeScriptProjectProvider,
} from '@volar/language-server/node.js'
import { getLanguagePlugin, getLanguageServicePlugins } from './ls-plugin.ts'

const connection = createConnection()
const server = createServer(connection)

connection.listen()

connection.onInitialize((params) => {
  console.log('yuni-language-server initializing...')
  const tsdk = params.initializationOptions?.typescript?.tsdk

  if (!tsdk) {
    throw new Error('The `typescript.tsdk` init optioin is rtequired.')
  }

  const { typescript, diagnosticMessages } = loadTsdkByPath(tsdk, params.locale)

  const initializeResult = server.initialize(
    params,
    getLanguageServicePlugins(connection, typescript),
    createTypeScriptProjectProvider(typescript, diagnosticMessages, (env, project) =>
      getLanguagePlugin(connection, typescript, env, project.configFileName),
    ),
  )

  console.log('yuni-language-server initialized.')
  return initializeResult
})

connection.onInitialized(() => {
  server.initialized()
  server.watchFiles(['**/*.yuni'])
})
connection.onShutdown(server.shutdown)
