import * as serverProtocol from "@volar/language-server/protocol.js";
import {
  type BaseLanguageClient,
  activateAutoInsertion,
  createLabsInfo,
} from "@volar/vscode";
import { Uri, type ExtensionContext } from "vscode";
import {
  type ServerOptions,
  TransportKind,
  type LanguageClientOptions,
  LanguageClient,
} from "vscode-languageclient/node.js";

const INSPECT = 6000;

let client: BaseLanguageClient;

export async function activate(context: ExtensionContext) {
  const { fsPath: serverFsPath } = Uri.joinPath(
    context.extensionUri,
    "node_modules",
    "dist",
    "server.js"
  );

  const serverOptions = {
    run: {
      module: serverFsPath,
      transport: TransportKind.ipc,
      options: { execArgv: [] as string[] },
    },
    debug: {
      module: serverFsPath,
      transport: TransportKind.ipc,
      options: { execArgv: ["--nolazy", `--inspect=${INSPECT}`] },
    },
  } as const satisfies ServerOptions;

  const clientOptions = {
    documentSelector: [{ language: "yuni" }],
    initializationOptions: {},
  } as const satisfies LanguageClientOptions;

  client = new LanguageClient(
    "yuni",
    "Yuni Language Server",
    serverOptions,
    clientOptions
  );

  await client.start();

  activateAutoInsertion("yuni", client);

  const labsInfo = createLabsInfo(serverProtocol);
  labsInfo.addLanguageClient(client);
  return labsInfo.extensionExports;
}

export function deactivate(): Thenable<unknown> | void {
  return client?.stop();
}
