import getAppDataPath from "appdata-path";
import * as Path from 'path'

const APPDATA = getAppDataPath("templatr");
const CACHE = Path.join(APPDATA, "cache");
const CONFIG = Path.join(APPDATA, ".templatrc");

export default {
  APPDATA,
  CACHE,
  CONFIG
}
