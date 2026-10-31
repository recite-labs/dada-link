plugins {
    alias(libs.plugins.dadalink.android.library)
    alias(libs.plugins.dadalink.hilt)
    alias(libs.plugins.kotlin.serialization)
}

dependencies {
    api(projects.core.model)
    implementation(projects.core.common)
    implementation(libs.kotlinx.serialization.json)
}
