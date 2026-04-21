package com.soulpharma.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.util.Log

/**
 * Restarts the LocationForegroundService after device reboot.
 * Requires RECEIVE_BOOT_COMPLETED permission in the manifest.
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED &&
            intent.action != "android.intent.action.QUICKBOOT_POWERON"
        ) return

        val prefs: SharedPreferences =
            context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)

        val token = prefs.getString("token", null)
        if (token.isNullOrBlank()) {
            Log.i("SoulBoot", "No token stored — not restarting tracker")
            return
        }

        val empId   = prefs.getString("empId", "") ?: ""
        val empName = prefs.getString("empName", "") ?: ""

        Log.i("SoulBoot", "Boot complete — restarting tracker for $empName")

        val serviceIntent = Intent(context, LocationForegroundService::class.java).apply {
            action = LocationForegroundService.ACTION_START
            putExtra("token", token)
            putExtra("empId", empId)
            putExtra("empName", empName)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }
    }
}
