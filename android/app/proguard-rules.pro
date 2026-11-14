# Stella Mobile — ProGuard rules for release builds

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# React Native Navigation
-keep class com.facebook.react.modules.** { *; }

# Hermes
-keep class com.facebook.jni.** { *; }

# Native modules
-keep class com.stellamobile.app.** { *; }

# Keep names for native module methods
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
  @com.facebook.react.bridge.ReactMethod <methods>;
}

# expo-crypto
-keep class expo.modules.crypto.** { *; }

# Avoid obfuscating model files and assets
-keep class com.stellamobile.app.models.** { *; }