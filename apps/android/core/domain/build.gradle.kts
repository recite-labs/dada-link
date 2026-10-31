plugins {
    alias(libs.plugins.dadalink.jvm.library)
    alias(libs.plugins.dadalink.hilt)
}

dependencies {
    api(projects.core.model)
    api(projects.core.common)
    api(libs.kotlinx.coroutines.core)
}

dependencies {
    testImplementation(projects.core.testing)
}
