# kotlinx.serialization: keep generated serializers for navigation routes and DTOs.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers @kotlinx.serialization.Serializable class ** {
    *** Companion;
    kotlinx.serialization.KSerializer serializer(...);
}

# SQLCipher uses JNI.
-keep class net.zetetic.database.** { *; }
