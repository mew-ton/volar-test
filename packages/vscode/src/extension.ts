import * as serverProtocol from "@volar/language-server/protocol.js";
import {
  type BaseLanguageClient,
  activateAutoInsertion,
  createLabsInfo,
  getTsdk,
  type LabsInfo,
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

export async function activate(context: ExtensionContext): Promise<LabsInfo> {
  const { fsPath: serverFsPath } = Uri.joinPath(
    context.extensionUri,
    "node_modules",
    "language-server",
    "dist",
    "index.js"
  );

  const runOptions = { execArgv: [] as string[] };

  const debugOptions = { execArgv: ["--nolazy", `--inspect=${INSPECT}`] };

  const serverOptions = {
    run: {
      module: serverFsPath,
      transport: TransportKind.ipc,
      options: runOptions,
    },
    debug: {
      module: serverFsPath,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  } as const satisfies ServerOptions;

  const clientOptions = {
    documentSelector: [{ language: "yuni" }],
    initializationOptions: {
      typescript: {
        tsdk: (await getTsdk(context)).tsdk,
      },
    },
  } as const satisfies LanguageClientOptions;

  client = new LanguageClient(
    "yuni-language-server",
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

export async function deactivate(): Promise<void> {
  await client?.stop();
}
