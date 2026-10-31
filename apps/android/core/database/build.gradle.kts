plugins {
    alias(libs.plugins.dadalink.android.library)
    alias(libs.plugins.dadalink.hilt)
    alias(libs.plugins.dadalink.android.room)
}

dependencies {
    api(projects.core.model)
    // DadaDatabase is part of this module's API (consumers open it lazily off the main thread).
    api(libs.androidx.room.runtime)
    implementation(projects.core.security)
    implementation(libs.sqlcipher.android)
    api(libs.androidx.sqlite)

    testImplementation(libs.robolectric)
    testImplementation(libs.androidx.test.core)
}
