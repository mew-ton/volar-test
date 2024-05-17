import type { Node, YAMLMap, Scalar } from "yaml"
import type { KEY_NAME, KEY_SCRIPT, KEY_RENDER, KEY_STYLE } from "./constants"

export type RootKey = typeof KEY_NAME | typeof KEY_SCRIPT | typeof KEY_RENDER | typeof KEY_STYLE

export type ComponentNode = YAMLMap<Scalar<RootKey>, Scalar<string>>

export type UnknownNode = Node<unknown>
