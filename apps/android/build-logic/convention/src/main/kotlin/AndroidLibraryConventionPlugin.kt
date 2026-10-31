import com.android.build.api.dsl.LibraryExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.dependencies
import org.recitelabs.dadalink.buildlogic.configureKotlinAndroid
import org.recitelabs.dadalink.buildlogic.lib
import org.recitelabs.dadalink.buildlogic.libs
import org.recitelabs.dadalink.buildlogic.versionInt

class AndroidLibraryConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            apply(plugin = "com.android.library")

            extensions.configure<LibraryExtension> {
                configureKotlinAndroid(this)
                lint.targetSdk = libs.versionInt("targetSdk")
                testOptions.targetSdk = libs.versionInt("targetSdk")
                defaultConfig.testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
                // Each library gets its own resource prefix-free namespace derived from its path.
                namespace = "org.recitelabs.dadalink" + path.replace(':', '.').replace('-', '_')
            }

            dependencies {
                add("testImplementation", libs.lib("junit4"))
                add("testImplementation", libs.lib("kotlinx-coroutines-test"))
                add("testImplementation", libs.lib("turbine"))
            }
        }
    }
}
