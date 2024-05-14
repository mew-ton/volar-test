import {
  type Stack,
  type Mapping,
  type ExtraServiceScript,
  forEachEmbeddedCode,
} from "@volar/language-core";
import {
  type CodeMapping,
  type LanguagePlugin,
  type VirtualCode,
} from "@volar/language-server/node.js";
import { type default as TypeScript, type ScriptKind, type IScriptSnapshot } from "typescript";
import { LANGUAGE_ID } from "./constants.ts";
import { parse } from 'yaml'

export class YuniVirtualCode implements VirtualCode {
  id = "root";

  languageId = LANGUAGE_ID;

  mappings!: CodeMapping[];

  embeddedCodes!: VirtualCode[];

  codegenStacks = []





  constructor(
    public readonly fileName: string,
    public readonly snapshot: IScriptSnapshot
  ) {
    this.onSnapshotUpdated();
  }

  private onSnapshotUpdated() {
    this.mappings = [{
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [this.snapshot.getLength()],
      data: {
        verification: true,
        completion: true,
        semantic: true,
        navigation: true,
        structure: true,
        format: true,
      }
    }];
    this.codegenStacks = [];
    
    const snapshotContent = this.snapshot.getText(0, this.snapshot.getLength());
    this.embeddedCodes = parseYuniCode(snapshotContent);


  }

  public update(snapshot: IScriptSnapshot) {

  }
}

export function parseYuniCode(code: string): VirtualCode[] {
  const yaml = parse(code)

  
}