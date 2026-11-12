package com.stellamobile.app

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost
import com.stellamobile.app.services.StellaService
import com.stellamobile.app.receivers.BootReceiver

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        StellaService.init(this)
    }

    val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override fun getPackages(): List<ReactPackage> {
            return PackageList(this).packages
        }

        override fun getJsMainModuleName(): String = "index"
    }

    override fun getReactNativeHost(): ReactNativeHost = reactNativeHost
}
