package com.stellamobile.app

import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    companion object {
        private const val TAG = "StellaMainActivity"
        const val WAKE_ACTION_ASSIST = "android.intent.action.ASSIST"
        const val WAKE_ACTION_VOICE = "android.intent.action.VOICE_COMMAND"
    }

    override fun getMainComponentName(): String = "StellaMobile"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(
            this,
            mainComponentName,
            DefaultNewArchitectureEntryPoint.getFabricEnabled()
        )
    }

    /** Handle wake gesture intents (ASSIST / VOICE_COMMAND) that replace Google Assistant */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        val action = intent.action
        when (action) {
            WAKE_ACTION_ASSIST, WAKE_ACTION_VOICE -> {
                Log.d(TAG, "Wake gesture detected: $action — waking Stella")
                // Bring app to foreground; JS-side DeviceAssistantService handles wake
                // via AppState change detection
            }
        }
        setIntent(intent)
    }
}
