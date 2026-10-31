plugins {
    alias(libs.plugins.dadalink.jvm.library)
    alias(libs.plugins.dadalink.hilt)
}

dependencies {
    api(libs.kotlinx.coroutines.core)
}
