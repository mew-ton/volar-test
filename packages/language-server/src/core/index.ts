import {
  type LanguagePlugin,
} from "@volar/language-server/node.js";
import { type default as TypeScript } from "typescript";
import { YuniVirtualCode } from "./YuniVirtualCode.ts";
import { LANGUAGE_ID } from "./constants.ts";

export function coreLanguageModule(
  ts: typeof TypeScript
): LanguagePlugin<YuniVirtualCode> {
  return {
    getLanguageId(scriptId) {
      if (scriptId.endsWith(".yuni")) {
        return LANGUAGE_ID;
      }
    },

    createVirtualCode(scriptId, languageId, snapshot) {
      if (languageId === "yuni") {
        return new YuniVirtualCode(scriptId, snapshot);
      }
    },

    updateVirtualCode(_scriptId, virtualCode, newSnapshot) {
      virtualCode.update(newSnapshot)
      return virtualCode;
    },

    // typescript: {
    //   extraFileExtensions: [
    //     { extension: ".yuni", isMixedContent: true, scriptKind: 7 },
    //   ],

    //   getServiceScript(_yuniCode) {
    //     return undefined;
    //   },

    //   getExtraServiceScripts(fileName, yuniCode) {
    //     const result: ExtraServiceScript[] = [];
    //     for (const code of forEachEmbeddedCode(yuniCode)) {
    //       if (code.id.endsWith(".mjs") || code.id.endsWith(".mts")) {
    //         const fileExtension = code.id.endsWith(".mjs") ? ".mjs" : ".mts";
    //         result.push({
    //           fileName: fileName + "." + code.id,
    //           code,
    //           extension: fileExtension,
    //           scriptKind:
    //             fileExtension === ".mjs"
    //               ? (1 satisfies ScriptKind.JS)
    //               : (3 satisfies ScriptKind.TS),
    //         });
    //       }
    //     }
    //     return result;
    //   },
    // },
  };
}

