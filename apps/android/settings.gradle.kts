pluginManagement {
    includeBuild("build-logic")
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
    }
}

rootProject.name = "dadalink"

enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

include(":app")

include(":core:common")
include(":core:model")
include(":core:domain")
include(":core:designsystem")
include(":core:ui")
include(":core:security")
include(":core:datastore")
include(":core:database")
include(":core:network")
include(":core:content")
include(":core:data")
include(":core:testing")

include(":feature:onboarding")
include(":feature:home")
include(":feature:help")
include(":feature:sos")
include(":feature:log")
include(":feature:assistant")
include(":feature:journey")
include(":feature:health")
include(":feature:disguise")
