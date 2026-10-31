package org.recitelabs.dadalink.buildlogic

import com.android.build.api.dsl.CommonExtension
import org.gradle.api.JavaVersion
import org.gradle.api.Project
import org.gradle.api.plugins.JavaPluginExtension
import org.gradle.api.tasks.testing.Test
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.withType
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile

private val JAVA_VERSION = JavaVersion.VERSION_17
private val JVM_TARGET = JvmTarget.JVM_17

/**
 * Shared Android configuration for application and library modules.
 * Kotlin is provided by AGP's built-in Kotlin support (AGP 9+).
 */
internal fun Project.configureKotlinAndroid(extension: CommonExtension) {
    extension.compileSdk = libs.versionInt("compileSdk")
    extension.defaultConfig.minSdk = libs.versionInt("minSdk")

    extension.compileOptions.sourceCompatibility = JAVA_VERSION
    extension.compileOptions.targetCompatibility = JAVA_VERSION
    // java.time on API 24/25.
    extension.compileOptions.isCoreLibraryDesugaringEnabled = true

    // Robolectric (Compose UI + screenshot tests) needs merged Android resources.
    extension.testOptions.unitTests.isIncludeAndroidResources = true

    extension.lint.abortOnError = true
    extension.lint.warningsAsErrors = false
    extension.lint.checkReleaseBuilds = false
    extension.lint.lintConfig = rootProject.file("lint.xml")

    configureKotlinCompile()

    // Robolectric's Android 16 runtime pokes JDK internals (FileDescriptor via SharedSecrets).
    tasks.withType<Test>().configureEach {
        jvmArgs(
            "--add-exports=java.base/jdk.internal.access=ALL-UNNAMED",
            "--add-opens=java.base/java.io=ALL-UNNAMED",
        )
    }

    dependencies {
        add("coreLibraryDesugaring", libs.lib("desugar-jdk-libs"))
    }
}

/** Plain Kotlin/JVM modules (domain, model). */
internal fun Project.configureKotlinJvm() {
    extensions.configure<JavaPluginExtension> {
        sourceCompatibility = JAVA_VERSION
        targetCompatibility = JAVA_VERSION
    }
    configureKotlinCompile()
}

private fun Project.configureKotlinCompile() {
    tasks.withType<KotlinJvmCompile>().configureEach {
        compilerOptions {
            jvmTarget.set(JVM_TARGET)
            freeCompilerArgs.add("-Xconsistent-data-class-copy-visibility")
        }
    }
}
