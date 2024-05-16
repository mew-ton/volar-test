import type { VirtualCode } from "@volar/language-server/node.js";
import type { IScriptSnapshot } from "typescript";
import { KEY_NAME, KEY_RENDER, KEY_SCRIPT } from "./constants.ts";
import { type Document, parseAllDocuments, type EmptyStream } from "yaml";
import type { ComponentNode, UnknownNode } from "./type.ts";

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
    .flatMap((n, i) => parseComponent(createComponentName(n, i), n));

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
  componentName: string,
  document: Document<ComponentNode>
): VirtualCode[] {
  const embeddedCodes: VirtualCode[] = [];

  const componentRender = document.contents?.get(KEY_RENDER);

  if (!componentRender) {
    throw new Error("Component render is required");
  }

  for (const item of document.contents?.items ?? []) {
    const startPos = (item.value?.range?.[0] ?? 0) - 1;
    const virtualScript = item.value?.value ?? "";

    if (startPos < 0 || item.key?.value === KEY_NAME) {
      continue;
    }

    const commonEmbeddedCodes = {
      snapshot: {
        getText: (start, end) => {
          return virtualScript.slice(start, end);
        },
        getLength: () => virtualScript.length,
        getChangeRange: () => undefined,
      },
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

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    switch (item.key.value!) {
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
    }
  }

  return embeddedCodes;
}
