import com.android.build.api.dsl.ApplicationExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply
import org.gradle.kotlin.dsl.configure
import org.recitelabs.dadalink.buildlogic.configureAndroidCompose
import org.recitelabs.dadalink.buildlogic.configureKotlinAndroid
import org.recitelabs.dadalink.buildlogic.libs
import org.recitelabs.dadalink.buildlogic.versionInt

class AndroidApplicationConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            apply(plugin = "com.android.application")
            apply(plugin = "org.jetbrains.kotlin.plugin.compose")

            extensions.configure<ApplicationExtension> {
                configureKotlinAndroid(this)
                configureAndroidCompose(this)
                defaultConfig.targetSdk = libs.versionInt("targetSdk")
            }
        }
    }
}
