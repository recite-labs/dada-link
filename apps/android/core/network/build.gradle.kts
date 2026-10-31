plugins {
    alias(libs.plugins.dadalink.android.library)
    alias(libs.plugins.dadalink.hilt)
    alias(libs.plugins.kotlin.serialization)
}

android {
    buildFeatures {
        buildConfig = true
    }
    defaultConfig {
        // Same origin serves the web app and the API. Override for a local server, e.g.
        // -Pdadalink.apiBaseUrl=http://10.0.2.2:3000 (apps/server-node on the host, from the emulator).
        val baseUrl = providers.gradleProperty("dadalink.apiBaseUrl").getOrElse("https://dadalink.recitelabs.com")
        buildConfigField("String", "API_BASE_URL", "\"$baseUrl\"")
    }
}

// OpenApiContractTest reads the backend contract straight from the monorepo.
val openApiSpec = rootProject.layout.projectDirectory.file("../../packages/api/openapi.json")
tasks.withType<Test>().configureEach {
    inputs.file(openApiSpec).withPathSensitivity(PathSensitivity.RELATIVE).withPropertyName("openApiSpec")
    systemProperty("dadalink.openapi", openApiSpec.asFile.absolutePath)
}

dependencies {
    api(projects.core.model)
    implementation(projects.core.common)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.okhttp)
    implementation(libs.kotlinx.serialization.json)

    testImplementation(libs.ktor.client.mock)
}
