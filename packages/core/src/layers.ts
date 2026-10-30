import { Layer } from "effect"
import { AgencyChecker } from "./agencies/AgencyChecker.ts"
import { ContentCatalog } from "./content/ContentCatalog.ts"
import { HelpDirectory } from "./directory/HelpDirectory.ts"

/** Catalogue use cases; requires the catalogue ports. */
export const CatalogServicesLive = Layer.mergeAll(ContentCatalog.layer, HelpDirectory.layer, AgencyChecker.layer)
