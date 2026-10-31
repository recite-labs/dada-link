plugins {
    alias(libs.plugins.dadalink.jvm.library)
}

dependencies {
    api(projects.core.domain)
    api(projects.core.model)
    api(libs.junit4)
    api(libs.kotlinx.coroutines.test)
    api(libs.turbine)
}
