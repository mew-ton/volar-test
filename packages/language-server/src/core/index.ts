import type {
  ExtraServiceScript,
  LanguagePlugin,
  VirtualCode,
} from "@volar/language-server/node.js";
import type { ScriptKind, default as TypeScript } from "typescript";
import { parseYuniCode } from "./parse.ts";
import { LANGUAGE_ID } from "./constants.ts";
import { forEachEmbeddedCode } from "@volar/language-core";

export function coreLanguageModule(
  ts: typeof TypeScript
): LanguagePlugin<VirtualCode> {
  return {
    getLanguageId(scriptId) {
      if (scriptId.endsWith(".yuni")) {
        return LANGUAGE_ID;
      }
    },

    createVirtualCode(scriptId, languageId, snapshot) {
      if (languageId === "yuni") {
        console.info("Creating virtual code for", scriptId);
        return parseYuniCode(scriptId, snapshot);
      }
    },

    updateVirtualCode(_scriptId, virtualCode, newSnapshot) {
      return parseYuniCode(virtualCode.id, newSnapshot);
    },

    typescript: {
      extraFileExtensions: [
        { extension: ".yuni", isMixedContent: true, scriptKind: 7 satisfies ScriptKind.Deferred },
      ],

      getServiceScript(_yuniCode) {
        return undefined;
      },

      getExtraServiceScripts(fileName, yuniCode) {
        const result: ExtraServiceScript[] = [];
        for (const code of forEachEmbeddedCode(yuniCode)) {
          if (code.languageId === "javascript") {
            result.push({
              fileName: `${fileName}.${code.id}`,
              code,
              extension: ".js",
              scriptKind: 1 satisfies ScriptKind.JS,
            });
          } else if (code.languageId === "typescript") {
            result.push({
              fileName: `${fileName}.${code.id}`,
              code,
              extension: ".ts",
              scriptKind: 3 satisfies ScriptKind.TS,
            });
          }
        }
        return result;
      },
    },
  };
}
