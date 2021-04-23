import { getPersistentValue } from "react-use-persistent";
import { ColumnItem } from "../hooks/usePersistentColumns";

export const persistentColumnsRef = getPersistentValue<ColumnItem[]>("columns", []);