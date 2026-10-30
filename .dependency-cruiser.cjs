/**
 * Architectural boundaries for the DadaLink hexagon.
 *
 *   domain  <-  ports  <-  core  <-  server  <-  apps (composition roots)
 *                 ^          ^
 *                 |          +-- api (contract, depends on domain only)
 *                 +-- db / adapters / content-loader (driven adapters)
 *
 * Rules are expressed on resolved file paths, so they hold no matter whether a
 * module is imported by relative path or by its `@dadalink/*` package name.
 */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies make modules impossible to reason about in isolation.",
      from: {},
      to: { circular: true }
    },
    {
      name: "domain-is-pure",
      severity: "error",
      comment: "domain may only depend on `effect` itself; never on other workspace packages or platform code.",
      from: { path: "^packages/domain/src" },
      to: {
        pathNot: ["^packages/domain/src", "node_modules/effect/"],
        dependencyTypesNot: ["type-only"]
      }
    },
    {
      name: "ports-depend-on-domain-only",
      severity: "error",
      from: { path: "^packages/ports/src" },
      to: { pathNot: ["^packages/(domain|ports)/src", "node_modules/effect/"] }
    },
    {
      name: "core-depends-on-domain-and-ports-only",
      severity: "error",
      comment: "Use cases must not know about databases, HTTP, providers or deployment targets.",
      from: { path: "^packages/core/src" },
      to: { pathNot: ["^packages/(domain|ports|core)/src", "node_modules/effect/"] }
    },
    {
      name: "api-contract-depends-on-domain-only",
      severity: "error",
      comment: "The HttpApi contract is shared with clients; it must not leak server code.",
      from: { path: "^packages/api/src" },
      to: { pathNot: ["^packages/(domain|api)/src", "node_modules/effect/"] }
    },
    {
      name: "adapters-do-not-import-core-or-server",
      severity: "error",
      comment: "Driven adapters implement ports; they never reach into use cases or delivery code.",
      from: { path: "^packages/(db|adapters|content-loader)/src" },
      to: { path: "^packages/(core|server|api)/src" }
    },
    {
      name: "server-does-not-import-adapters",
      severity: "error",
      comment: "The delivery layer depends on ports and use cases; adapters are chosen by the apps.",
      from: { path: "^packages/server/src" },
      to: { path: "^packages/(db|adapters|content-loader)/src" }
    },
    {
      name: "packages-do-not-import-apps",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^apps/" }
    },
    {
      name: "src-does-not-import-tests",
      severity: "error",
      from: { path: "/src/" },
      to: { path: "/test/" }
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      from: {},
      to: { couldNotResolve: true }
    }
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: ["node_modules", "\\.wrangler", "dist", "coverage"] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.depcruise.json" },
    combinedDependencies: true,
    preserveSymlinks: false,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "types", "default"],
      extensions: [".ts", ".js", ".json"]
    },
    reporterOptions: {
      text: { highlightFocused: true }
    }
  }
}
