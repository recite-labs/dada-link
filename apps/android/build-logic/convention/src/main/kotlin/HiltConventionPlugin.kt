import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply
import org.gradle.kotlin.dsl.dependencies
import org.recitelabs.dadalink.buildlogic.lib
import org.recitelabs.dadalink.buildlogic.libs

/** Hilt for Android modules, Dagger/Hilt-core for pure JVM modules. KSP everywhere. */
class HiltConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            apply(plugin = "com.google.devtools.ksp")
            dependencies {
                add("ksp", libs.lib("hilt-compiler"))
            }

            pluginManager.withPlugin("org.jetbrains.kotlin.jvm") {
                dependencies { add("implementation", libs.lib("hilt-core")) }
            }
            pluginManager.withPlugin("com.android.base") {
                apply(plugin = "com.google.dagger.hilt.android")
                dependencies { add("implementation", libs.lib("hilt-android")) }
            }
        }
    }
}
