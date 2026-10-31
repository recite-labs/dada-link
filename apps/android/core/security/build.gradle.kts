plugins {
    alias(libs.plugins.dadalink.android.library)
    alias(libs.plugins.dadalink.hilt)
}

dependencies {
    implementation(projects.core.common)
    implementation(libs.androidx.core.ktx)
}
