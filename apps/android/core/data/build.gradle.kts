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
        val useFakes = providers.gradleProperty("dadalink.useFakeBackend").getOrElse("true").toBoolean()
        buildConfigField("boolean", "USE_FAKE_BACKEND", useFakes.toString())
    }
}

dependencies {
    api(projects.core.domain)
    implementation(projects.core.common)
    implementation(projects.core.security)
    implementation(projects.core.datastore)
    implementation(projects.core.database)
    implementation(projects.core.network)
    implementation(projects.core.content)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.work.runtime)
    implementation(libs.androidx.hilt.work)
    ksp(libs.androidx.hilt.compiler)
    implementation(libs.kotlinx.serialization.json)

    testImplementation(projects.core.testing)
    testImplementation(libs.robolectric)
    testImplementation(libs.androidx.test.core)
}
