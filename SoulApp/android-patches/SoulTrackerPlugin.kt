package com.soulpharma.app

import android.content.Intent
import android.os.Build
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "SoulTracker")
class SoulTrackerPlugin : Plugin() {

    @PluginMethod
    fun startService(call: PluginCall) {
        val token   = call.getString("token", "") ?: ""
        val empId   = call.getString("empId", "") ?: ""
        val empName = call.getString("empName", "") ?: ""

        val intent = Intent(context, LocationForegroundService::class.java).apply {
            action = LocationForegroundService.ACTION_START
            putExtra("token", token)
            putExtra("empId", empId)
            putExtra("empName", empName)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }

        call.resolve(JSObject().put("started", true))
    }

    @PluginMethod
    fun stopService(call: PluginCall) {
        val intent = Intent(context, LocationForegroundService::class.java).apply {
            action = LocationForegroundService.ACTION_STOP
        }
        context.startService(intent)
        call.resolve(JSObject().put("stopped", true))
    }

    @PluginMethod
    fun updateNotification(call: PluginCall) {
        val message = call.getString("message", "Tracking active") ?: "Tracking active"
        val intent = Intent(context, LocationForegroundService::class.java).apply {
            action = LocationForegroundService.ACTION_UPDATE_NOTIF
            putExtra("message", message)
        }
        context.startService(intent)
        call.resolve(JSObject().put("updated", true))
    }

    @PluginMethod
    fun isRunning(call: PluginCall) {
        val running = LocationForegroundService.isRunning
        call.resolve(JSObject().put("running", running))
    }
}
