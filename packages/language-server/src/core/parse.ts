import type { VirtualCode } from "@volar/language-server/node.js";
import type { TextDocument } from "vscode-languageserver-textdocument";
import type { IScriptSnapshot } from "typescript";
import { KEY_NAME, KEY_RENDER, KEY_SCRIPT, KEY_STYLE } from "./constants.ts";
import { type Document, parseAllDocuments, type EmptyStream } from "yaml";
import type { ComponentNode, UnknownNode } from "./type.ts";
import { Mapping, SourceMap, SourceMapWithDocuments } from "@volar/language-service";

export function parseYuniCode(
  filename: string,
  snapshot: IScriptSnapshot
): VirtualCode {
  return {
    id: "root",
    languageId: "yaml",
    snapshot,
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [snapshot.getLength()],
        data: {
          verification: true,
          completion: true,
          semantic: true,
          navigation: true,
          structure: true,
          format: true,
        },
      },
    ],
    embeddedCodes: parseVirtualCodes(filename, snapshot),
  };
}

function parseVirtualCodes(
  fileName: string,
  snapshot: IScriptSnapshot
): VirtualCode[] {
  const code = snapshot.getText(0, snapshot.getLength());
  const nodes = parseAllDocuments<UnknownNode, true>(code, {
    schema: "failsafe",
    // TODO: custom tags
  });

  if (isEmpty(nodes)) {
    return [];
  }

  const createComponentName = (
    node: Document<ComponentNode>,
    index: number
  ): string => {
    const definedName = node.contents?.get(KEY_NAME)?.value;

    if (definedName) {
      return definedName;
    }

    return nodes.length === 1 ? fileName : `${fileName}__${index}`;
  };

  const components = nodes
    .filter(validateRootNode)
    .flatMap((n, i) => parseComponent(snapshot, createComponentName(n, i), n));

  return components;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function isEmpty(target: EmptyStream | Document<any>[]): target is EmptyStream {
  return (target as EmptyStream).empty;
}

function validateRootNode(
  document: Document<UnknownNode>
): document is Document<ComponentNode> {
  return document.has(KEY_NAME) && document.has(KEY_RENDER);
}

function parseComponent(
  snapshot: IScriptSnapshot,
  componentName: string,
  document: Document<ComponentNode>
): VirtualCode[] {
  const embeddedCodes: VirtualCode[] = [];

  const componentRender = document.contents?.get(KEY_RENDER);

  if (!componentRender) {
    throw new Error("Component render is required");
  }

  for (const item of document.contents?.items ?? []) {
    const nodeStart = (item.value?.range?.[0] ?? 0) - 1;

    if (nodeStart < 0 || item.key?.value === KEY_NAME) {
      continue;
    }
    const isBreakLineAs2Char = snapshot.getText(0, snapshot.getLength()).includes("\r\n");
    const startPos = nodeStart + 2 + (isBreakLineAs2Char ? 2 : 1);
    const parsedScript = item.value?.value ?? "";
    const lines = parsedScript.split("\n").length
    const virtualScript = snapshot.getText(startPos, startPos + parsedScript.length + lines * 2)

    const commonEmbeddedCodes = {
      snapshot: {
        getText: (start, end) => {
          return virtualScript.slice(start, end);
        },
        getLength: () => virtualScript.length,
        getChangeRange: () => undefined,
      },
      content: parsedScript,
      virtualContent: virtualScript,
      range: item.value?.range ?? [-1. -1. -1],
      codegenStacks: [],
      linkedCodeMappings: [],
      embeddedCodes: [],
      mappings: [
        {
          sourceOffsets: [startPos],
          generatedOffsets: [0],
          lengths: [virtualScript.length],
          data: {
            verification: true,
            completion: true,
            semantic: true,
            navigation: true,
            structure: true,
            format: true,
          },
        },
      ],
    } satisfies Omit<VirtualCode, "id" | "languageId">;

    switch (item.key.value) {
      case KEY_SCRIPT: {
        embeddedCodes.push({
          id: `${componentName}.ts`,
          languageId: "typescript",
          ...commonEmbeddedCodes,
        });
        break;
      }
      case KEY_RENDER: {
        embeddedCodes.push({
          id: `${componentName}.html`,
          languageId: "html",
          ...commonEmbeddedCodes,
        });
        break;
      }
      case KEY_STYLE: {
        embeddedCodes.push({
          id: `${componentName}.css`,
          languageId: "css",
          ...commonEmbeddedCodes,
        });
        break;
      }
    }
  }

  console.dir(embeddedCodes, { depth: null })
  return embeddedCodes;
}

class SourceInYaml extends SourceMapWithDocuments {
}