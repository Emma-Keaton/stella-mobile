package com.stellamobile.app.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "android.intent.action.BOOT_COMPLETED"
            || intent.action == "android.intent.action.MY_PACKAGE_REPLACED") {
            val serviceIntent = Intent(context, com.stellamobile.app.services.StellaService::class.java)
            context.startForegroundService(serviceIntent)
        }
    }
}
