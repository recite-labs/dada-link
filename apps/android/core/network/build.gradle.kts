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
        val baseUrl = providers.gradleProperty("dadalink.apiBaseUrl").getOrElse("https://api.dadalink.org/")
        buildConfigField("String", "API_BASE_URL", "\"$baseUrl\"")
    }
}

dependencies {
    api(projects.core.model)
    implementation(projects.core.common)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.okhttp)
    implementation(libs.ktor.client.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.kotlinx.serialization.json)

    testImplementation(libs.ktor.client.mock)
}
