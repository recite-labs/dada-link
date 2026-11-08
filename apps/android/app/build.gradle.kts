import java.util.Properties

plugins {
    alias(libs.plugins.dadalink.android.application)
    alias(libs.plugins.dadalink.hilt)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.roborazzi)
}

/**
 * Play upload key, read from a private file outside the repository:
 * `-Pdadalink.signing=<path>` or `~/.config/dadalink/upload-signing.properties`
 * with `storeFile`, `storePassword`, `keyAlias`, `keyPassword`.
 * Without it, release builds are produced unsigned.
 */
val uploadSigning: Properties? =
    (providers.gradleProperty("dadalink.signing").orNull
        ?: "${System.getProperty("user.home")}/.config/dadalink/upload-signing.properties")
        .let(::file)
        .takeIf { it.isFile }
        ?.let { file -> Properties().apply { file.inputStream().use(::load) } }

android {
    signingConfigs {
        uploadSigning?.let { props ->
            create("upload") {
                storeFile = file(props.getProperty("storeFile"))
                storePassword = props.getProperty("storePassword")
                keyAlias = props.getProperty("keyAlias")
                keyPassword = props.getProperty("keyPassword")
            }
        }
    }

    namespace = "org.recitelabs.dadalink"

    defaultConfig {
        // Keeps the existing Play listing (Damakese → DadaLink).
        applicationId = "me.kibru.damakese"
        versionCode = 202
        versionName = "6.0.1"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    androidResources {
        // Only ship locales we actually translate.
        localeFilters += listOf("en", "am", "om")
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.findByName("upload")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            excludes += "/META-INF/versions/9/OSGI-INF/MANIFEST.MF"
        }
    }
}

roborazzi {
    outputDir.set(rootProject.layout.projectDirectory.dir("docs/screenshots"))
}

dependencies {
    implementation(projects.core.common)
    implementation(projects.core.model)
    implementation(projects.core.domain)
    implementation(projects.core.data)
    implementation(projects.core.designsystem)
    implementation(projects.core.ui)

    implementation(projects.feature.onboarding)
    implementation(projects.feature.home)
    implementation(projects.feature.help)
    implementation(projects.feature.sos)
    implementation(projects.feature.log)
    implementation(projects.feature.assistant)
    implementation(projects.feature.journey)
    implementation(projects.feature.health)
    implementation(projects.feature.disguise)

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.core.splashscreen)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.process)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.hilt.lifecycle.viewmodel.compose)
    implementation(libs.androidx.work.runtime)
    implementation(libs.androidx.hilt.work)
    ksp(libs.androidx.hilt.compiler)
    implementation(libs.kotlinx.serialization.json)

    testImplementation(projects.core.testing)
    testImplementation(libs.robolectric)
    testImplementation(libs.androidx.test.core)
    testImplementation(libs.androidx.compose.ui.test.junit4)
    testImplementation(libs.roborazzi)
    testImplementation(libs.roborazzi.compose)
    testImplementation(libs.roborazzi.junit.rule)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
